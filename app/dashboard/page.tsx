"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import Link from 'next/link';

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

  if (!user) return null;

  return (
    <main className="flex-grow-1 overflow-auto p-lg-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-lg border-0 rounded-lg p-5 mb-4">
              <div className="text-center">
                <h1 className="display-4 fw-bold mb-3">خوش آمدید، {user.email?.split('@')[0]}!</h1>
                <p className="lead text-muted">امروز چه احساسی دارید؟</p>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <Link href="/newmessage" className="card h-100 shadow-sm border-0 rounded-lg p-4 text-center text-decoration-none d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-plus-circle-fill text-primary display-4 mb-3"></i>
                  <h5 className="card-title fw-bold">ارسال دل‌نوشته جدید</h5>
                  <p className="card-text text-muted">احساسات خود را به اشتراک بگذارید.</p>
                </Link>
              </div>
              <div className="col-md-6">
                <Link href="/messagebox" className="card h-100 shadow-sm border-0 rounded-lg p-4 text-center text-decoration-none d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-chat-dots-fill text-success display-4 mb-3"></i>
                  <h5 className="card-title fw-bold">صندوق پیام‌های من</h5>
                  <p className="card-text text-muted">پیام‌ها و نظرات دریافتی را مشاهده کنید.</p>
                </Link>
              </div>
            </div>

            <div className="card shadow-lg border-0 rounded-lg p-5">
              <h2 className="fw-bold mb-4 text-center">ابزارهای آرامش</h2>
              <div className="row g-4">
                <div className="col-md-6">
                  <Link href="/meditation" className="card h-100 shadow-sm border-0 rounded-lg p-4 text-center text-decoration-none d-flex flex-column justify-content-center align-items-center">
                    <i className="bi bi-music-note-beamed text-info display-4 mb-3"></i>
                    <h5 className="card-title fw-bold">مدیتیشن و آرامش</h5>
                    <p className="card-text text-muted">با جملات الهام‌بخش آرامش پیدا کنید.</p>
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link href="/profile" className="card h-100 shadow-sm border-0 rounded-lg p-4 text-center text-decoration-none d-flex flex-column justify-content-center align-items-center">
                    <i className="bi bi-person-fill text-warning display-4 mb-3"></i>
                    <h5 className="card-title fw-bold">پروفایل من</h5>
                    <p className="card-text text-muted">اطلاعات کاربری و فعالیت‌های خود را ببینید.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}