import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const prompt = formData.get('prompt') || 'No prompt provided';
    const type = formData.get('type') || 'image';

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'টেলিগ্রাম BOT_TOKEN অথবা CHAT_ID পাওয়া যায়নি!' },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'কোনো ফাইল পাওয়া যায়নি!' },
        { status: 400 }
      );
    }

    const tgFormData = new FormData();
    tgFormData.append('chat_id', chatId);

    const caption = `<b>✨ নতুন AI Studio রিকোয়েস্ট</b>\n<b>টাইপ:</b> ${type === 'image' ? '🖼️ ছবি' : '🎥 ভিডিও'}\n<b>প্রম্পট:</b> ${prompt}`;
    tgFormData.append('caption', caption);
    tgFormData.append('parse_mode', 'HTML');

    let apiMethod = 'sendPhoto';
    if (type === 'video') {
      apiMethod = 'sendVideo';
      tgFormData.append('video', file);
    } else {
      tgFormData.append('photo', file);
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/${apiMethod}`, {
      method: 'POST',
      body: tgFormData,
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      return NextResponse.json(
        { error: tgData.description || 'টেলিগ্রামে ফাইল পাঠাতে সমস্যা হয়েছে।' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: tgData });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
