import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database operations
export const db = {
  // Messages table operations
  messages: {
    // Create new message
    create: async (messageData) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
      return { data, error }
    },

    // Get user's messages
    getUserMessages: async (userId) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // Get public messages (for feed)
    getPublicMessages: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(*)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // Update message
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    // Delete message
    delete: async (id) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Profiles table operations
  profiles: {
    // Get user profile
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    },

    // Update user profile
    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
      return { data, error }
    },

    // Create user profile
    create: async (profileData) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
      return { data, error }
    }
  }
}

// Storage operations
export const storage = {
  // Upload audio file
  uploadAudio: async (file, fileName) => {
    const { data, error } = await supabase.storage
      .from('audio-messages')
      .upload(fileName, file)
    return { data, error }
  },

  // Get audio file URL
  getAudioUrl: async (fileName) => {
    const { data } = supabase.storage
      .from('audio-messages')
      .getPublicUrl(fileName)
    return data.publicUrl
  },

  // Delete audio file
  deleteAudio: async (fileName) => {
    const { error } = await supabase.storage
      .from('audio-messages')
      .remove([fileName])
    return { error }
  }
}
