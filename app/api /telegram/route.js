import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const prompt = formData.get('prompt') || 'No prompt provided';
    const type = formData.get('type') || 'image';

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Telegram credentials missing in Environment Variables!' },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded!' },
        { status: 400 }
      );
    }

    // Telegram API call
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', chatId);
    telegramFormData.append('caption', `✨ **New ${type.toUpperCase()} Request**\n\n📝 **Prompt:** ${prompt}`);
    
    // Determine method: sendPhoto or sendVideo
    const method = type === 'video' ? 'sendVideo' : 'sendPhoto';
    const fieldName = type === 'video' ? 'video' : 'photo';

    telegramFormData.append(fieldName, file);

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      body: telegramFormData,
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      return NextResponse.json(
        { error: telegramData.description || 'Failed to send to Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Sent successfully!' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
