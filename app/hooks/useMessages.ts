import { useState, useEffect, useCallback } from 'react';
import { db, supabase } from '../../lib/supabase';

export interface Message {
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
}

export interface Comment {
  id: string;
  message_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    email: string;
  };
}

export type TabType = 'responses' | 'received' | 'sent';

export function useMessages(userId: string) {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('responses');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  // Comment states
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [loadingComments, setLoadingComments] = useState<{[key: string]: boolean}>({});
  const [commentNotifications, setCommentNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<{[key: string]: boolean}>({});

  // Load messages based on active tab
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      let data;
      let error;
      
      switch (activeTab) {
        case 'responses':
          const userResult = await db.messages.getUserMessages(userId);
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
        case 'received':
          const publicResult = await db.messages.getPublicMessages();
          data = publicResult.data;
          error = publicResult.error;
          if (data) {
            data = data.filter(msg => msg.user_id !== userId);
          }
          break;
        case 'sent':
          const sentResult = await db.messages.getUserMessages(userId);
          data = sentResult.data;
          error = sentResult.error;
          break;
      }

      if (error) {
        throw new Error(error.message);
      }

      setMessages(data || []);
      
      // Auto-load comments for messages with comments
      if (data && data.length > 0) {
        for (const message of data) {
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
  }, [activeTab, userId]);

  // Load comments for a specific message
  const loadComments = useCallback(async (messageId: string) => {
    try {
      setLoadingComments(prev => ({ ...prev, [messageId]: true }));

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            email
          )
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error('خطا در بارگذاری پاسخ‌ها');
      }

      setComments(prev => ({
        ...prev,
        [messageId]: data || []
      }));

    } catch (error) {
      console.error('خطا در بارگذاری پاسخ‌ها:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [messageId]: false }));
    }
  }, []);

  // Toggle comments visibility
  const toggleComments = useCallback((messageId: string) => {
    if (comments[messageId]) {
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[messageId];
        return newComments;
      });
    } else {
      loadComments(messageId);
    }
  }, [comments, loadComments]);

  // Update message comment count
  const updateMessageCommentCount = useCallback((messageId: string, change: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, comments_count: Math.max(0, (msg.comments_count || 0) + change) }
        : msg
    ));
  }, []);

  // Add comment notification with message info
  const addCommentNotification = useCallback((messageId: string, commentData?: any) => {
    const notification = {
      id: Date.now().toString(),
      messageId,
      commentData,
      timestamp: new Date(),
      isRead: false
    };
    
    setCommentNotifications(prev => [...prev, notification]);
    setUnreadNotifications(prev => ({ ...prev, [messageId]: true }));
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setCommentNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((messageId: string) => {
    setUnreadNotifications(prev => ({ ...prev, [messageId]: false }));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setCommentNotifications([]);
    setUnreadNotifications({});
  }, []);

  // Handle comment changes from real-time
  const handleCommentChange = useCallback(async (payload: any) => {
    try {
      if (payload.eventType === 'INSERT') {
        const newComment = payload.new;
        console.log('کامنت جدید دریافت شد:', newComment);
        
        updateMessageCommentCount(newComment.message_id, 1);
        await loadCommentWithProfile(newComment.message_id, newComment);
        addCommentNotification(newComment.message_id, newComment);
        
      } else if (payload.eventType === 'DELETE') {
        const deletedComment = payload.old;
        console.log('کامنت حذف شد:', deletedComment);
        
        updateMessageCommentCount(deletedComment.message_id, -1);
        removeCommentFromState(deletedComment.id, deletedComment.message_id);
        
      } else if (payload.eventType === 'UPDATE') {
        const updatedComment = payload.new;
        console.log('کامنت ویرایش شد:', updatedComment);
        updateCommentInState(updatedComment);
      }
    } catch (error) {
      console.error('خطا در مدیریت تغییرات کامنت:', error);
    }
  }, [updateMessageCommentCount, addCommentNotification]);

  // Load comment with profile
  const loadCommentWithProfile = useCallback(async (messageId: string, comment: Comment) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', comment.user_id)
        .single();

      const commentWithProfile = {
        ...comment,
        profiles: profileData
      };

      setComments(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), commentWithProfile]
      }));

    } catch (error) {
      console.error('خطا در بارگذاری پروفایل کامنت:', error);
    }
  }, []);

  // Remove comment from state
  const removeCommentFromState = useCallback((commentId: string, messageId: string) => {
    setComments(prev => ({
      ...prev,
      [messageId]: prev[messageId]?.filter(c => c.id !== commentId) || []
    }));
  }, []);

  // Update comment in state
  const updateCommentInState = useCallback((updatedComment: Comment) => {
    setComments(prev => {
      const newComments = { ...prev };
      Object.keys(newComments).forEach(messageId => {
        newComments[messageId] = newComments[messageId].map(c => 
          c.id === updatedComment.id ? { ...c, ...updatedComment } : c
        );
      });
      return newComments;
    });
  }, []);

  // Message selection
  const handleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(msg => msg.id));
    }
  }, [selectedMessages.length, messages]);

  // Tab change
  const handleTabChange = useCallback((tab: TabType) => {
    console.log('تغییر تب به:', tab);
    setActiveTab(tab);
  }, []);

  // Load messages when tab changes
  useEffect(() => {
    if (userId) {
      loadMessages();
    }
  }, [userId, activeTab, loadMessages]);

  return {
    // State
    messages,
    activeTab,
    isLoading,
    error,
    selectedMessages,
    comments,
    loadingComments,
    commentNotifications,
    unreadNotifications,
    
    // Actions
    setError,
    setMessages,
    setSelectedMessages,
    setCommentNotifications,
    setComments,
    loadMessages,
    loadComments,
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
  };
}
