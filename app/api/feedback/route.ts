import { NextRequest, NextResponse } from 'next/server';
import { dbGetFeedbacks, dbCreateFeedback, dbUpdateFeedback, dbDeleteFeedback } from '@/lib/db';
import { Feedback, FeedbackStatus, FeedbackType } from '@/types/database';

export const dynamic = 'force-dynamic';

const DEFAULT_BOT_TOKEN = '5242659245:AAHJ34Sk7MkUpgVLFs7D8Z4qLZP6OHLE1yI';
// الشكاوى والمقترحات سرية وخاصة: تُرسل حصرياً على الخاص للمسؤول في البوت ولا تُنشر في القنوات
const ADMIN_PRIVATE_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || '1914514519';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as FeedbackStatus | 'الكل') || undefined;
    const type = (searchParams.get('type') as FeedbackType | 'الكل') || undefined;

    // 1. Try Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        // A) Try dedicated feedbacks table first
        let q = (supabase.from('feedbacks' as any) as any).select('*');
        if (status && status !== 'الكل') q = q.eq('status', status);
        if (type && type !== 'الكل') q = q.eq('type', type);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return NextResponse.json(data);
        }
      } catch {
        // fallback to system_feedback in announcements
      }

      try {
        // B) Reliable Supabase fallback: announcements with category 'system_feedback'
        const { data: rows, error: fbErr } = await (supabase.from('announcements' as any) as any)
          .select('*')
          .eq('category', 'system_feedback')
          .order('created_at', { ascending: false });

        if (!fbErr && Array.isArray(rows) && rows.length > 0) {
          let list: Feedback[] = [];
          for (const row of rows as any[]) {
            try {
              const item = JSON.parse(row.details) as Feedback;
              if (item && item.id) {
                if (!item.created_at) item.created_at = row.created_at;
                list.push(item);
              }
            } catch {
              // Ignore corrupted row
            }
          }

          if (status && status !== 'الكل') {
            list = list.filter((f) => f.status === status);
          }
          if (type && type !== 'الكل') {
            list = list.filter((f) => f.type === type);
          }
          return NextResponse.json(list);
        }
      } catch (err) {
        console.warn('Supabase feedback fallback read error:', err);
      }
    }

    // 2. Fallback to local file DB
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

    const targetId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Feedback = {
      id: targetId,
      name: (name || '').trim() || 'فاعل خير (طالب بالمعهد)',
      student_id: student_id || null,
      contact_info: (contact_info || '').trim() || 'لم تُحدد وسيلة تواصل',
      department_name: department_name || 'شعبة المساحة العامة',
      academic_year: academic_year || 'شعبة المساحة',
      section_number: section_number || 'عام',
      type: (type as FeedbackType) || 'اقتراح',
      title: title.trim(),
      message: message.trim(),
      status: 'جديدة',
      created_at: new Date().toISOString(),
    };

    // 1. Save to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      let savedToDedicated = false;
      try {
        const { error: insErr } = await (supabase.from('feedbacks' as any) as any).insert(newRecord);
        if (!insErr) savedToDedicated = true;
      } catch {
        savedToDedicated = false;
      }

      // If dedicated feedbacks table does not exist, use system_feedback in announcements
      if (!savedToDedicated) {
        try {
          await (supabase.from('announcements' as any) as any).insert({
            id: newRecord.id,
            department_id: 'dept-surveying',
            title: newRecord.title.substring(0, 240),
            details: JSON.stringify(newRecord),
            category: 'system_feedback',
            urgency: newRecord.type === 'شكوى' ? 'عاجل' : 'عادي',
            is_active: false,
          });
        } catch (sbErr) {
          console.warn('Supabase fallback feedback insert warning:', sbErr);
        }
      }
    }

    // 2. Save to local database (graceful: do not throw on read-only serverless filesystems)
    try {
      dbCreateFeedback(newRecord);
    } catch (e) {
      console.warn('Local dbCreateFeedback warning (safe on serverless):', e);
    }

    // 3. Dispatch real-time Telegram notification to Admin Private Chat ONLY (ع الخاص فقط للمسؤول ولا يُرسل للقنوات)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const privateChatId = ADMIN_PRIVATE_CHAT_ID;

    let telegramSent = false;
    let telegramError: string | null = null;

    if (botToken && privateChatId) {
      let typeEmoji = '💡';
      if (type === 'شكوى') typeEmoji = '⚠️';
      else if (type === 'مشكلة تقنية') typeEmoji = '🔧';
      else if (type === 'استفسار') typeEmoji = '❓';

      let tgText = `📬 <b>[شكوى / مقترح جديد • خاص بالإدارة]</b>\n\n`;
      tgText += `${typeEmoji} <b>نوع الرسالة:</b> ${type}\n`;
      tgText += `📌 <b>الموضوع:</b> ${title.trim()}\n\n`;
      tgText += `👤 <b>المرسل:</b> ${(name || '').trim() || 'طالب (بدون اسم)'}\n`;
      tgText += `📞 <b>وسيلة التواصل:</b> ${(contact_info || '').trim() || 'لم يتم ترك وسيلة تواصل'}\n`;
      tgText += `🏛️ <b>الفرقة والسكشن:</b> ${academic_year || 'شعبة المساحة العامة'} • ${section_number || 'عام'}\n\n`;
      tgText += `📝 <b>نص الرسالة:</b>\n`;
      tgText += `<blockquote>${message.trim()}</blockquote>\n\n`;
      tgText += `⏰ <i>${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}</i>\n`;
      tgText += `🔐 <i>معرف الشكوى في المنصة: <code>${newRecord.id}</code></i>`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: privateChatId,
            text: tgText,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json();
        if (tgData.ok) {
          telegramSent = true;
        } else {
          console.warn(`Telegram private send failed:`, tgData.description);
          telegramError = tgData.description;
        }
      } catch (tgErr: any) {
        console.warn(`Telegram private send error:`, tgErr);
        telegramError = tgErr.message;
      }
    }

    return NextResponse.json(
      {
        success: true,
        feedback: newRecord,
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

    // 1. Update in local db if possible
    let updated: any = null;
    try {
      updated = dbUpdateFeedback(id, updates);
    } catch {}

    // 2. Sync to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('feedbacks' as any) as any).update(updates).eq('id', id);
      } catch {}

      try {
        const { data: existing } = await (supabase.from('announcements' as any) as any)
          .select('*')
          .eq('id', id)
          .eq('category', 'system_feedback')
          .maybeSingle();

        if (existing && (existing as any).details) {
          try {
            const parsed = JSON.parse((existing as any).details);
            const merged = { ...parsed, ...updates };
            await (supabase.from('announcements' as any) as any)
              .update({ details: JSON.stringify(merged) })
              .eq('id', id);
            if (!updated) updated = merged;
          } catch {}
        }
      } catch {}
    }

    return NextResponse.json({ success: true, feedback: updated || { id, ...updates } });
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

    // 1. Delete from local db
    let success = false;
    try {
      success = dbDeleteFeedback(id);
    } catch {}

    // 2. Delete from Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('feedbacks' as any) as any).delete().eq('id', id);
        success = true;
      } catch {}

      try {
        await (supabase.from('announcements' as any) as any)
          .delete()
          .eq('id', id)
          .eq('category', 'system_feedback');
        success = true;
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting feedback' }, { status: 500 });
  }
}
