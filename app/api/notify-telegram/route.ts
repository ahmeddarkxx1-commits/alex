import { NextResponse } from 'next/server';

interface TelegramNotificationPayload {
  type: 'resource' | 'schedule' | 'announcement';
  title: string;
  departmentName: string;
  academicYear?: string;
  subjectName?: string;
  details?: string;
  dueDate?: string;
  resourceType?: string;
  link?: string;
  fileUrl?: string;
  postUrl?: string;
  targetChannel?: 'year1' | 'year2' | 'both';
}

export async function POST(req: Request) {
  try {
    const body: TelegramNotificationPayload = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const year1ChannelId = process.env.TELEGRAM_CHANNEL_YEAR1_ID || process.env.TELEGRAM_CHAT_ID;
    const year2ChannelId = process.env.TELEGRAM_CHANNEL_YEAR2_ID || process.env.TELEGRAM_CHAT_ID;

    // Detect live URL from headers or fallback
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const detectedOrigin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://alex-iota-two.vercel.app');

    // Determine target channels based on payload
    let targetChannels: { id: string; name: string }[] = [];

    // Determine which channel to dispatch to
    let effectiveTarget = body.targetChannel;
    if (!effectiveTarget) {
      if (body.academicYear === 'الفرقة الأولى') {
        effectiveTarget = 'year1';
      } else if (body.academicYear === 'الفرقة الثانية') {
        effectiveTarget = 'year2';
      } else {
        effectiveTarget = 'both';
      }
    }

    if (effectiveTarget === 'year1' && year1ChannelId) {
      targetChannels.push({ id: year1ChannelId, name: 'قناة الفرقة الأولى' });
    } else if (effectiveTarget === 'year2' && year2ChannelId) {
      targetChannels.push({ id: year2ChannelId, name: 'قناة الفرقة الثانية' });
    } else {
      // Both channels
      if (year1ChannelId) targetChannels.push({ id: year1ChannelId, name: 'قناة الفرقة الأولى' });
      if (year2ChannelId && year2ChannelId !== year1ChannelId) {
        targetChannels.push({ id: year2ChannelId, name: 'قناة الفرقة الثانية' });
      } else if (!year1ChannelId && year2ChannelId) {
        targetChannels.push({ id: year2ChannelId, name: 'قناة الفرقة الثانية' });
      }
    }

    // Check if Telegram bot token is configured
    if (!botToken || targetChannels.length === 0) {
      console.warn('Telegram Bot Token or Channels not configured in .env.local. Notification simulated.');
      return NextResponse.json({
        success: true,
        simulated: true,
        target: effectiveTarget,
        message: `تم تسجيل الإشعار بنجاح (وضع المحاكاة: موجه إلى ${
          effectiveTarget === 'year1'
            ? 'قناة الفرقة الأولى'
            : effectiveTarget === 'year2'
            ? 'قناة الفرقة الثانية'
            : 'قناتي الأولى والثانية معاً'
        } - يرجى إضافة TELEGRAM_BOT_TOKEN في .env.local للنشر الحقيقي).`,
      });
    }

    // Format emoji and headline
    let emoji = '📢';
    let typeLabel = 'تحديث جديد';

    if (body.type === 'resource') {
      if (body.resourceType === 'شيت وتكليف') {
        emoji = '📝';
        typeLabel = 'شيت وتكليف مساحي جديد مطلوب تسليمه';
      } else if (body.resourceType === 'بنك أسئلة وامتحانات') {
        emoji = '🎯';
        typeLabel = 'بنك أسئلة ونماذج امتحانات جديدة';
      } else {
        emoji = '📄';
        typeLabel = 'مستند PDF وتلخيص جديد (متاح للتحميل والقراءة)';
      }
    } else if (body.type === 'schedule') {
      emoji = '⏰';
      typeLabel = 'تعديل أو إضافة في جدول المحاضرات والسكاشن';
    } else if (body.type === 'announcement') {
      emoji = '🚨';
      typeLabel = 'تنبيه أكاديمي وإداري هام';
    }

    // Construct formatted Telegram message (HTML)
    let message = `<b>${emoji} ${typeLabel}</b>\n\n`;
    message += `🏛 <b>المعهد الفني الصناعي بالإسكندرية</b>\n`;
    message += `🔹 <b>الشعبة:</b> ${body.departmentName || 'شعبة المساحة العامة'}\n`;
    if (body.academicYear) {
      message += `🔹 <b>الفرقة:</b> ${body.academicYear}\n`;
    }
    if (body.subjectName) {
      message += `📖 <b>المادة:</b> ${body.subjectName}\n`;
    }
    message += `📌 <b>العنوان:</b> ${body.title}\n`;

    if (body.dueDate) {
      message += `⏳ <b>آخر موعد للتسليم:</b> ${new Date(body.dueDate).toLocaleDateString('ar-EG')}\n`;
    }

    if (body.details) {
      const trimmed = body.details.length > 250 ? body.details.slice(0, 250) + '...' : body.details;
      message += `\n💬 <i>${trimmed}</i>\n`;
    }

    const targetPostUrl = body.postUrl || body.link || detectedOrigin;
    const directFileUrl = body.fileUrl
      ? (body.fileUrl.startsWith('http') ? body.fileUrl : `${detectedOrigin}${body.fileUrl}`)
      : null;

    if (directFileUrl) {
      message += `\n📥 <b>رابط تحميل وقراءة ملف الـ PDF مباشرة:</b>\n<a href="${directFileUrl}">${directFileUrl}</a>\n`;
    }

    message += `\n🌐 <b>رابط التلخيص على منصة المعهد:</b>\n<a href="${targetPostUrl}">${targetPostUrl}</a>\n`;
    message += `\n<i>منصة شعبة المساحة العامة • ITI Alex Hub</i>`;

    // Send HTTP POST to Telegram Bot API for each target channel
    const sendResults: any[] = [];
    for (const channel of targetChannels) {
      try {
        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(telegramApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: channel.id,
            text: `[${channel.name}]\n` + message,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          }),
        });

        const result = await res.json();
        sendResults.push({
          channel: channel.name,
          chat_id: channel.id,
          ok: result.ok,
          description: result.description,
        });
      } catch (err: any) {
        sendResults.push({
          channel: channel.name,
          chat_id: channel.id,
          ok: false,
          error: err.message,
        });
      }
    }

    const allSuccessful = sendResults.every((r) => r.ok);

    return NextResponse.json({
      success: allSuccessful,
      target: effectiveTarget,
      results: sendResults,
      message: `تم إرسال الإشعار بنجاح إلى: ${sendResults.map((r) => r.channel).join(' و ')}`,
    });
  } catch (error: any) {
    console.error('Notify route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
