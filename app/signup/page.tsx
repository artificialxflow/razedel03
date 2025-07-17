"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <div className="container" style={{ maxWidth: 400, margin: "100px auto", direction: "rtl" }}>
      <div className="card shadow p-4">
        <h2 className="mb-4 text-center">ثبت‌نام در راز دل</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">ایمیل</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رمز عبور</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="رمز عبور را وارد کنید"
              disabled={loading}
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-success w-100 mt-2" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/login" className="text-decoration-none">حساب کاربری دارید؟ ورود</a>
        </div>
      </div>
    </div>
  );
} 