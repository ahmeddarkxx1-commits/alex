import { NextRequest, NextResponse } from 'next/server';
import { dbGetFeedbacks, dbCreateFeedback, dbUpdateFeedback, dbDeleteFeedback } from '@/lib/db';
import { FeedbackStatus, FeedbackType } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as FeedbackStatus | 'الكل') || undefined;
    const type = (searchParams.get('type') as FeedbackType | 'الكل') || undefined;

    // 1. Try Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        let q = (supabase.from('feedbacks' as any) as any).select('*');
        if (status && status !== 'الكل') q = q.eq('status', status);
        if (type && type !== 'الكل') q = q.eq('type', type);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return NextResponse.json(data);
        }
      } catch (sbErr) {
        // fallback
      }
    }

    const list = dbGetFeedbacks({ status, type });
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching feedbacks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      student_id,
      contact_info,
      department_name,
      academic_year,
      section_number,
      type,
      title,
      message,
    } = body;

    if (!type || !title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'يرجى تحديد نوع الرسالة وكتابة العنوان والتفاصيل كاملة' },
        { status: 400 }
      );
    }

    // 1. Create in local database
    const created = dbCreateFeedback({
      name: (name || '').trim() || 'فاعل خير (طالب بالمعهد)',
      student_id: student_id || null,
      contact_info: (contact_info || '').trim() || 'لم تُحدد وسيلة تواصل',
      department_name: department_name || 'شعبة المساحة العامة',
      academic_year: academic_year || 'غير محدد',
      section_number: section_number || 'عام',
      type: (type as FeedbackType) || 'اقتراح',
      title: title.trim(),
      message: message.trim(),
      status: 'جديدة',
    });

    // 2. Sync to Supabase Cloud if available
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('feedbacks' as any) as any).insert(created);
      } catch (sbErr) {
        // Non-blocking if table is not yet migrated
      }
    }

    // 2. Dispatch real-time Telegram notification to Bot and Admin Channel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const targetChatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHANNEL_YEAR1_ID;

    let telegramSent = false;
    let telegramError: string | null = null;

    if (botToken && targetChatId) {
      try {
        let typeEmoji = '💡';
        if (type === 'شكوى') typeEmoji = '⚠️';
        else if (type === 'مشكلة تقنية') typeEmoji = '🔧';
        else if (type === 'استفسار') typeEmoji = '❓';

        let tgText = `📬 <b>[صندوق الشكاوى والمقترحات • معهد الإسكندرية]</b>\n\n`;
        tgText += `${typeEmoji} <b>نوع الرسالة:</b> ${type}\n`;
        tgText += `📌 <b>الموضوع:</b> ${title.trim()}\n\n`;
        tgText += `👤 <b>المرسل:</b> ${(name || '').trim() || 'طالب (بدون اسم)'}\n`;
        tgText += `📞 <b>وسيلة التواصل:</b> ${(contact_info || '').trim() || 'لم يتم ترك وسيلة تواصل'}\n`;
        tgText += `🏛️ <b>الفرقة والسكشن:</b> ${academic_year || 'شعبة المساحة العامة'} • ${section_number || 'عام'}\n\n`;
        tgText += `📝 <b>نص الرسالة:</b>\n`;
        tgText += `<blockquote>${message.trim()}</blockquote>\n\n`;
        tgText += `⏰ <i>${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}</i>\n`;
        tgText += `🔐 <i>معرف الشكوى في المنصة: <code>${created.id}</code></i>`;

        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: tgText,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json();
        telegramSent = Boolean(tgData.ok);
        if (!tgData.ok) telegramError = tgData.description;
      } catch (tgErr: any) {
        console.warn('Telegram feedback notify error:', tgErr);
        telegramError = tgErr.message;
      }
    }

    return NextResponse.json(
      {
        success: true,
        feedback: created,
        telegramSent,
        telegramError,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error submitting feedback' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف الرسالة مطلوب' }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const updated = dbUpdateFeedback(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 });
    }

    // Sync to Supabase Cloud if available
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('feedbacks' as any) as any).update(updates).eq('id', id);
      } catch {}
    }

    return NextResponse.json({ success: true, feedback: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating feedback' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الرسالة مطلوب' }, { status: 400 });
    }

    const success = dbDeleteFeedback(id);

    // Sync to Supabase Cloud if available
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('feedbacks' as any) as any).delete().eq('id', id);
      } catch {}
    }

    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting feedback' }, { status: 500 });
  }
}
