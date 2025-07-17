"use client";
import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export default function DashboardPage() {
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
    <div className="container" style={{ maxWidth: 600, margin: "100px auto", direction: "rtl" }}>
      <div className="card shadow p-4 text-center">
        <h2>خوش آمدید به داشبورد، {user.email}</h2>
        <button className="btn btn-danger mt-4" onClick={handleLogout}>خروج از حساب</button>
      </div>
    </div>
  );
} 