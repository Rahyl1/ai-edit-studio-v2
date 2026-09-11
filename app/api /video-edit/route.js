
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAGIC_HOUR_API =
  "https://api.magichour.ai";

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

const MAX_VIDEO_SECONDS = 30;

function jsonError(message, status = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

async function readJson(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Magic Hour invalid response (${response.status}): ${text.slice(
        0,
        500
      )}`
    );
  }
}

function getExtension(fileName, mimeType) {
  const extension =
    fileName?.split(".").pop()?.toLowerCase();

  const allowed = [
    "mp4",
    "m4v",
    "mov",
    "webm",
  ];

  if (allowed.includes(extension)) {
    return extension;
  }

  if (mimeType === "video/quicktime") {
    return "mov";
  }

  if (mimeType === "video/webm") {
    return "webm";
  }

  return "mp4";
}

function getStyleName(style) {
  const styles = {
    cinematic: "Cinematic",
    funny: "Funny",
    romantic: "Romantic",
    action: "Action",
    custom: "Cinematic",
  };

  return styles[style] || "Cinematic";
}

function getPrompt(style, prompt) {
  const styleName = getStyleName(style);

  return [
    `Transform this video into a ${styleName} visual style.`,
    "Preserve the original subject, identity, motion and scene continuity.",
    "Keep the result realistic and visually consistent.",
    prompt?.trim() || "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(request) {
  try {
    const apiKey =
      process.env.MAGIC_HOUR_API_KEY;

    if (!apiKey) {
      return jsonError(
        "MAGIC_HOUR_API_KEY সেট করা হয়নি। Vercel Environment Variables চেক করুন।",
        500
      );
    }

    const formData = await request.formData();

    const video = formData.get("video");
    const prompt = formData.get("prompt") || "";
    const style = formData.get("style") || "cinematic";
    const aspectRatio =
      formData.get("aspectRatio") || "9:16";
    const resolution =
      formData.get("resolution") || "720p";
    const audioSetting =
      formData.get("audioSetting") || "origin";

    if (!video || typeof video.arrayBuffer !== "function") {
      return jsonError(
        "ভিডিও ফাইল পাওয়া যায়নি।",
        400
      );
    }

    if (!video.type.startsWith("video/")) {
      return jsonError(
        "শুধুমাত্র ভিডিও ফাইল আপলোড করুন।",
        400
      );
    }

    if (video.size > MAX_VIDEO_SIZE) {
      return jsonError(
        "ভিডিও সর্বোচ্চ 100 MB হতে পারবে।",
        400
      );
    }

    /*
     * Magic Hour API upload URL তৈরি
     */

    const extension = getExtension(
      video.name,
      video.type
    );

    const uploadResponse = await fetch(
      `${MAGIC_HOUR_API}/v1/files/upload-urls`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              type: "video",
              extension,
            },
          ],
        }),
      }
    );

    const uploadData =
      await readJson(uploadResponse);

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.message ||
          uploadData.error ||
          "Magic Hour upload URL তৈরি করতে পারেনি।"
      );
    }

    const uploadItem =
      uploadData.items?.[0];

    if (
      !uploadItem?.upload_url ||
      !uploadItem?.file_path
    ) {
      throw new Error(
        "Magic Hour upload URL response সঠিক নয়।"
      );
    }

    /*
     * ভিডিও Magic Hour storage-এ PUT upload
     */

    const videoBuffer =
      await video.arrayBuffer();

    const putResponse = await fetch(
      uploadItem.upload_url,
      {
        method: "PUT",
        headers: {
          "content-type": video.type,
        },
        body: videoBuffer,
      }
    );

    if (!putResponse.ok) {
      const uploadError =
        await putResponse.text();

      throw new Error(
        `Video upload failed (${putResponse.status}): ${uploadError.slice(
          0,
          300
        )}`
      );
    }

    /*
     * Video-to-Video job তৈরি
     */

    const jobPrompt = getPrompt(
      style,
      prompt
    );

    const jobResponse = await fetch(
      `${MAGIC_HOUR_API}/v1/video-to-video`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: `AI Edit Studio - ${style}`,
          start_seconds: 0,
          end_seconds: MAX_VIDEO_SECONDS,
          fps_resolution: "HALF",
          style: {
            art_style: getStyleName(style),
            version: "default",
            prompt_type: "default",
            prompt: jobPrompt,
            model: "default",
          },
          assets: {
            video_source: "file",
            video_file_path:
              uploadItem.file_path,
          },
        }),
      }
    );

    const jobData =
      await readJson(jobResponse);

    if (!jobResponse.ok) {
      throw new Error(
        jobData.message ||
          jobData.error ||
          "Magic Hour Video-to-Video job তৈরি করতে পারেনি।"
      );
    }

    if (!jobData.id) {
      throw new Error(
        "Magic Hour job ID পাওয়া যায়নি।"
      );
    }

    return NextResponse.json({
      success: true,
      requestId: jobData.id,
      jobId: jobData.id,
      message:
        "AI Video Edit processing শুরু হয়েছে।",
      creditsCharged:
        jobData.credits_charged ?? null,
      settings: {
        style,
        aspectRatio,
        resolution,
        audioSetting,
        maxDuration: MAX_VIDEO_SECONDS,
      },
    });

  } catch (error) {
    console.error(
      "Magic Hour Video Edit Error:",
      error
    );

    return jsonError(
      error?.message ||
        "Video editing failed.",
      500
    );
  }
}
