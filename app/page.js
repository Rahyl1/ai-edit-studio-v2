"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি ছবি নির্বাচন করুন।");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleProcess = async () => {
    if (activeTab !== "image") {
      alert("এই মুহূর্তে Image AI Edit পরীক্ষা করুন।");
      return;
    }

    if (!file) {
      alert("প্রথমে একটি ছবি নির্বাচন করুন।");
      return;
    }

    if (!prompt.trim()) {
      alert("অনুগ্রহ করে একটি AI Prompt লিখুন।");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const imageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(new Error("ছবিটি পড়তে সমস্যা হয়েছে।"));
        };

        reader.readAsDataURL(file);
      });

      if (
        !imageUrl ||
        typeof imageUrl !== "string" ||
        !imageUrl.startsWith("data:image/")
      ) {
        throw new Error("ছবির ডাটা সঠিকভাবে তৈরি হয়নি।");
      }

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrl: imageUrl,
          isVideo: false,
        }),
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server থেকে সঠিক JSON response আসেনি।"
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "AI editing failed."
        );
      }

      if (data.resultUrl) {
        setResult(data.resultUrl);
      } else {
        throw new Error(
          data.error ||
          "AI কোনো edited image ফেরত দেয়নি।"
        );
      }

    } catch (err) {
      console.error("AI Edit Error:", err);

      alert(
        "প্রসেসিংয়ে ভুল হয়েছে: " +
        (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0f19",
        color: "#fff",
        padding: "16px",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#111827",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #1f2937",
          boxSizing: "border-box",
        }}
      >

        <h1
          style={{
            color: "#22d3ee",
            textAlign: "center",
            marginBottom: "8px",
            fontSize: "26px",
          }}
        >
          ✨ AI Edit Studio
        </h1>

        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          আপনার ছবি AI দিয়ে এডিট করুন
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            backgroundColor: "#030712",
            padding: "6px",
            borderRadius: "12px",
          }}
        >

          <button
            onClick={() => {
              setActiveTab("image");
              setFile(null);
              setResult(null);
            }}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeTab === "image"
                  ? "#0891b2"
                  : "transparent",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            🖼️ Image AI Edit
          </button>

          <button
            onClick={() => {
              setActiveTab("video");
              setFile(null);
              setResult(null);
            }}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                activeTab === "video"
                  ? "#0891b2"
                  : "transparent",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            🎥 Video AI Edit
          </button>

        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >

          <div>

            <label
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                display: "block",
                marginBottom: "8px",
              }}
            >
              ছবি নির্বাচন করুন:
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#030712",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: "10px",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />

            {file && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#22d3ee",
                  wordBreak: "break-word",
                }}
              >
                ✅ নির্বাচিত ছবি: {file.name}
              </div>
            )}

          </div>

          <div>

            <label
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                display: "block",
                marginBottom: "8px",
              }}
            >
              আপনার Prompt:
            </label>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: আমার হাতে একটি সুন্দর লাল গোলাপ যোগ করো। আমার মুখ, চেহারা ও পরিচয় অপরিবর্তিত রাখো।"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#030712",
                color: "#fff",
                border: "1px solid #374151",
                borderRadius: "10px",
                boxSizing: "border-box",
                resize: "none",
                fontSize: "14px",
              }}
            />

          </div>

          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor:
                loading
                  ? "#374151"
                  : "#06b6d4",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "⏳ AI এডিট হচ্ছে..."
              : "🪄 ম্যাজিক এডিট করুন"}
          </button>

        </div>

        {result && (
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              borderTop: "1px solid #1f2937",
              paddingTop: "16px",
            }}
          >

            <h3
              style={{
                color: "#22d3ee",
                fontSize: "15px",
                marginBottom: "10px",
              }}
            >
              ✅ এডিট সম্পন্ন
            </h3>

            <img
              src={result}
              alt="AI Edited Result"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "12px",
              }}
            />

            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                display: "inline-block",
                padding: "10px 16px",
                backgroundColor: "#1f2937",
                color: "#22d3ee",
                fontSize: "13px",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              📥 ডাউনলোড করুন
            </a>

          </div>
        )}

      </div>
    </div>
  );
}
