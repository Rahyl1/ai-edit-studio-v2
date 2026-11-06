'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resultData, setResultData] = useState(null);

  // ফাইল সিলেক্ট করলে প্রিভিউ দেখানোর ফাংশন
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({ type: 'error', text: 'দয়া করে একটি ফাইল নির্বাচন করুন!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      formData.append('type', type);

      const res = await fetch('/api/telegram', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'আপনার এডিটিং রিকোয়েস্ট সফলভাবে প্রসেস হচ্ছে! 🎉' });
        setResultData({
          status: 'Processing',
          text: 'AI স্টুডিও আপনার ফাইলটি নিয়ে কাজ করছে। খুব শীঘ্রই আউটপুট পেয়ে যাবেন।'
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'ফাইল পাঠাতে ব্যর্থ হয়েছে!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'সার্ভারে সংযোগ করতে ব্যর্থ!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', width: '100%', padding: '20px 10px', color: '#f8fafc', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #334155', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', color: '#38bdf8', margin: '0 0 6px 0', fontWeight: 'bold' }}>✨ AI Studio Pro Editor</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>ക്লিপক্যাপ স্টাইলে এআই ভিডিও ও ইমেজ এডিটর</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setType('image'); setFile(null); setPreviewUrl(null); }}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: type === 'image' ? '#38bdf8' : 'transparent', color: type === 'image' ? '#0f172a' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            🖼️ Image Edit
          </button>
          <button
            type="button"
            onClick={() => { setType('video'); setFile(null); setPreviewUrl(null); }}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: type === 'video' ? '#38bdf8' : 'transparent', color: type === 'video' ? '#0f172a' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            🎥 Video Edit
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              {type === 'image' ? 'এডিট করার ছবি সিলেক্ট করুন:' : 'এডিট করার ভিডিও সিলেক্ট করুন:'}
            </label>
            <input
              type="file"
              accept={type === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Live Preview Box */}
          {previewUrl && (
            <div style={{ marginBottom: '16px', textAlign: 'center', backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <p style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>ইনপুট প্রিভিউ:</p>
              {type === 'image' ? (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '6px' }} />
              ) : (
                <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '6px' }} />
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>✨ প্রম্পট বা কি এডিট চান লিখুন:</label>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: ব্যাকগ্রাউন্ড রিমুভ করো বা কালার গ্রেডিং করো..."
              style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#64748b' : '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            {loading ? '⏳ এআই প্রসেসিং হচ্ছে...' : '🚀 এআই এডিট শুরু করুন'}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', backgroundColor: message.type === 'success' ? '#064e3b' : '#881337', color: message.type === 'success' ? '#34d399' : '#fda4af', border: message.type === 'success' ? '1px solid #059669' : '1px solid #f43f5e' }}>
            {message.text}
          </div>
        )}

        {/* Result UI Display */}
        {resultData && (
          <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #38bdf8', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', color: '#38bdf8', margin: '0 0 6px 0' }}>🎨 এডিটিং স্ট্যাটাস</h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>{resultData.text}</p>
          </div>
        )}

      </div>
    </div>
  );
}
