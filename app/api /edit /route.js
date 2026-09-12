import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, imageUrl } = body;

    // ১. ভ্যালিডেশন
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "AI Prompt দেওয়া হয়নি।" },
        { status: 400 }
      );
    }

    if (!imageUrl || !imageUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, error: "সঠিক Image Data পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { success: false, error: "Vercel-এ HF_TOKEN সেট করা নেই।" },
        { status: 500 }
      );
    }

    // ২. Base64 থেকে Buffer তৈরি
    const base64Data = imageUrl.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { success: false, error: "Base64 Image ফরম্যাট সঠিক নয়।" },
        { status: 400 }
      );
    }
    const imageBuffer = Buffer.from(base64Data, "base64");

    // ৩. Hugging Face Inference API তে সরাসরি রিকোয়েস্ট (Instruct-Pix2Pix Model)
    // দ্রষ্টব্য: Instruct-Pix2Pix মডেলে ইমেজ এবং প্রম্পট একসাথে পাঠানোর জন্য FormData বা JSON বাইনারি লাগে।
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: base64Data, // Base64 string directly
          parameters: {
            prompt: prompt.trim(),
          },
        }),
      }
    );

    // ৪. Hugging Face Response চেক
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF Error Detail:", errorText);
      return NextResponse.json(
        { success: false, error: `Hugging Face Error: ${hfResponse.statusText}` },
        { status: hfResponse.status }
      );
    }

    // ৫. আউটপুট প্রসেসিং
    const arrayBuffer = await hfResponse.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);
    const outputBase64 = outputBuffer.toString("base64");

    // Hugging Face সাধারণত image/jpeg বা image/png দেয়
    const resultUrl = `data:image/png;base64,${outputBase64}`;

    return NextResponse.json({
      success: true,
      resultUrl,
    });
  } catch (error) {
    console.error("Image AI Edit Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Image AI editing failed.",
      },
      { status: 500 }
    );
  }
}
