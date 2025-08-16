import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Comment } from './useMessages';

export interface CommentState {
  text: string;
  replyingTo: string | null;
  isSubmitting: boolean;
  editing: {
    commentId: string;
    content: string;
  } | null;
  replyingToComment: {
    messageId: string;
    commentId: string;
    replyTo: string;
  } | null;
}

export function useComments(userId: string) {
  const [commentState, setCommentState] = useState<CommentState>({
    text: '',
    replyingTo: null,
    isSubmitting: false,
    editing: null,
    replyingToComment: null,
  });

  // Update comment state
  const updateCommentState = useCallback((updates: Partial<CommentState>) => {
    console.log('updateCommentState called with updates:', updates);
    console.log('Previous commentState:', commentState);
    
    setCommentState(prev => {
      const newState = { ...prev, ...updates };
      console.log('New commentState:', newState);
      return newState;
    });
  }, [commentState]);

  // Reset comment state
  const resetCommentState = useCallback(() => {
    setCommentState({
      text: '',
      replyingTo: null,
      isSubmitting: false,
      editing: null,
      replyingToComment: null,
    });
  }, []);

  // Handle comment message
  const handleCommentMessage = useCallback((messageId: string) => {
    console.log('handleCommentMessage called with messageId:', messageId);
    console.log('Current commentState before update:', commentState);
    
    updateCommentState({
      replyingTo: messageId,
      replyingToComment: null,
      text: '',
    });
    
    console.log('commentState updated, new replyingTo:', messageId);
  }, [updateCommentState, commentState]);

  // Handle reply to comment
  const handleReplyToComment = useCallback((messageId: string, commentId: string, replyTo: string) => {
    updateCommentState({
      replyingToComment: {
        messageId,
        commentId,
        replyTo
      },
      replyingTo: messageId,
      text: '',
    });
  }, [updateCommentState]);

  // Handle edit comment
  const handleEditComment = useCallback((commentId: string, content: string) => {
    updateCommentState({
      editing: {
        commentId,
        content
      }
    });
  }, [updateCommentState]);

  // Submit comment
  const submitComment = useCallback(async (messageId: string, onSuccess?: () => void) => {
    if (!commentState.text.trim()) {
      throw new Error('لطفاً متن پاسخ را وارد کنید');
    }

    try {
      updateCommentState({ isSubmitting: true });

      const { data, error } = await supabase
        .from('comments')
        .insert([
          { 
            message_id: messageId, 
            user_id: userId, 
            content: commentState.text.trim(), 
            is_anonymous: false 
          }
        ])
        .select();

      if (error) {
        throw new Error('خطا در ارسال پاسخ');
      }

      // Reset state
      resetCommentState();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      return data?.[0];

    } catch (error) {
      throw error;
    } finally {
      updateCommentState({ isSubmitting: false });
    }
  }, [commentState.text, userId, updateCommentState, resetCommentState]);

  // Submit comment edit
  const submitCommentEdit = useCallback(async (commentId: string, newContent: string) => {
    if (!newContent.trim()) {
      throw new Error('لطفاً متن کامنت را وارد کنید');
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: newContent.trim() })
        .eq('id', commentId);

      if (error) {
        throw new Error('خطا در ویرایش کامنت');
      }

      // Reset editing state
      updateCommentState({ editing: null });

    } catch (error) {
      throw error;
    }
  }, [updateCommentState]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw new Error('خطا در حذف کامنت');
      }

    } catch (error) {
      throw error;
    }
  }, []);

  // Like message
  const likeMessage = useCallback(async (messageId: string) => {
    try {
      // TODO: Implement like functionality
      console.log('Like message:', messageId);
      
      // This would typically involve:
      // 1. Insert/update in likes table
      // 2. Update message likes_count
      // 3. Handle unlike if already liked
      
    } catch (error) {
      console.error('Error liking message:', error);
    }
  }, []);

  return {
    // State
    commentState,
    
    // Actions
    updateCommentState,
    resetCommentState,
    handleCommentMessage,
    handleReplyToComment,
    handleEditComment,
    submitComment,
    submitCommentEdit,
    deleteComment,
    likeMessage,
  };
}
