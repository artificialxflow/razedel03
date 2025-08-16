"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { db, supabase } from "../../lib/supabase";

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
  user_id: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    email: string;
  };
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
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [loadingComments, setLoadingComments] = useState<{[key: string]: boolean}>({});
  const [replyingToComment, setReplyingToComment] = useState<{
    messageId: string;
    commentId: string;
    replyTo: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    commentId: string;
    content: string;
  } | null>(null);

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
      
      let data;
      let error;
      
      // Load different data based on active tab
      switch (activeTab) {
        case 'sent':
          // All user's messages
          const sentResult = await db.messages.getUserMessages(user!.id);
          data = sentResult.data;
          error = sentResult.error;
          break;
        case 'received':
          // Public messages from other users
          const publicResult = await db.messages.getPublicMessages();
          data = publicResult.data;
          error = publicResult.error;
          // Filter out user's own messages
          if (data) {
            data = data.filter(msg => msg.user_id !== user!.id);
          }
          break;
        case 'responses':
          // پیام‌های کاربر که پاسخ دارند (AI، human یا کامنت)
          const userResult = await db.messages.getUserMessages(user!.id);
          data = userResult.data;
          error = userResult.error;
          if (data) {
            data = data.filter(msg => 
              msg.ai_response || 
              msg.human_response || 
              (msg.comments_count && msg.comments_count > 0)
            );
          }
          break;
        default:
          data = [];
          error = null;
      }
      
      if (error) {
        throw new Error('خطا در بارگذاری پیام‌ها');
      }

      setMessages(data || []);
      
      // بارگذاری خودکار پاسخ‌ها برای پیام‌های ارسالی و پاسخ‌ها
      if (activeTab === 'sent' || activeTab === 'responses') {
        for (const message of data || []) {
          if (message.comments_count && message.comments_count > 0) {
            await loadComments(message.id);
          }
        }
      }
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

  const handleLikeMessage = async (messageId: string) => {
    try {
      // TODO: Implement like functionality
      console.log('Liking message:', messageId);
      // اینجا باید کد لایک کردن پیام اضافه شود
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  };

  const handleCommentMessage = async (messageId: string) => {
    setReplyingTo(messageId);
    setCommentText("");
  };

  const submitComment = async (messageId: string) => {
    if (!commentText.trim()) {
      setError('لطفاً متن کامنت را وارد کنید');
      return;
    }

    try {
      setIsSubmittingComment(true);
      setError("");

      // ارسال کامنت به Supabase
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            message_id: messageId,
            user_id: user!.id,
            content: commentText.trim(),
            is_anonymous: false
          }
        ])
        .select();

      if (error) {
        throw new Error('خطا در ارسال کامنت');
      }

      // به‌روزرسانی تعداد کامنت‌ها در پیام
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, comments_count: (msg.comments_count || 0) + 1 }
          : msg
      ));

      // بارگذاری مجدد پاسخ‌ها
      await loadComments(messageId);

      // پاک کردن فرم
      setCommentText("");
      setReplyingTo(null);

      // نمایش پیام موفقیت
      setError(""); // پاک کردن خطاهای قبلی
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadComments = async (messageId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [messageId]: true }));
      
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('خطا در بارگذاری پاسخ‌ها:', error);
        return;
      }
      
      if (data) {
        setComments(prev => ({ ...prev, [messageId]: data }));
      }
    } catch (error) {
      console.error('خطا در بارگذاری پاسخ‌ها:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const toggleComments = async (messageId: string) => {
    if (comments[messageId]) {
      // اگر پاسخ‌ها بارگذاری شده‌اند، آن‌ها را مخفی کن
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[messageId];
        return newComments;
      });
    } else {
      // اگر پاسخ‌ها بارگذاری نشده‌اند، آن‌ها را بارگذاری کن
      await loadComments(messageId);
    }
  };

  const handleReplyToComment = (messageId: string, commentId: string, replyTo: string) => {
    setReplyingToComment({ messageId, commentId, replyTo });
    setCommentText(`@${replyTo} `);
    setReplyingTo(messageId);
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment({ commentId, content: currentContent });
  };

  const handleDeleteComment = async (commentId: string, messageId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کامنت را حذف کنید؟')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw new Error('خطا در حذف کامنت');
      }

      // به‌روزرسانی تعداد کامنت‌ها در پیام
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, comments_count: Math.max(0, (msg.comments_count || 0) - 1) }
          : msg
      ));

      // حذف کامنت از state
      setComments(prev => ({
        ...prev,
        [messageId]: prev[messageId]?.filter(c => c.id !== commentId) || []
      }));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  };

  const submitCommentEdit = async (commentId: string, newContent: string) => {
    if (!newContent.trim()) {
      setError('لطفاً متن کامنت را وارد کنید');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: newContent.trim() })
        .eq('id', commentId);

      if (error) {
        throw new Error('خطا در ویرایش کامنت');
      }

      // به‌روزرسانی کامنت در state
      setComments(prev => {
        const newComments = { ...prev };
        Object.keys(newComments).forEach(messageId => {
          newComments[messageId] = newComments[messageId].map(c => 
            c.id === commentId ? { ...c, content: newContent.trim() } : c
          );
        });
        return newComments;
      });

      // پاک کردن state ویرایش
      setEditingComment(null);

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

              {/* Comment Form */}
              {replyingTo && (
                <div className="alert alert-info mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-chat-dots me-2"></i>
                    <strong>
                      {replyingToComment ? `پاسخ به کامنت ${replyingToComment.replyTo}:` : 'نوشتن پاسخ:'}
                    </strong>
                  </div>
                  <textarea
                    className="form-control mb-2"
                    rows={3}
                    placeholder={replyingToComment ? `پاسخ خود را به ${replyingToComment.replyTo} بنویسید...` : "پاسخ خود را بنویسید..."}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmittingComment}
                  />
                  <div className="btn-group">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => submitComment(replyingTo)}
                      disabled={isSubmittingComment || !commentText.trim()}
                    >
                      {isSubmittingComment ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-1"></i>
                          ارسال پاسخ
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyingToComment(null);
                        setCommentText("");
                      }}
                      disabled={isSubmittingComment}
                    >
                      <i className="bi bi-x me-1"></i>
                      لغو
                    </button>
                  </div>
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
                              {/* نمایش نام فرستنده برای پیام‌های دریافتی */}
                              {activeTab === 'received' && message.profiles && (
                                <span className="badge bg-info me-2">
                                  <i className="bi bi-person me-1"></i>
                                  {message.profiles.full_name || message.profiles.username || message.profiles.email}
                                </span>
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

                            {/* نمایش پاسخ‌ها */}
                            {comments[message.id] && (
                              <div className="mt-3">
                                <h6 className="text-muted mb-2">
                                  <i className="bi bi-chat-dots me-1"></i>
                                  پاسخ‌ها ({comments[message.id].length})
                                </h6>
                                {comments[message.id].map(comment => (
                                  <div key={comment.id} className="alert alert-light py-2 mb-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-1">
                                          <strong className="text-primary me-2">
                                            {comment.profiles?.full_name || comment.profiles?.username || comment.profiles?.email}
                                          </strong>
                                          <small className="text-muted">
                                            {formatDate(comment.created_at)}
                                          </small>
                                        </div>
                                        
                                        {/* نمایش کامنت یا فرم ویرایش */}
                                        {editingComment?.commentId === comment.id ? (
                                          <div className="mb-2">
                                            <textarea
                                              className="form-control mb-2"
                                              rows={2}
                                              value={editingComment?.content || ''}
                                              onChange={(e) => setEditingComment(prev => prev ? { ...prev, content: e.target.value } : null)}
                                            />
                                            <div className="btn-group btn-group-sm">
                                              <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => editingComment && submitCommentEdit(comment.id, editingComment.content)}
                                              >
                                                <i className="bi bi-check"></i>
                                                ذخیره
                                              </button>
                                              <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setEditingComment(null)}
                                              >
                                                <i className="bi bi-x"></i>
                                                لغو
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="mb-2">{comment.content}</p>
                                        )}
                                        
                                        {/* دکمه‌های تعامل */}
                                        <div className="btn-group btn-group-sm">
                                          <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleReplyToComment(message.id, comment.id, comment.profiles?.email || 'کاربر')}
                                            title="پاسخ به این کامنت"
                                          >
                                            <i className="bi bi-reply"></i>
                                            پاسخ
                                          </button>
                                          
                                          {/* دکمه‌های ویرایش و حذف برای کامنت‌های خود کاربر */}
                                          {comment.user_id === user!.id && (
                                            <>
                                              <button
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() => handleEditComment(comment.id, comment.content)}
                                                title="ویرایش کامنت"
                                              >
                                                <i className="bi bi-pencil"></i>
                                                ویرایش
                                              </button>
                                              <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeleteComment(comment.id, message.id)}
                                                title="حذف کامنت"
                                              >
                                                <i className="bi bi-trash"></i>
                                                حذف
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Loading برای پاسخ‌ها */}
                            {loadingComments[message.id] && (
                              <div className="mt-3 text-center">
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                  <span className="visually-hidden">در حال بارگذاری پاسخ‌ها...</span>
                                </div>
                                <small className="text-muted ms-2">در حال بارگذاری پاسخ‌ها...</small>
                              </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted">
                                {formatDate(message.created_at)}
                              </small>
                              <div className="btn-group btn-group-sm">
                                {/* دکمه‌های تعامل برای پیام‌های دریافتی */}
                                {activeTab === 'received' && (
                                  <>
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() => handleLikeMessage(message.id)}
                                      title="لایک"
                                    >
                                      <i className="bi bi-heart"></i>
                                      <span className="ms-1">{message.likes_count || 0}</span>
                                    </button>
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => toggleComments(message.id)}
                                      title="نمایش پاسخ‌ها"
                                    >
                                      <i className="bi bi-chat"></i>
                                      <span className="ms-1">{message.comments_count || 0}</span>
                                    </button>
                                    <button
                                      className="btn btn-outline-info"
                                      onClick={() => handleCommentMessage(message.id)}
                                      title="نوشتن پاسخ"
                                    >
                                      <i className="bi bi-reply"></i>
                                      پاسخ
                                    </button>
                                  </>
                                )}
                                {/* دکمه‌های تعامل برای پیام‌های ارسالی */}
                                {activeTab === 'sent' && (
                                  <>
                                    <button
                                      className="btn btn-outline-success"
                                      onClick={() => toggleComments(message.id)}
                                      title="نمایش پاسخ‌ها"
                                    >
                                      <i className="bi bi-chat"></i>
                                      <span className="ms-1">{message.comments_count || 0}</span>
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDeleteMessage(message.id)}
                                      title="حذف پیام"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </>
                                )}
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