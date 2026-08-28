"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = () => {
    if (!file || !prompt) {
      alert("অনুগ্রহ করে ফাইল এবং প্রম্পট দুটোই দিন!");
      return;
    }
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setLoading(false);
      setResult("https://via.placeholder.com/600x400?text=AI+Edited+Result");
    }, 3000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f19", color: "#fff", padding: "16px", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", backgroundColor: "#111827", padding: "20px", borderRadius: "16px", border: "1px solid #1f2937", boxSizing: "border-box" }}>
        
        <h1 style={{ color: "#22d3ee", textAlign: "center", marginBottom: "8px", fontSize: "26px" }}>✨ AI Edit Studio</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "14px", marginBottom: "20px" }}>
          আপনার টেক্সট প্রম্পট দিয়ে ছবি ও ভিডিও ইচ্ছেমতো এডিট করুন
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", backgroundColor: "#030712", padding: "6px", borderRadius: "12px" }}>
          <button
            onClick={() => setActiveTab("image")}
            style={{
              flex: 1, padding: "12px 8px", border: "none", borderRadius: "8px", cursor: "pointer",
              backgroundColor: activeTab === "image" ? "#0891b2" : "transparent", color: "#fff", fontWeight: "bold", fontSize: "14px"
            }}
          >
            🖼️ Image AI Edit
          </button>
          <button
            onClick={() => setActiveTab("video")}
            style={{
              flex: 1, padding: "12px 8px", border: "none", borderRadius: "8px", cursor: "pointer",
              backgroundColor: activeTab === "video" ? "#0891b2" : "transparent", color: "#fff", fontWeight: "bold", fontSize: "14px"
            }}
          >
            🎥 Video AI Edit
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#9ca3af", display: "block", marginBottom: "8px" }}>
              {activeTab === "image" ? "ছবি নির্বাচন করুন:" : "ভিডিও নির্বাচন করুন:"}
            </label>
            <input
              type="file"
              accept={activeTab === "image" ? "image/*" : "video/*"}
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: "100%", padding: "12px", backgroundColor: "#030712", color: "#fff", border: "1px solid #374151", borderRadius: "10px", boxSizing: "border-box", fontSize: "14px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", color: "#9ca3af", display: "block", marginBottom: "8px" }}>আপনার প্রম্পট (AI নির্দেশনা):</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTab === "image" ? "যেমন: ছবির ব্যাকগ্রাউন্ড পরিবর্তন করে সূর্যাস্ত দাও..." : "যেমন: ভিডিওর গতি দ্বিগুণ করো এবং সাবটাইটেল দাও..."}
              style={{ width: "100%", padding: "12px", backgroundColor: "#030712", color: "#fff", border: "1px solid #374151", borderRadius: "10px", boxSizing: "border-box", resize: "none", fontSize: "14px" }}
            />
          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              width: "100%", padding: "16px", backgroundColor: loading ? "#374151" : "#06b6d4", color: "#fff",
              border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: "pointer"
            }}
          >
            {loading ? "⏳ প্রসেস হচ্ছে..." : "🪄 ম্যাজিক এডিট করুন"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid #1f2937", paddingTop: "16px" }}>
            <h3 style={{ color: "#22d3ee", fontSize: "15px", marginBottom: "10px" }}>এডিট সম্পন্ন ফলাফল:</h3>
            <img src={result} alt="AI Result" style={{ width: "100%", borderRadius: "10px", marginBottom: "12px" }} />
            <a href={result} download style={{ display: "inline-block", padding: "10px 16px", backgroundColor: "#1f2937", color: "#22d3ee", fontSize: "13px", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}>📥 ডাউনলোড করুন</a>
          </div>
        )}

      </div>
    </div>
  );
}
