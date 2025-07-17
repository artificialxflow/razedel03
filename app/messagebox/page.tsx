"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function MessageBoxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "messages"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="container" style={{ maxWidth: 480, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-3">
        <h3 className="mb-3 text-center">صندوق پیام‌های من</h3>
        {!user ? (
          <div className="alert alert-warning text-center">برای مشاهده پیام‌ها باید وارد شوید.</div>
        ) : loading ? (
          <div className="text-center py-4">در حال بارگذاری...</div>
        ) : messages.length === 0 ? (
          <div className="alert alert-info text-center">هنوز پیامی ثبت نشده است.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map(msg => (
              <div key={msg.id} className="card p-3 shadow-sm">
                <div className="mb-2" style={{ fontSize: 15 }}>{msg.text}</div>
                <div className="text-muted" style={{ fontSize: 13, textAlign: "left" }}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString("fa-IR") : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 