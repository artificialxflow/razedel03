import { useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useRealTime(userId: string, onCommentChange: (payload: any) => void) {
  
  // Subscribe to comment changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('comments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('تغییر در کامنت‌ها:', payload);
          onCommentChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onCommentChange]);

  // Subscribe to message changes (for likes, etc.)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('تغییر در پیام‌ها:', payload);
          // Handle message changes if needed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('تغییر در پروفایل‌ها:', payload);
          // Handle profile changes if needed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null; // This hook only sets up subscriptions
}
