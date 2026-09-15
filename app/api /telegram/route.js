import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { file, fileName, prompt, type } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN বা TELEGRAM_CHAT_ID পাওয়া যায়নি!' },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'কোনো ফাইল আপলোড করা হয়নি!' },
        { status: 400 }
      );
    }

    // Convert Base64 back to Blob/Buffer for Telegram
    const base64Data = file.split(',')[1] || file;
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer]);

    const tgFormData = new FormData();
    tgFormData.append('chat_id', chatId);

    const caption = `<b>✨ নতুন AI Studio রিকোয়েস্ট</b>\n<b>টাইপ:</b> ${type === 'image' ? '🖼️ ছবি' : '🎥 ভিডিও'}\n<b>প্রম্পট:</b> ${prompt || 'None'}`;
    tgFormData.append('caption', caption);
    tgFormData.append('parse_mode', 'HTML');

    let apiMethod = 'sendPhoto';
    if (type === 'video') {
      apiMethod = 'sendVideo';
      tgFormData.append('video', blob, fileName || 'video.mp4');
    } else {
      tgFormData.append('photo', blob, fileName || 'image.jpg');
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/${apiMethod}`, {
      method: 'POST',
      body: tgFormData,
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      return NextResponse.json(
        { error: tgData.description || 'টেলিগ্রাম বটের চ্যাট আইডি বা টোকেন ভুল!' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: tgData });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে' },
      { status: 500 }
    );
  }
}
