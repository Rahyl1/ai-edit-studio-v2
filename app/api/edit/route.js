import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json({ error: "HF_TOKEN missing in Vercel settings" }, { status: 500 });
    }

    // High Reliability Free Pollinations AI Endpoint
    const safePrompt = encodeURIComponent(prompt || "a beautiful cat");
    const imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    return NextResponse.json({ resultUrl: imageUrl });

  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
