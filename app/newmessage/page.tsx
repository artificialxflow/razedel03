"use client";
import React, { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
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
    <main className="flex-grow-1 overflow-auto p-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0 rounded-lg p-5">
          <h1 className="display-5 fw-bold text-center mb-4">ارسال دل‌نوشته جدید</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <textarea
                className="form-control"
                id="floatingMessage"
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="دل‌نوشته خود را اینجا بنویسید..."
                style={{ height: '150px' }}
                disabled={loading}
              />
              <label htmlFor="floatingMessage">متن پیام</label>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="floatingEmotion"
                    value={emotion}
                    onChange={e => setEmotion(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">انتخاب کنید...</option>
                    {EMOTIONS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <label htmlFor="floatingEmotion">دسته‌بندی احساسی</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="floatingListener"
                    value={listenerType}
                    onChange={e => setListenerType(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">انتخاب کنید...</option>
                    {LISTENERS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <label htmlFor="floatingListener">نوع شنونده</label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="audioFile" className="form-label">فایل صوتی (اختیاری)</label>
              <input
                type="file"
                accept="audio/*"
                className="form-control"
                id="audioFile"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            {error && <div className="alert alert-danger text-center py-2 mb-3">{error}</div>}
            {success && <div className="alert alert-success text-center py-2 mb-3">{success}</div>}
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !user}>
                {loading ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </div>
            {!user && <div className="alert alert-warning text-center py-2 mt-3">برای ارسال پیام باید وارد شوید.</div>}
          </form>
        </div>
      </div>
    </main>
  );
}
