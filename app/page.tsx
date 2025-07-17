"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import React from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err instanceof Error) setError("خطا در ثبت‌نام: " + err.message);
      else setError("خطای ناشناخته در ثبت‌نام");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err instanceof Error) setError("خطا در ورود: " + err.message);
      else setError("خطای ناشناخته در ورود");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center", direction: "rtl" }}>
        <h2>خوش آمدید، {user?.email}</h2>
        <button onClick={handleSignOut} style={{ padding: 8, width: 100 }}>خروج</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center", direction: "rtl" }}>
      <h2>ورود یا ثبت‌نام</h2>
      <form>
        <input
          type="email"
          placeholder="ایمیل خود را وارد کنید"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8, textAlign: "right" }}
        />
        <input
          type="password"
          placeholder="رمز عبور را وارد کنید"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8, textAlign: "right" }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={handleSignIn} disabled={loading} type="button">ورود</button>
          <button onClick={handleSignUp} disabled={loading} type="button">ثبت‌نام</button>
        </div>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
