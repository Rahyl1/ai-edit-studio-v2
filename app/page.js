"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoStyle, setVideoStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      const enhancedPrompt = `${prompt.trim()}, copyright-free original creation, highly detailed, 8k resolution, photorealistic`;

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          isVideo: activeTab === "video",
          style: videoStyle,
          aspectRatio,
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
    <div style={{ backgroundColor: "#0b0f19", color: "#ffffff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#151c2c", border: "1px solid #2a3447", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "480px", boxSizing: "border-box" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "#00d8f6", fontSize: "22px", margin: "0 0 6px 0" }}>✨ AI Edit Studio</h1>
          <p style={{ color: "#8a99ad", fontSize: "12px", margin: 0 }}>ছবি ও ভিডিও AI দিয়ে কপিরাইট-মুক্ত এডিট করুন</p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: "8px", backgroundColor: "#0b0f19", padding: "6px", borderRadius: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => { setActiveTab("image"); setResult(null); }}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: activeTab === "image" ? "#00d8f6" : "transparent", color: activeTab === "image" ? "#0b0f19" : "#8a99ad", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🖼️ Image AI Edit
          </button>
          <button
            onClick={() => { setActiveTab("video"); setResult(null); }}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: activeTab === "video" ? "#00d8f6" : "transparent", color: activeTab === "video" ? "#0b0f19" : "#8a99ad", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
          >
            🎥 Video AI Edit
          </button>
        </div>

        {/* File Select */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#8a99ad", marginBottom: "6px" }}>
            {activeTab === "image" ? "ছবি নির্বাচন করুন:" : "ভিডিও নির্বাচন করুন:"}
          </label>
          <input
            type="file"
            accept={activeTab === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            style={{ width: "100%", backgroundColor: "#0b0f19", border: "1px solid #2a3447", color: "#fff", padding: "8px", borderRadius: "8px", boxSizing: "border-box", fontSize: "12px" }}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: "16px", textAlign: "center", backgroundColor: "#0b0f19", padding: "10px", borderRadius: "8px", border: "1px solid #2a3447" }}>
            {activeTab === "image" ? (
              <img src={preview} alt="Preview" style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "6px" }} />
            ) : (
              <video src={preview} controls style={{ maxHeight: "180px", maxWidth: "100%", borderRadius: "6px" }} />
            )}
          </div>
        )}

        {/* Video Options */}
        {activeTab === "video" && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "#8a99ad", marginBottom: "4px" }}>Video Style</label>
              <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} style={{ width: "100%", backgroundColor: "#0b0f19", border: "1px solid #2a3447", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px" }}>
                <option>Cinematic</option>
                <option>Anime</option>
                <option>3D Render</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "11px", color: "#8a99ad", marginBottom: "4px" }}>Aspect Ratio</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ width: "100%", backgroundColor: "#0b0f19", border: "1px solid #2a3447", color: "#fff", padding: "8px", borderRadius: "6px", fontSize: "12px" }}>
                <option>9:16 Shorts</option>
                <option>16:9 Wide</option>
              </select>
            </div>
          </div>
        )}

        {/* Presets */}
        {activeTab === "image" && (
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", color: "#8a99ad", display: "block", marginBottom: "6px" }}>দ্রুত সিলেক্ট করুন (Presets):</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.replace(/^[^\s]+\s/, ""))}
                  style={{ backgroundColor: "#0b0f19", border: "1px solid #2a3447", color: "#d1d5db", padding: "6px 10px", borderRadius: "6px", textAlign: "left", cursor: "pointer", fontSize: "11px" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#8a99ad", marginBottom: "6px" }}>✨ AI Prompt:</label>
          <textarea
            rows="3"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="যেমন: ছবিতে একটি সুন্দর লাল রঙের কুর্তি পরিয়ে দাও..."
            style={{ width: "100%", backgroundColor: "#0b0f19", border: "1px solid #2a3447", color: "#fff", padding: "10px", borderRadius: "8px", boxSizing: "border-box", fontSize: "12px", resize: "none" }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: loading ? "#4b5563" : "#00d8f6", color: "#0b0f19", fontWeight: "bold", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}
        >
          {loading ? "⏳ প্রসেসিং হচ্ছে..." : activeTab === "image" ? "🪄 ম্যাজিক এডিট করুন" : "🎬 AI Video Edit করুন"}
        </button>

        {/* Result Area */}
        {result && (
          <div style={{ marginTop: "20px", borderTop: "1px solid #2a3447", paddingTop: "16px", textAlign: "center" }}>
            <h3 style={{ color: "#00d8f6", fontSize: "13px", marginBottom: "10px" }}>ফলাফল (Copyright Free):</h3>
            {activeTab === "image" ? (
              <img src={result} alt="AI Result" style={{ width: "100%", borderRadius: "8px" }} />
            ) : (
              <video src={result} controls style={{ width: "100%", borderRadius: "8px" }} />
            )}
            <a
              href={result}
              target="_blank"
              download
              style={{ display: "inline-block", marginTop: "10px", fontSize: "12px", color: "#00d8f6", textDecoration: "none" }}
            >
              ⬇️ ফুল কোয়ালিটিতে ডাউনলোড করুন
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
