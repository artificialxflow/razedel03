-- Database Schema for Razedel Project
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'audio', 'image')) DEFAULT 'text',
    audio_url TEXT,
    image_url TEXT,
    emotion_category TEXT CHECK (emotion_category IN ('happy', 'sad', 'angry', 'anxious', 'excited', 'calm', 'love', 'gratitude', 'other')),
    is_public BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    listener_type TEXT CHECK (listener_type IN ('ai', 'human', 'both')) DEFAULT 'ai',
    ai_response TEXT,
    human_response TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    like_type TEXT CHECK (like_type IN ('like', 'dislike')) DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create meditation_content table
CREATE TABLE meditation_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT CHECK (content_type IN ('quote', 'music', 'meditation', 'breathing')) NOT NULL,
    content TEXT,
    audio_url TEXT,
    duration_seconds INTEGER,
    category TEXT CHECK (category IN ('stress', 'anxiety', 'sleep', 'focus', 'happiness', 'gratitude')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_meditation_sessions table
CREATE TABLE user_meditation_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    meditation_id UUID REFERENCES meditation_content(id) ON DELETE CASCADE NOT NULL,
    session_duration_seconds INTEGER,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'premium')) DEFAULT 'free',
    payment_provider TEXT CHECK (payment_provider IN ('zarinpal', 'idpay', 'google', 'apple')),
    payment_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'IRR',
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dark_mode BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    language TEXT DEFAULT 'fa',
    timezone TEXT DEFAULT 'Asia/Tehran',
    privacy_level TEXT CHECK (privacy_level IN ('public', 'friends', 'private')) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'read', 'replied', 'closed')) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('message', 'comment', 'like', 'system', 'subscription')) NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_public ON messages(is_public);
CREATE INDEX idx_comments_message_id ON comments(message_id);
CREATE INDEX idx_likes_message_id ON likes(message_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles" ON profiles
    FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Messages policies
CREATE POLICY "Users can view public messages" ON messages
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments on public messages" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = comments.message_id 
            AND (messages.is_public = true OR messages.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view likes on public messages" ON likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages 
            WHERE messages.id = likes.message_id 
            AND (messages.is_public = true OR messages.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert likes" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own likes" ON likes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- Meditation content policies (public read, admin write)
CREATE POLICY "Anyone can view active meditation content" ON meditation_content
    FOR SELECT USING (is_active = true);

-- User meditation sessions policies
CREATE POLICY "Users can view own sessions" ON user_meditation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_meditation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_meditation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Contact messages policies (admin only)
CREATE POLICY "Only admins can view contact messages" ON contact_messages
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'admin@razedel.com'
    ));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample meditation content
INSERT INTO meditation_content (title, description, content_type, content, category, duration_seconds) VALUES
('آرامش درونی', 'نفس عمیق بکشید و آرامش را در خود پیدا کنید', 'breathing', 'نفس عمیق بکشید و به آرامی بازدم کنید. این کار را ۱۰ بار تکرار کنید.', 'stress', 300),
('شکرگزاری', 'برای نعمت‌های زندگی شکرگزار باشید', 'quote', 'هر روز را با شکرگزاری شروع کنید و زیبایی‌های زندگی را ببینید.', 'gratitude', 180),
('مدیتیشن صبحگاهی', 'با انرژی مثبت روز را شروع کنید', 'meditation', 'در سکوت بنشینید و به صدای طبیعت گوش دهید.', 'happiness', 600),
('تمرکز ذهن', 'ذهن خود را متمرکز کنید', 'meditation', 'به یک نقطه خیره شوید و افکار خود را آرام کنید.', 'focus', 480);

-- Create storage buckets
-- Note: You need to create these buckets manually in Supabase Dashboard
-- 1. audio-messages (for voice messages)
-- 2. user-avatars (for profile pictures)
-- 3. meditation-audio (for meditation audio files)
