import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const prompt = (body.prompt || "").trim();
    const imageUrl = body.imageUrl || "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload an image to edit.",
        },
        { status: 400 }
      );
    }

    // Pollinations API key
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "POLLINATIONS_API_KEY is missing in Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    /*
      imageUrl comes from the browser as:

      data:image/jpeg;base64,...
      OR
      data:image/png;base64,...

      We convert that Data URL into a real file
      and send it to the Image Edit API.
    */

    const match = imageUrl.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image format.",
        },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const imageBuffer = Buffer.from(
      base64Data,
      "base64"
    );

    /*
      Create multipart form
    */

    const form = new FormData();

    const extension =
      mimeType === "image/png"
        ? "png"
        : mimeType === "image/webp"
        ? "webp"
        : "jpg";

    const imageBlob = new Blob(
      [imageBuffer],
      {
        type: mimeType,
      }
    );

    form.append(
      "image",
      imageBlob,
      `source.${extension}`
    );

    /*
      Important instruction:
      Keep the original person/object and only
      make the requested changes.
    */

    const editPrompt = `
Edit the provided image.

IMPORTANT:
- Keep the exact same person from the original image.
- Do NOT change the person's gender.
- Do NOT replace the person with another person.
- Preserve the original face, identity, hairstyle, body, clothing and pose unless the user explicitly asks to change them.
- Only make the changes requested by the user.
- Keep the image realistic and natural.

User's editing instruction:
${prompt}
`;

    form.append(
      "prompt",
      editPrompt
    );

    form.append(
      "model",
      "kontext"
    );

    form.append(
      "size",
      "1024x1024"
    );

    form.append(
      "response_format",
      "b64_json"
    );

    const response = await fetch(
      "https://gen.pollinations.ai/v1/images/edits",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
        },

        body: form,
      }
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "Pollinations API Error:",
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            `AI editing failed (${response.status}).`,
          details: responseText.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    let data;

    try {
      data =
        JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an invalid response.",
          details:
            responseText.slice(0, 500),
        },
        { status: 500 }
      );
    }

    /*
      Pollinations returns:
      data[0].b64_json
      when response_format = b64_json
    */

    const resultBase64 =
      data?.data?.[0]?.b64_json;

    const resultUrl =
      data?.data?.[0]?.url;

    if (resultBase64) {
      return NextResponse.json({
        success: true,
        resultUrl:
          `data:image/png;base64,${resultBase64}`,
      });
    }

    if (resultUrl) {
      return NextResponse.json({
        success: true,
        resultUrl,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "AI did not return an edited image.",
      },
      { status: 500 }
    );

  } catch (error) {
    console.error(
      "Image Edit Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
