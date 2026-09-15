'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({ type: 'error', text: 'দয়া করে একটি ফাইল নির্বাচন করুন!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Vercel / Client side check for token and chat ID
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      setMessage({ 
        type: 'error', 
        text: 'Vercel-এ NEXT_PUBLIC_TELEGRAM_BOT_TOKEN অথবা NEXT_PUBLIC_TELEGRAM_CHAT_ID পাওয়া যায়নি!' 
      });
      setLoading(false);
      return;
    }

    try {
      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);

      const caption = `<b>✨ নতুন AI Studio রিকোয়েস্ট</b>\n<b>টাইপ:</b> ${type === 'image' ? '🖼️ ছবি' : '🎥 ভিডিও'}\n<b>প্রম্পট:</b> ${prompt || 'None'}`;
      tgFormData.append('caption', caption);
      tgFormData.append('parse_mode', 'HTML');

      let apiMethod = 'sendPhoto';
      if (type === 'video') {
        apiMethod = 'sendVideo';
        tgFormData.append('video', file);
      } else {
        tgFormData.append('photo', file);
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/${apiMethod}`, {
        method: 'POST',
        body: tgFormData,
      });

      const tgData = await tgRes.json();

      if (tgRes.ok && tgData.ok) {
        setMessage({ type: 'success', text: 'আপনার রিকোয়েস্ট সফলভাবে টেলিগ্রামে পাঠানো হয়েছে! 🎉' });
        setPrompt('');
        setFile(null);
        e.target.reset();
      } else {
        setMessage({ type: 'error', text: tgData.description || 'টেলিগ্রাম বটে তথ্য পাঠাতে সমস্যা হয়েছে!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'নেটওয়ার্ক সংযোগ করতে ব্যর্থ!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', width: '100%', padding: '20px 10px', color: '#f8fafc', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #334155', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', color: '#38bdf8', margin: '0 0 6px 0', fontWeight: 'bold' }}>✨ AI Studio Submission</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>ফাইল ও প্রম্পট জমা দিন</p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setType('image')}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: type === 'image' ? '#38bdf8' : 'transparent', color: type === 'image' ? '#0f172a' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            🖼️ Image Request
          </button>
          <button
            type="button"
            onClick={() => setType('video')}
            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: type === 'video' ? '#38bdf8' : 'transparent', color: type === 'video' ? '#0f172a' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            🎥 Video Request
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
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>✨ কী পরিবর্তন বা এডিট চান:</label>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: ব্যাকগ্রাউন্ড পাল্টে দাও..."
              style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#64748b' : '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            {loading ? '⏳ ফর্ম জমা হচ্ছে...' : '🚀 এডিট রিকোয়েস্ট পাঠান'}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', backgroundColor: message.type === 'success' ? '#064e3b' : '#881337', color: message.type === 'success' ? '#34d399' : '#fda4af', border: message.type === 'success' ? '1px solid #059669' : '1px solid #f43f5e' }}>
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
}
