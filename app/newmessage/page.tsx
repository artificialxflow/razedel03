"use client";
import React, { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const EMOTIONS = [
  "خوشحال",
  "غمگین",
  "مضطرب",
  "عاشق",
  "امیدوار",
  "خسته",
  "سپاسگزار",
  "عصبانی"
];
const LISTENERS = [
  { value: "ai", label: "هوش مصنوعی (AI)" },
  { value: "human", label: "انسان واقعی" }
];

export default function NewMessagePage() {
  const [message, setMessage] = useState("");
  const [emotion, setEmotion] = useState("");
  const [listenerType, setListenerType] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !file.type.startsWith("audio/")) {
      setError("فقط فایل صوتی مجاز است.");
      setAudioFile(null);
      return;
    }
    setError("");
    setAudioFile(file || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!message.trim() && !audioFile) {
      setError("متن پیام یا فایل صوتی را وارد کنید.");
      return;
    }
    if (!emotion) {
      setError("لطفاً یک دسته‌بندی احساسی انتخاب کنید.");
      return;
    }
    if (!listenerType) {
      setError("لطفاً نوع شنونده را انتخاب کنید.");
      return;
    }
    if (!user) {
      setError("برای ارسال پیام باید وارد شوید.");
      return;
    }
    setLoading(true);
    let audioUrl = "";
    try {
      if (audioFile) {
        const storageRef = ref(storage, `messages/${user.uid}/${Date.now()}_${audioFile.name}`);
        await uploadBytes(storageRef, audioFile);
        audioUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, "messages"), {
        text: message,
        audioUrl,
        emotion,
        listenerType,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email || ""
      });
      setSuccess("پیام با موفقیت ارسال شد.");
      setMessage("");
      setAudioFile(null);
      setEmotion("");
      setListenerType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("خطا در ارسال پیام. لطفاً دوباره تلاش کنید.");
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 480, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-3">
        <h3 className="mb-3 text-center">ارسال دل‌نوشته جدید</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">متن پیام</label>
            <textarea
              className="form-control"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="دل‌نوشته خود را اینجا بنویسید..."
              style={{ resize: "none", textAlign: "right" }}
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">دسته‌بندی احساسی</label>
            <select
              className="form-select"
              value={emotion}
              onChange={e => setEmotion(e.target.value)}
              disabled={loading}
            >
              <option value="">انتخاب کنید...</option>
              {EMOTIONS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">نوع شنونده</label>
            <select
              className="form-select"
              value={listenerType}
              onChange={e => setListenerType(e.target.value)}
              disabled={loading}
            >
              <option value="">انتخاب کنید...</option>
              {LISTENERS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">فایل صوتی (اختیاری)</label>
            <input
              type="file"
              accept="audio/*"
              className="form-control"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}
          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? "در حال ارسال..." : "ارسال پیام"}
          </button>
        </form>
      </div>
    </div>
  );
} 