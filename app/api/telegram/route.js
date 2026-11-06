import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const prompt = formData.get('prompt');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json({ success: false, error: 'ফাইল পাওয়া যায়নি!' }, { status: 400 });
    }

    // আপনার টেলিগ্রাম বট টোকেন ও চ্যাট আইডি এখানে বসাতে পারেন অথবা কনফিগার করতে পারেন
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      // যদি টেলিগ্রাম টোকেন সেট করা না থাকে, তবে আপাতত সফল রেসপন্স রিটার্ন করবে যাতে ইউআই টেস্ট করা যায়
      return NextResponse.json({ 
        success: true, 
        message: 'রিকোয়েস্ট সফলভাবে গ্রহণ করা হয়েছে! (টেলিগ্রাম ক্রেডেনশিয়াল কনফিগার করা বাকি)' 
      });
    }

    // টেলিগ্রামে পাঠানোর মূল লজিক
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', TELEGRAM_CHAT_ID);
    telegramFormData.append(type === 'image' ? 'photo' : 'video', file);
    telegramFormData.append('caption', `✨ নতুন এআই রিকোয়েস্ট!\n📌 ধরণ: ${type}\n💬 প্রম্পট: ${prompt || 'কোনো প্রম্পট নেই'}`);

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/send${type === 'image' ? 'Photo' : 'Video'}`;

    const telegramRes = await fetch(telegramApiUrl, {
      method: 'POST',
      body: telegramFormData,
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      throw new Error(telegramData.description || 'টেলিগ্রামে ফাইল পাঠাতে সমস্যা হয়েছে।');
    }

    return NextResponse.json({ success: true, message: 'সফলভাবে টেলিগ্রামে পাঠানো হয়েছে!' });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'সার্ভারে ত্রুটি ঘটেছে।' }, { status: 500 });
  }
}
