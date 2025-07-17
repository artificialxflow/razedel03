"use client";
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-4 text-center">
        <h3 className="mb-4">پروفایل کاربری</h3>
        <div className="mb-3">
          <strong>ایمیل:</strong>
          <div className="text-muted">{user.email}</div>
        </div>
        <div className="mb-4">
          <strong>شناسه کاربر:</strong>
          <div className="text-muted" style={{ fontSize: 13 }}>{user.uid}</div>
        </div>
        <button className="btn btn-danger w-100" onClick={handleLogout}>خروج از حساب</button>
      </div>
    </div>
  );
} 