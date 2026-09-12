"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image"); // "image" or "video"
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [resolution, setResolution] = useState("720p");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Quick prompt presets for users
  const presets = [
    "👗 Change outfit to elegant designer kurti",
    "✨ Add cinematic lighting and 8k realistic polish",
    "🌅 Change background to a peaceful nature landscape",
    "🎨 Transform into studio portrait style",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && activeTab === "image") {
      alert("অনুগ্রহ করে একটি Prompt লিখুন বা প্রিসেট বেছে নিন।");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Append safety & copyright-free parameters to prompt
      const enhancedPrompt = `${prompt.trim()}, copyright-free original creation, highly detailed, 8k resolution, photorealistic`;

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          isVideo: activeTab === "video",
          style: videoStyle,
          aspectRatio,
          resolution,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "প্রসেসিং সফল হয়নি।");
      }

      setResult(data.resultUrl);
    } catch (err) {
      console.error(err);
      alert("ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-2">
            ✨ AI Edit Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            কপিরাইট-মুক্ত ছবি ও ভিডিও AI দিয়ে তৈরি করুন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab("image"); setResult(null); }}
            className={`py-2 text-sm font-medium rounded-lg transition ${
              activeTab === "image"
                ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🖼️ Image AI Edit
          </button>
          <button
            onClick={() => { setActiveTab("video"); setResult(null); }}
            className={`py-2 text-sm font-medium rounded-lg transition ${
              activeTab === "video"
                ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎥 Video AI Edit
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-2 font-medium">
            {activeTab === "image" ? "ছবি নির্বাচন করুন:" : "ভিডিও নির্বাচন করুন:"}
          </label>
          <input
            type="file"
            accept={activeTab === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            className="w-full text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 max-h-48 flex justify-center bg-slate-950">
            {activeTab === "image" ? (
              <img src={preview} alt="Upload preview" className="object-contain h-48" />
            ) : (
              <video src={preview} controls className="h-48" />
            )}
          </div>
        )}

        {/* Video Extra Controls */}
        {activeTab === "video" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Video Style</label>
              <select
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option>Cinematic</option>
                <option>Anime</option>
                <option>3D Render</option>
                <option>Realistic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
              >
                <option>9:16 Shorts/Reels</option>
                <option>16:9 Landscape</option>
                <option>1:1 Square</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick Presets for Image */}
        {activeTab === "image" && (
          <div className="mb-3">
            <span className="text-[10px] text-slate-400 block mb-1.5">দ্রুত সিলেক্ট করুন (Preset):</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.replace(/^[^\s]+\s/, ""))}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md px-2.5 py-1 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="mb-5">
          <label className="block text-xs text-slate-400 mb-1">
            ✨ AI Edit Prompt:
          </label>
          <textarea
            rows="3"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="যেমন: ছবিতে একটি সুন্দর লাল রঙের কুর্তি পরিয়ে দাও এবং ব্যাকগ্রাউন্ড সুন্দর করো..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? "⏳ প্রসেসিং হচ্ছে..." : activeTab === "image" ? "🪄 ম্যাজিক এডিট করুন" : "🎬 AI Video Edit করুন"}
        </button>

        {/* Output Result */}
        {result && (
          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <h3 className="text-xs text-cyan-400 mb-3 font-semibold">ফলাফল (Copyright Free):</h3>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              {activeTab === "image" ? (
                <img src={result} alt="AI Result" className="w-full rounded-lg" />
              ) : (
                <video src={result} controls className="w-full rounded-lg" />
              )}
            </div>
            <a
              href={result}
              target="_blank"
              download
              className="inline-block mt-3 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-lg border border-slate-700"
            >
              ⬇️ ফুল কোয়ালিটিতে ডাউনলোডের জন্য ক্লিক করুন
            </a>
          </div>
        )}

        {/* Copyright Notice */}
        <p className="text-[10px] text-slate-500 text-center mt-5">
          এই টুলের তৈরি করা কনটেন্ট কমার্শিয়াল ব্যবহারের জন্য সম্পূর্ণ কপিরাইট-মুক্ত।
        </p>

      </div>
    </div>
  );
}
