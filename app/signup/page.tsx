"use client";
import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      await createUserWithEmailAndPassword(auth, email, password);
      setLoading(false);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) setError("خطا: " + err.message);
      else setError("خطای ناشناخته در ثبت‌نام");
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