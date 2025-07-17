"use client";
import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("لطفاً همه فیلدها را کامل کنید.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("پیام شما با موفقیت ارسال شد (نمونه).");
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="container" style={{ maxWidth: 480, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-4">
        <h3 className="mb-3 text-center">تماس با ما</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">نام</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="نام شما"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">ایمیل</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ایمیل شما"
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">پیام</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="متن پیام شما"
              style={{ resize: "none", textAlign: "right" }}
              disabled={loading}
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "در حال ارسال..." : "ارسال پیام"}
          </button>
        </form>
        <div className="text-center text-muted mt-4" style={{ fontSize: 13 }}>
          ایمیل پشتیبانی: support@razedel.com
        </div>
      </div>
    </div>
  );
} 