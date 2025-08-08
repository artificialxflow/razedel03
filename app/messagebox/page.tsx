"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/supabase";

type Message = {
  id: string;
  title: string | null;
  content: string;
  content_type: 'text' | 'audio' | 'image';
  audio_url: string | null;
  emotion_category: string;
  is_public: boolean;
  is_anonymous: boolean;
  listener_type: 'ai' | 'human' | 'both';
  ai_response: string | null;
  human_response: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type TabType = 'received' | 'sent' | 'responses';

export default function MessageboxPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('sent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Load messages
  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user, activeTab]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const { data, error } = await db.messages.getUserMessages(user!.id);
      
      if (error) {
        throw new Error('خطا در بارگذاری پیام‌ها');
      }

      // Filter messages based on active tab
      let filteredMessages = data || [];
      
      switch (activeTab) {
        case 'sent':
          // All user's messages
          break;
        case 'received':
          // Messages with responses
          filteredMessages = filteredMessages.filter(msg => 
            msg.ai_response || msg.human_response
          );
          break;
        case 'responses':
          // Messages with responses
          filteredMessages = filteredMessages.filter(msg => 
            msg.ai_response || msg.human_response
          );
          break;
      }

      setMessages(filteredMessages);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟')) {
      return;
    }

    try {
      const { error } = await db.messages.delete(messageId);
      
      if (error) {
        throw new Error('خطا در حذف پیام');
      }

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      setError('لطفاً پیام‌هایی را برای حذف انتخاب کنید');
      return;
    }

    if (!confirm(`آیا مطمئن هستید که می‌خواهید ${selectedMessages.length} پیام را حذف کنید؟`)) {
      return;
    }

    try {
      for (const messageId of selectedMessages) {
        await db.messages.delete(messageId);
      }

      // Remove from local state
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmotionIcon = (emotion: string) => {
    const emotionIcons: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'anxious': '😰',
      'excited': '🤩',
      'calm': '😌',
      'love': '💕',
      'gratitude': '🙏',
      'other': '💭'
    };
    return emotionIcons[emotion] || '💭';
  };

  const getEmotionLabel = (emotion: string) => {
    const emotionLabels: { [key: string]: string } = {
      'happy': 'شادی',
      'sad': 'غم',
      'angry': 'عصبانیت',
      'anxious': 'اضطراب',
      'excited': 'هیجان',
      'calm': 'آرامش',
      'love': 'عشق',
      'gratitude': 'شکرگزاری',
      'other': 'سایر'
    };
    return emotionLabels[emotion] || 'سایر';
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
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-chat-dots fs-1 text-primary"></i>
                <h4 className="mt-2">صندوق پیام‌ها</h4>
                <p className="text-muted">رازهایی که گفتی، اینجا در امنیت کامل نگهداری میشن...</p>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mb-4" id="messageTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sent')}
                  >
                    <i className="bi bi-send me-2"></i>
                    پیام‌های ارسالی
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => setActiveTab('received')}
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    پیام‌های دریافتی
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('responses')}
                  >
                    <i className="bi bi-chat-heart me-2"></i>
                    پاسخ‌ها
                  </button>
                </li>
              </ul>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger text-center py-2 mb-3">
                  {error}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">در حال بارگذاری...</span>
                  </div>
                </div>
              )}

              {/* Messages List */}
              {!isLoading && messages.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-2">هیچ پیامی یافت نشد</p>
                </div>
              )}

              {!isLoading && messages.length > 0 && (
                <>
                  {/* Bulk Actions */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      {selectedMessages.length > 0 && (
                        <span className="text-muted">
                          {selectedMessages.length} پیام انتخاب شده
                        </span>
                      )}
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleDeleteSelected}
                        disabled={selectedMessages.length === 0}
                      >
                        <i className="bi bi-trash me-1"></i>
                        حذف انتخاب شده
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="list-group">
                    {messages.map((message) => (
                      <div key={message.id} className="list-group-item list-group-item-action">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={selectedMessages.includes(message.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMessages(prev => [...prev, message.id]);
                                  } else {
                                    setSelectedMessages(prev => prev.filter(id => id !== message.id));
                                  }
                                }}
                              />
                              <span className="badge bg-secondary me-2">
                                {getEmotionIcon(message.emotion_category)} {getEmotionLabel(message.emotion_category)}
                              </span>
                              {message.is_anonymous && (
                                <span className="badge bg-warning me-2">ناشناس</span>
                              )}
                              {message.is_public && (
                                <span className="badge bg-success me-2">عمومی</span>
                              )}
                            </div>
                            
                            {message.title && (
                              <h6 className="mb-2">{message.title}</h6>
                            )}
                            
                            <p className="mb-2">{message.content}</p>
                            
                            {message.audio_url && (
                              <div className="mb-2">
                                <audio controls className="w-100">
                                  <source src={message.audio_url} type="audio/webm" />
                                  مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                                </audio>
                              </div>
                            )}

                            {/* Responses */}
                            {(message.ai_response || message.human_response) && (
                              <div className="mt-3">
                                {message.ai_response && (
                                  <div className="alert alert-info py-2 mb-2">
                                    <small className="text-muted">پاسخ هوش مصنوعی:</small>
                                    <p className="mb-0">{message.ai_response}</p>
                                  </div>
                                )}
                                {message.human_response && (
                                  <div className="alert alert-success py-2 mb-2">
                                    <small className="text-muted">پاسخ دوست:</small>
                                    <p className="mb-0">{message.human_response}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted">
                                {formatDate(message.created_at)}
                              </small>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDeleteMessage(message.id)}
                                  title="حذف پیام"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}