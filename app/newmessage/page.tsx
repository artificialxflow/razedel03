"use client";
import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function NewMessagePage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!message.trim()) {
      setError("متن پیام را وارد کنید.");
      return;
    }
    if (!user) {
      setError("برای ارسال پیام باید وارد شوید.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email || ""
      });
      setSuccess("پیام با موفقیت ارسال شد.");
      setMessage("");
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