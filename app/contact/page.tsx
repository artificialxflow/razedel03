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
    <main className="flex-grow-1 overflow-auto">
      <div className="container p-4">
        <div className="card shadow-lg border-0 rounded-lg p-5">
          <h1 className="display-5 fw-bold text-center mb-4">تماس با ما</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="نام"
                disabled={loading}
              />
              <label htmlFor="floatingName">نام</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ایمیل"
                disabled={loading}
              />
              <label htmlFor="floatingEmail">ایمیل</label>
            </div>
            <div className="form-floating mb-3">
              <textarea
                className="form-control"
                id="floatingMessage"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="پیام شما"
                style={{ height: '150px' }}
                disabled={loading}
              />
              <label htmlFor="floatingMessage">پیام شما</label>
            </div>
            {error && <div className="alert alert-danger text-center py-2 mb-3">{error}</div>}
            {success && <div className="alert alert-success text-center py-2 mb-3">{success}</div>}
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </div>
          </form>
          <div className="text-center text-muted mt-4">
            <p>ایمیل پشتیبانی: support@razedel.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}
