"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { db, storage } from "../../lib/supabase";

type ContentType = 'text' | 'audio' | 'image';
type EmotionCategory = 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'calm' | 'love' | 'gratitude' | 'other';
type ListenerType = 'ai' | 'human' | 'both';

export default function NewMessagePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Form states
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>('text');
  const [emotionCategory, setEmotionCategory] = useState<EmotionCategory>('other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [listenerType, setListenerType] = useState<ListenerType>('ai');
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

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

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setContentType('audio');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('خطا در شروع ضبط صدا');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let audioUrl = null;
      
      // Upload audio file if exists
      if (audioBlob && contentType === 'audio') {
        const fileName = `audio_${Date.now()}.webm`;
        const { data, error: uploadError } = await storage.uploadAudio(audioBlob, fileName);
        
        if (uploadError) {
          throw new Error('خطا در آپلود فایل صوتی');
        }
        
        audioUrl = await storage.getAudioUrl(fileName);
      }

      // Create message data
      const messageData = {
        user_id: user.id,
        title: title || null,
        content: content,
        content_type: contentType,
        audio_url: audioUrl,
        emotion_category: emotionCategory,
        is_public: isPublic,
        is_anonymous: isAnonymous,
        listener_type: listenerType,
        ai_response: null,
        human_response: null
      };

      // Save to database
      const { data, error } = await db.messages.create(messageData);
      
      if (error) {
        throw new Error('خطا در ذخیره پیام');
      }

      setSuccess('پیام شما با موفقیت ارسال شد!');
      setContent("");
      setTitle("");
      setAudioBlob(null);
      setAudioUrl(null);
      setEmotionCategory('other');
      setIsAnonymous(false);
      setIsPublic(false);
      setListenerType('ai');
      setContentType('text');

      // Redirect to messagebox after 2 seconds
      setTimeout(() => {
        router.push('/messagebox');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'خطای ناشناخته');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emotionCategories = [
    { value: 'happy', label: 'شادی', icon: '😊' },
    { value: 'sad', label: 'غم', icon: '😢' },
    { value: 'angry', label: 'عصبانیت', icon: '😠' },
    { value: 'anxious', label: 'اضطراب', icon: '😰' },
    { value: 'excited', label: 'هیجان', icon: '🤩' },
    { value: 'calm', label: 'آرامش', icon: '😌' },
    { value: 'love', label: 'عشق', icon: '💕' },
    { value: 'gratitude', label: 'شکرگزاری', icon: '🙏' },
    { value: 'other', label: 'سایر', icon: '💭' }
  ];

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-ear fs-1 text-primary"></i>
                <h4 className="mt-2">ارسال پیام جدید</h4>
                <p className="text-muted">گاهی وقتا فقط گفتنش کافیه... حتی اگه هیچ کس ندونه!</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Content Type Selection */}
                <div className="btn-group d-flex justify-content-center mb-4" role="group">
                  <button
                    type="button"
                    className={`btn ${contentType === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setContentType('text')}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    متنی
                  </button>
                  <button
                    type="button"
                    className={`btn ${contentType === 'audio' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setContentType('audio')}
                  >
                    <i className="bi bi-mic me-2"></i>
                    صوتی
                  </button>
                </div>

                {/* Title Input */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">عنوان (اختیاری)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="عنوان پیام خود را وارد کنید..."
                  />
                </div>

                {/* Content Input */}
                {contentType === 'text' && (
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">متن پیام</label>
                    <textarea
                      className="form-control"
                      id="content"
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="هرچی تو دلت مونده رو بنویس..."
                      required
                    />
                  </div>
                )}

                {/* Audio Recording */}
                {contentType === 'audio' && (
                  <div className="mb-3">
                    <label className="form-label">ضبط صدا</label>
                    <div className="d-flex justify-content-center gap-3">
                      {!isRecording ? (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={startRecording}
                        >
                          <i className="bi bi-mic me-2"></i>
                          شروع ضبط
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={stopRecording}
                        >
                          <i className="bi bi-stop-circle me-2"></i>
                          توقف ضبط
                        </button>
                      )}
                    </div>
                    {audioUrl && (
                      <div className="mt-3">
                        <audio controls className="w-100">
                          <source src={audioUrl} type="audio/webm" />
                          مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                        </audio>
                      </div>
                    )}
                  </div>
                )}

                {/* Privacy Options */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="anonymous">
                        ارسال ناشناس
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="public"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="public">
                        نمایش عمومی
                      </label>
                    </div>
                  </div>
                </div>

                {/* Emotion Category */}
                <div className="mb-4">
                  <label className="form-label">رازت راجب چیه؟</label>
                  <div className="d-flex flex-wrap gap-2">
                    {emotionCategories.map((emotion) => (
                      <button
                        key={emotion.value}
                        type="button"
                        className={`btn btn-sm ${emotionCategory === emotion.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setEmotionCategory(emotion.value as EmotionCategory)}
                      >
                        {emotion.icon} {emotion.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listener Selection */}
                <div className="mb-4">
                  <label className="form-label">دوست داری کی به حرفت گوش بده؟</label>
                  <div className="row">
                    <div className="col-md-4">
                      <div
                        className={`card text-center cursor-pointer ${listenerType === 'ai' ? 'border-primary' : ''}`}
                        onClick={() => setListenerType('ai')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <i className="bi bi-robot fs-2 text-primary"></i>
                          <p className="card-text">هوش مصنوعی</p>
                          <small className="text-muted">(رایگان)</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div
                        className={`card text-center cursor-pointer ${listenerType === 'human' ? 'border-primary' : ''}`}
                        onClick={() => setListenerType('human')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <i className="bi bi-person-fill fs-2 text-success"></i>
                          <p className="card-text">دوست واقعی</p>
                          <small className="text-muted">(پولی)</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div
                        className={`card text-center cursor-pointer ${listenerType === 'both' ? 'border-primary' : ''}`}
                        onClick={() => setListenerType('both')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <i className="bi bi-people-fill fs-2 text-warning"></i>
                          <p className="card-text">هر دو</p>
                          <small className="text-muted">(ترکیبی)</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="alert alert-danger text-center py-2 mb-3">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success text-center py-2 mb-3">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting || (!content && !audioBlob)}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        ارسال پیام
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
