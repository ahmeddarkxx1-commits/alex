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
}

export async function POST(req: Request) {
  try {
    const body: TelegramNotificationPayload = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iti-alex.vercel.app';

    if (!botToken || !chatId) {
      console.warn('Telegram Bot Token or Chat ID not configured. Notification simulated in logs.');
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'تم تسجيل الإشعار بنجاح (وضع المعاينة المحلي - لم يتم ضبط TELEGRAM_BOT_TOKEN بعد)',
      });
    }

    // Format emoji and headline
    let emoji = '📢';
    let typeLabel = 'تحديث جديد';

    if (body.type === 'resource') {
      if (body.resourceType === 'شيت وتكليف') {
        emoji = '📝';
        typeLabel = 'شيت وتكليف جديد مطلوب تسليمه';
      } else if (body.resourceType === 'بنك أسئلة وامتحانات') {
        emoji = '🎯';
        typeLabel = 'بنك أسئلة ونماذج امتحانات جديدة';
      } else {
        emoji = '📚';
        typeLabel = 'ملخص محاضرة / سكشن جديد';
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
    message += `🔹 <b>الشعبة:</b> ${body.departmentName || 'عام'}\n`;
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
      const trimmed = body.details.length > 200 ? body.details.slice(0, 200) + '...' : body.details;
      message += `\n💬 <i>${trimmed}</i>\n`;
    }

    const targetUrl = body.link || appUrl;
    message += `\n🔗 <b>افتح المنصة مباشرة للمعاينة:</b>\n${targetUrl}\n`;
    message += `\n<i>منصة المعهد الفني الصناعي بالإسكندرية • ITI Alex Hub</i>`;

    // Send HTTP POST to Telegram Bot API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const result = await res.json();
    if (!result.ok) {
      console.error('Telegram API error:', result);
      return NextResponse.json({
        success: false,
        error: result.description,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'تم إرسال الإشعار التلقائي إلى قناة التليجرام بنجاح!',
    });
  } catch (error: any) {
    console.error('Notify route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

