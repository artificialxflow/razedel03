"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, addDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const LISTENER_LABELS: Record<string, string> = {
  ai: "هوش مصنوعی (AI)",
  human: "انسان واقعی"
};

function Comments({ messageId, user }: { messageId: string; user: User | null }) {
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages", messageId, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [messageId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("برای ثبت کامنت باید وارد شوید.");
      return;
    }
    if (!comment.trim()) {
      setError("متن کامنت را وارد کنید.");
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "messages", messageId, "comments"), {
        text: comment,
        userId: user.uid,
        userEmail: user.email || "",
        createdAt: new Date()
      });
      setComment("");
    } catch {
      setError("خطا در ثبت کامنت. لطفاً دوباره تلاش کنید.");
    }
    setSending(false);
  };

  return (
    <div className="mt-3">
      <form onSubmit={handleAddComment} className="d-flex gap-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="افزودن کامنت..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>ارسال</button>
      </form>
      {error && <div className="alert alert-danger py-1 mb-2">{error}</div>}
      <div className="d-flex flex-column gap-2">
        {loading ? (
          <div className="text-muted">در حال بارگذاری کامنت‌ها...</div>
        ) : comments.length === 0 ? (
          <div className="text-muted">کامنتی ثبت نشده است.</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-light rounded p-2" style={{ fontSize: 14, textAlign: "right" }}>
              <span>{c.text}</span>
              <span className="text-muted ms-2" style={{ fontSize: 12 }}>
                {c.userEmail}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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

  const handleLike = async (id: string) => {
    const msgRef = doc(db, "messages", id);
    await updateDoc(msgRef, { likes: increment(1) });
  };
  const handleDislike = async (id: string) => {
    const msgRef = doc(db, "messages", id);
    await updateDoc(msgRef, { dislikes: increment(1) });
  };

  return (
    <main>
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
                  <div className="d-flex gap-2 align-items-center mb-2">
                    {msg.emotion && (
                      <span className="badge" style={{ background: "#a287f4", color: "#fff", fontSize: 13, padding: "6px 14px", borderRadius: 16 }}>{msg.emotion}</span>
                    )}
                    {msg.listenerType && (
                      <span className="badge" style={{ background: msg.listenerType === "ai" ? "#a287f4" : "#f7c8e0", color: msg.listenerType === "ai" ? "#fff" : "#333", fontSize: 13, padding: "6px 14px", borderRadius: 16 }}>
                        {LISTENER_LABELS[msg.listenerType] || msg.listenerType}
                      </span>
                    )}
                  </div>
                  <div className="mb-2" style={{ fontSize: 15 }}>{msg.text}</div>
                  {msg.audioUrl && (
                    <audio controls style={{ width: "100%", margin: "8px 0" }}>
                      <source src={msg.audioUrl} type="audio/mpeg" />
                      مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                    </audio>
                  )}
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <button type="button" className="btn btn-sm btn-outline-success" onClick={() => handleLike(msg.id)}>
                      👍 {msg.likes || 0}
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDislike(msg.id)}>
                      👎 {msg.dislikes || 0}
                    </button>
                  </div>
                  <div className="text-muted mt-2" style={{ fontSize: 13, textAlign: "left" }}>
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString("fa-IR") : ""}
                  </div>
                  <Comments messageId={msg.id} user={user} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}