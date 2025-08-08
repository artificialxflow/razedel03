"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

// Mock data for user stats and activity
const userStats = {
  messages: 28,
  comments: 12,
  likes: 150,
};

const recentActivity = [
  { id: 1, type: "comment", text: "نظر شما در مورد 'روزهای سخت' ثبت شد." },
  { id: 2, type: "like", text: "شما پیام 'طلوع امید' را پسندیدید." },
  { id: 3, type: "message", text: "پیام جدیدی با عنوان 'سکوت شب' ارسال کردید." },
  { id: 4, type: "comment", text: "نظر شما در مورد 'جاده موفقیت' ثبت شد." },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="flex-grow-1 overflow-auto p-lg-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
              <div className="card-header bg-primary text-white p-4 text-center">
                <img 
                  src={`https://i.pravatar.cc/150?u=${user.id}`}
                  alt="Profile Picture"
                  className="rounded-circle img-thumbnail mb-3" 
                  width={120}
                  height={120}
                />
                <h2 className="fw-bold mb-1">{user.email}</h2>
                <p className="text-white-50 mb-0">کاربر فعال</p>
              </div>
              <div className="card-body p-4">
                <div className="row text-center mb-4">
                  <div className="col-4">
                    <h4 className="fw-bold">{userStats.messages}</h4>
                    <p className="text-muted mb-0">پیام‌ها</p>
                  </div>
                  <div className="col-4">
                    <h4 className="fw-bold">{userStats.comments}</h4>
                    <p className="text-muted mb-0">نظرات</p>
                  </div>
                  <div className="col-4">
                    <h4 className="fw-bold">{userStats.likes}</h4>
                    <p className="text-muted mb-0">لایک‌ها</p>
                  </div>
                </div>

                <hr />

                <div className="text-center my-4">
                  <Link href="/setting" className="btn btn-outline-primary mx-2">
                    <i className="bi bi-gear me-2"></i>
                    تنظیمات حساب
                  </Link>
                  <button className="btn btn-outline-danger mx-2" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    خروج
                  </button>
                </div>

                <hr />

                <div>
                  <h4 className="fw-bold mb-3">فعالیت‌های اخیر</h4>
                  <ul className="list-group list-group-flush">
                    {recentActivity.map(activity => (
                      <li key={activity.id} className="list-group-item d-flex align-items-center">
                        <i className={`bi ${activity.type === 'comment' ? 'bi-chat-dots' : activity.type === 'like' ? 'bi-heart' : 'bi-send'} me-3 fs-4`}></i>
                        <span>{activity.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}