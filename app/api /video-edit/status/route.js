
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAGIC_HOUR_API =
  "https://api.magichour.ai";

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

function extractVideoUrl(data) {
  const downloads = data.downloads;

  if (Array.isArray(downloads)) {
    const item = downloads.find(
      (item) =>
        typeof item === "string" ||
        item?.url ||
        item?.download_url
    );

    if (typeof item === "string") {
      return item;
    }

    return item?.url || item?.download_url || null;
  }

  if (downloads && typeof downloads === "object") {
    return (
      downloads.video_url ||
      downloads.url ||
      downloads.mp4 ||
      null
    );
  }

  return (
    data.video_url ||
    data.videoUrl ||
    data.output_url ||
    data.outputUrl ||
    null
  );
}

export async function GET(request) {
  try {
    const apiKey =
      process.env.MAGIC_HOUR_API_KEY;

    if (!apiKey) {
      return jsonError(
        "MAGIC_HOUR_API_KEY সেট করা হয়নি।",
        500
      );
    }

    const { searchParams } =
      new URL(request.url);

    const requestId =
      searchParams.get("requestId");

    if (!requestId) {
      return jsonError(
        "requestId পাওয়া যায়নি।",
        400
      );
    }

    const response = await fetch(
      `${MAGIC_HOUR_API}/v1/video-to-video/${encodeURIComponent(
        requestId
      )}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    const data =
      await readJson(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Magic Hour status পাওয়া যায়নি।"
      );
    }

    const rawStatus =
      data.status ||
      data.state ||
      "processing";

    const status =
      String(rawStatus).toUpperCase();

    const videoUrl =
      extractVideoUrl(data);

    if (
      status === "COMPLETE" ||
      status === "COMPLETED" ||
      status === "SUCCEEDED" ||
      status === "SUCCESS"
    ) {
      if (!videoUrl) {
        return NextResponse.json({
          success: true,
          status: "PROCESSING",
          message:
            "Video complete হয়েছে, কিন্তু download URL এখনো পাওয়া যায়নি।",
          rawStatus,
        });
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        videoUrl,
        requestId,
        rawStatus,
      });
    }

    if (
      status === "FAILED" ||
      status === "ERROR" ||
      status === "CANCELLED"
    ) {
      return NextResponse.json({
        success: false,
        status: "FAILED",
        error:
          data.error ||
          data.message ||
          "AI ভিডিও প্রসেসিং ব্যর্থ হয়েছে।",
        requestId,
        rawStatus,
      });
    }

    return NextResponse.json({
      success: true,
      status: "PROCESSING",
      requestId,
      rawStatus,
      message:
        "AI ভিডিও প্রসেসিং চলছে...",
    });

  } catch (error) {
    console.error(
      "Magic Hour Status Error:",
      error
    );

    return jsonError(
      error?.message ||
        "Video status check failed.",
      500
    );
  }
}
