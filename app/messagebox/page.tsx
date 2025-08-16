"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useMessages } from "../hooks/useMessages";
import { useComments } from "../hooks/useComments";
import { useRealTime } from "../hooks/useRealTime";
import { Message, Comment } from "../hooks/useMessages";

export default function MessageboxPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Custom hooks
  const {
    messages,
    activeTab,
    isLoading,
    error,
    selectedMessages,
    comments,
    loadingComments,
    commentNotifications,
    unreadNotifications,
    setError,
    toggleComments,
    updateMessageCommentCount,
    addCommentNotification,
    markNotificationAsRead,
    clearAllNotifications,
    handleCommentChange,
    loadCommentWithProfile,
    removeCommentFromState,
    updateCommentInState,
    handleMessageSelection,
    handleSelectAll,
    handleTabChange,
    setMessages,
    setSelectedMessages,
    setCommentNotifications,
    setComments,
  } = useMessages(user?.id || '');

  const {
    commentState,
    updateCommentState,
    resetCommentState,
    handleCommentMessage,
    handleReplyToComment,
    handleEditComment,
    submitComment,
    submitCommentEdit,
    deleteComment,
    likeMessage,
  } = useComments(user?.id || '');

  // Real-time updates
  useRealTime(user?.id || '', handleCommentChange);

  // Check authentication
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Handle comment submission
  const handleSubmitComment = useCallback(async (messageId: string) => {
    try {
      const newComment = await submitComment(messageId, () => {
        // Success callback - update message comment count
        updateMessageCommentCount(messageId, 1);
      });

      // Add comment to state with profile after successful submission
      if (newComment && user) {
        const commentWithProfile = {
          ...newComment,
          profiles: {
            full_name: user.user_metadata?.full_name || null,
            username: user.user_metadata?.username || null,
            email: user.email || ''
          }
        };
        
        setComments(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), commentWithProfile]
        }));
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  }, [submitComment, updateMessageCommentCount, user, setError]);

  // Handle comment deletion
  const handleDeleteComment = useCallback(async (commentId: string, messageId: string) => {
    try {
      await deleteComment(commentId);
      
      // Update message comment count
      updateMessageCommentCount(messageId, -1);
      
      // Remove comment from state
      removeCommentFromState(commentId, messageId);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  }, [deleteComment, updateMessageCommentCount, removeCommentFromState, setError]);

  // Handle comment edit
  const handleSubmitCommentEdit = useCallback(async (commentId: string, newContent: string) => {
    try {
      await submitCommentEdit(commentId, newContent);
      
      // Update comment in state
      updateCommentInState({ id: commentId, content: newContent } as Comment);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  }, [submitCommentEdit, updateCommentInState, setError]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw new Error('خطا در حذف پیام');
      }

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setError('');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  }, [setError]);

  // Handle bulk message deletion
  const handleDeleteSelected = useCallback(async () => {
    if (selectedMessages.length === 0) {
      setError('لطفاً پیام‌هایی را برای حذف انتخاب کنید');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', selectedMessages);

      if (error) {
        throw new Error('خطا در حذف پیام‌ها');
      }

      // Remove from local state
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      setError('');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    }
  }, [selectedMessages, setError]);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <style jsx>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        .border-warning {
          border-color: #ffc107 !important;
        }
      `}</style>
      <h1 className="text-center mb-4">
        <i className="bi bi-chat-dots text-primary me-2"></i>
        صندوق پیام ها
      </h1>
      <p className="text-center text-muted mb-4">
        رازهایی که گفتی اینجا در امنیت کامل نگهداری میشن...
      </p>

      {/* اعلان‌های کامنت جدید */}
      {commentNotifications.length > 0 && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="bi bi-bell-fill me-2 text-warning"></i>
              <div>
                <strong>پیام جدید!</strong>
                <div className="small">
                  {commentNotifications.length} کامنت جدید دریافت شده است
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-info"
                onClick={() => {
                  // Scroll to first unread message
                  const firstUnread = Object.keys(unreadNotifications).find(id => unreadNotifications[id]);
                  if (firstUnread) {
                    const element = document.getElementById(`message-${firstUnread}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    markNotificationAsRead(firstUnread);
                  }
                }}
              >
                <i className="bi bi-eye me-1"></i>
                مشاهده
              </button>
              <button 
                type="button" 
                className="btn-close" 
                onClick={clearAllNotifications}
              ></button>
            </div>
          </div>
        </div>
      )}

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
              <ul className="nav nav-tabs nav-fill mb-4" id="messageTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'responses' ? 'active' : ''}`}
                    onClick={() => handleTabChange('responses')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    پاسخ ها
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'received' ? 'active' : ''}`}
                    onClick={() => handleTabChange('received')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-inbox me-2"></i>
                    پیام های دریافتی
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'sent' ? 'active' : ''}`}
                    onClick={() => handleTabChange('sent')}
                    type="button"
                    role="tab"
                  >
                    <i className="bi bi-send me-2"></i>
                    پیام های ارسالی
                  </button>
                </li>
              </ul>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              {/* Delete Selected Button */}
              {selectedMessages.length > 0 && (
                <div className="mb-3">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteSelected}
                  >
                    <i className="bi bi-trash me-2"></i>
                    حذف انتخاب شده ({selectedMessages.length})
                  </button>
                </div>
              )}

              {/* Messages Display */}
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">در حال بارگذاری پیام‌ها...</span>
                  </div>
                  <p className="mt-2 text-muted">در حال بارگذاری پیام‌ها...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="mt-2 text-muted">هیچ پیامی یافت نشد</p>
                </div>
              ) : (
                <>
                  <div className="row">
                    {messages.map((message) => (
                      <div key={message.id} className="col-12 mb-3">
                        <div 
                          id={`message-${message.id}`}
                          className={`card border-0 shadow-sm ${
                            unreadNotifications[message.id] ? 'border-warning border-3' : ''
                          }`}
                        >
                          {/* نشانگر پیام جدید */}
                          {unreadNotifications[message.id] && (
                            <div className="position-absolute top-0 start-0 p-2">
                              <span className="badge bg-warning text-dark animate-pulse">
                                <i className="bi bi-star-fill me-1"></i>
                                جدید
                              </span>
                            </div>
                          )}
                          <div className="card-body">
                            {/* Message Header */}
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  checked={selectedMessages.includes(message.id)}
                                  onChange={() => handleMessageSelection(message.id)}
                                />
                                {activeTab === 'received' && message.profiles && (
                                  <div className="me-2">
                                    <i className="bi bi-person-circle text-primary"></i>
                                    <span className="text-primary ms-1">
                                      {message.profiles.full_name || message.profiles.username || message.profiles.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="d-flex gap-1">
                                {message.is_public && (
                                  <span className="badge bg-success">عمومی</span>
                                )}
                                <span className="badge bg-warning text-dark">{message.emotion_category}</span>
                              </div>
                            </div>

                            {/* Message Content */}
                            <h6 className="card-title mb-2">{message.title || 'بدون عنوان'}</h6>
                            <p className="card-text mb-3">{message.content}</p>

                            {/* Comment Count Display */}
                            {message.comments_count > 0 && (
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-chat-dots text-primary me-2"></i>
                                <span className="text-primary">
                                  پاسخ ها ({message.comments_count})
                                </span>
                                {!comments[message.id] && (
                                  <button
                                    className="btn btn-outline-primary btn-sm ms-2"
                                    onClick={() => toggleComments(message.id)}
                                  >
                                    <i className="bi bi-eye"></i>
                                    نمایش
                                  </button>
                                )}
                                {comments[message.id] && (
                                  <button
                                    className="btn btn-outline-secondary btn-sm ms-2"
                                    onClick={() => toggleComments(message.id)}
                                  >
                                    <i className="bi bi-eye-slash"></i>
                                    مخفی
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Comments Display */}
                            {comments[message.id] && (
                              <div className="mt-3 border-start border-primary ps-3">
                                {comments[message.id].map((comment) => (
                                  <div key={comment.id} className="mb-2 p-2 bg-light rounded">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-1">
                                          <i className="bi bi-person-circle text-primary me-1"></i>
                                          <span className="text-primary small">
                                            {comment.profiles?.full_name || comment.profiles?.username || comment.profiles?.email}
                                          </span>
                                        </div>
                                        {commentState.editing?.commentId === comment.id ? (
                                          <div className="mb-2">
                                            <textarea
                                              className="form-control form-control-sm"
                                              rows={2}
                                              value={commentState.editing.content}
                                              onChange={(e) => updateCommentState({
                                                editing: {
                                                  ...commentState.editing!,
                                                  content: e.target.value
                                                }
                                              })}
                                            />
                                            <div className="mt-1">
                                              <button
                                                className="btn btn-success btn-sm me-1"
                                                onClick={() => handleSubmitCommentEdit(comment.id, commentState.editing!.content)}
                                              >
                                                <i className="bi bi-check"></i>
                                                ذخیره
                                              </button>
                                              <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => updateCommentState({ editing: null })}
                                              >
                                                <i className="bi bi-x"></i>
                                                لغو
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="mb-1 small">{comment.content}</p>
                                        )}
                                        <small className="text-muted">{formatDate(comment.created_at)}</small>
                                      </div>
                                      <div className="ms-2">
                                        {comment.user_id === user!.id && (
                                          <>
                                            <button
                                              className="btn btn-outline-info btn-sm me-1"
                                              onClick={() => handleReplyToComment(message.id, comment.id, comment.profiles?.full_name || comment.profiles?.username || 'کاربر')}
                                              title="پاسخ به کامنت"
                                            >
                                              <i className="bi bi-reply"></i>
                                              پاسخ
                                            </button>
                                            <button
                                              className="btn btn-outline-warning btn-sm me-1"
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

                            {/* Comment Form - باز می‌شود نزدیک پیام */}
                            {commentState.replyingTo === message.id && (
                              <div className="card mt-3 border-primary">
                                <div className="card-header bg-primary text-white py-2">
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-chat-dots me-2"></i>
                                    <strong className="small">
                                      {commentState.replyingToComment ? `پاسخ به کامنت ${commentState.replyingToComment.replyTo}:` : 'نوشتن پاسخ:'}
                                    </strong>
                                  </div>
                                </div>
                                <div className="card-body p-3">
                                  <textarea
                                    className="form-control mb-2"
                                    rows={3}
                                    placeholder={commentState.replyingToComment ? `پاسخ خود را به ${commentState.replyingToComment.replyTo} بنویسید...` : "پاسخ خود را بنویسید..."}
                                    value={commentState.text}
                                    onChange={(e) => updateCommentState({ text: e.target.value })}
                                    disabled={commentState.isSubmitting}
                                  />
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleSubmitComment(message.id)}
                                      disabled={commentState.isSubmitting || !commentState.text.trim()}
                                    >
                                      {commentState.isSubmitting ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                          در حال ارسال...
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-send me-2"></i>
                                          ارسال پاسخ
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={resetCommentState}
                                      disabled={commentState.isSubmitting}
                                    >
                                      <i className="bi bi-x me-1"></i>
                                      لغو
                                    </button>
                                  </div>
                                </div>
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
                                      onClick={() => likeMessage(message.id)}
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
                                {/* دکمه‌های تعامل برای تب پاسخ‌ها */}
                                {activeTab === 'responses' && (
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

              {/* Comment Form - حذف شده و به بالای هر پیام منتقل شده */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}