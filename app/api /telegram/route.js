import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const prompt = formData.get("prompt");

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: "Telegram Token/ChatID missing in Vercel" }, { status: 500 });
    }

    // ১. টেক্সট পাঠানো
    const textMessage = `📩 নতুন রিকোয়েস্ট!\nটাইপ: ${type}\nপ্রম্পট: ${prompt || "নেই"}`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: textMessage }),
    });

    // ২. ফাইল পাঠানো
    const teleData = new FormData();
    teleData.append("chat_id", chatId);
    teleData.append(type === "image" ? "photo" : "video", file);

    const endpoint = type === "image" ? "sendPhoto" : "sendVideo";
    await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: "POST",
      body: teleData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
