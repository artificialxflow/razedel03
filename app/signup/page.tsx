"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Function to toggle dark mode
  const toggleDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Example of how you might set the theme
  useEffect(() => {
    // Here you would implement your theme detection logic
    // For now, let's default to light and provide a button to toggle
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggleDarkMode(isDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await signUp(email, password);
      if (result.success) {
        setLoading(false);
        // نمایش پیام موفقیت و درخواست تایید ایمیل
        setError(""); // پاک کردن خطاهای قبلی
        setSuccess(result.message || "ثبت‌نام با موفقیت انجام شد! لطفاً ایمیل خود را بررسی کرده و روی لینک تایید کلیک کنید.");
        // پاک کردن فرم
        setEmail("");
        setPassword("");
      } else {
        setLoading(false);
        setError(result.error || "خطا در ثبت‌نام");
      }
    } catch (err) {
      setLoading(false);
      setError("خطای ناشناخته در ثبت‌نام");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row align-items-center justify-content-center vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <div className="card-body">
              <div className="text-center mb-4">
                <h1 className="fw-bold">ثبت‌نام در راز دل</h1>
                <p className="text-muted">برای ساخت حساب کاربری جدید، اطلاعات زیر را وارد کنید</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ایمیل"
                    disabled={loading}
                    autoFocus
                  />
                  <label htmlFor="floatingInput">ایمیل</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="floatingPassword"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="رمز عبور"
                    disabled={loading}
                  />
                  <label htmlFor="floatingPassword">رمز عبور</label>
                </div>
                
                {error && <div className="alert alert-danger text-center py-2 mb-3">{error}</div>}
                {success && <div className="alert alert-success text-center py-2 mb-3">{success}</div>}
                
                <div className="d-grid">
                  <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                    {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <Link href="/login" className="text-decoration-none">
                  حساب کاربری دارید؟ <span className="fw-bold">وارد شوید</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}