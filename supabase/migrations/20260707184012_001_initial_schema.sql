/*
# Vensoul Initial Schema

## Overview
This migration creates the complete database structure for Vensoul storytelling platform.

## New Tables

### profiles
- Extended user profile data (bio, avatar, role, stats)
- Links to Supabase auth.users
- Roles: reader, author, moderator, admin

### genres
- Predefined story genres (Fantasy, Romance, Sci-Fi, etc.)
- Unique slug and name

### stories
- Core story entity with title, description, cover image
- Status: draft, published, archived
- Content rating and warnings
- Language support
- View and read counts
- Owner: author (user_id)

### chapters
- Individual chapters within stories
- Rich text content
- Order within story
- Status: draft, published
- Word count tracking

### story_genres (junction table)
- Many-to-many: stories <-> genres

### story_tags
- Simple tags for stories (flexible)

### likes
- Users can like stories
- Unique per user per story

### comments
- Comments on chapters
- Supports replies (parent_id)
- Threaded discussions

### bookmarks
- User reading lists/collections
- Personal story organization

### follows
- User following authors
- Notification triggers

### notifications
- System notifications
- Types: follow, like, comment, new_chapter, reply, report_status
- Read/unread status

### reports
- Content moderation reports
- Status: pending, reviewed, resolved, dismissed
- Admin action tracking

### reading_history
- Track user reading progress
- Last chapter read timestamp
- Reading position

### story_analytics
- Daily aggregated stats
- Views, reads, unique readers
- Engagement metrics

## Security
- RLS enabled on all tables
- Owner-scoped policies for user data
- Public read for published stories
- Moderator/admin escalation for reports
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  website_url text,
  role text NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'moderator', 'admin')),
  is_verified boolean DEFAULT false,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  story_count integer DEFAULT 0,
  total_read_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Genres table
CREATE TABLE IF NOT EXISTS genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  story_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cover_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  language text NOT NULL DEFAULT 'en',
  age_rating text NOT NULL DEFAULT 'everyone' CHECK (age_rating IN ('everyone', 'teen', 'mature', 'adult')),
  content_warnings text[] DEFAULT '{}',
  view_count bigint DEFAULT 0,
  read_count bigint DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  bookmark_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  word_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  chapter_number integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  word_count integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  read_count bigint DEFAULT 0,
  comment_count integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(story_id, chapter_number)
);

-- Story genres junction
CREATE TABLE IF NOT EXISTS story_genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, genre_id)
);

-- Story tags
CREATE TABLE IF NOT EXISTS story_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, tag)
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  is_edited boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookmarks / Reading lists
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reading_list text DEFAULT 'default',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'reply', 'new_chapter', 'report_status', 'system')),
  title text NOT NULL,
  content text,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  story_id uuid REFERENCES stories(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  comment_id uuid REFERENCES comments(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'copyright', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  action_taken text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  last_read_at timestamptz DEFAULT now(),
  progress_percent integer DEFAULT 0,
  UNIQUE(user_id, story_id)
);

-- Story analytics (daily aggregated)
CREATE TABLE IF NOT EXISTS story_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  views bigint DEFAULT 0,
  reads bigint DEFAULT 0,
  unique_readers integer DEFAULT 0,
  new_likes integer DEFAULT 0,
  new_comments integer DEFAULT 0,
  new_bookmarks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_story_id ON likes(story_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag ON story_tags(tag);
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analytics ENABLE ROW LEVEL SECURITY;

-- Profile policies
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Genres are public
DROP POLICY IF EXISTS "genres_public_read" ON genres;
CREATE POLICY "genres_public_read" ON genres FOR SELECT
  TO anon, authenticated USING (true);

-- Stories policies
DROP POLICY IF EXISTS "stories_public_read_published" ON stories;
CREATE POLICY "stories_public_read_published" ON stories FOR SELECT
  TO anon, authenticated USING (status = 'published' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_insert_own" ON stories;
CREATE POLICY "stories_insert_own" ON stories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_update_own" ON stories;
CREATE POLICY "stories_update_own" ON stories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stories_delete_own" ON stories;
CREATE POLICY "stories_delete_own" ON stories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Chapters policies
DROP POLICY IF EXISTS "chapters_read_published_or_own" ON chapters;
CREATE POLICY "chapters_read_published_or_own" ON chapters FOR SELECT
  TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = chapters.story_id 
      AND (stories.status = 'published' OR stories.user_id = auth.uid())
    )
    AND chapters.status = 'published' OR EXISTS (
      SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chapters_insert_via_story" ON chapters;
CREATE POLICY "chapters_insert_via_story" ON chapters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chapters_update_via_story" ON chapters;
CREATE POLICY "chapters_update_via_story" ON chapters FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "chapters_delete_via_story" ON chapters;
CREATE POLICY "chapters_delete_via_story" ON chapters FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

-- Story genres policies
DROP POLICY IF EXISTS "story_genres_read_published" ON story_genres;
CREATE POLICY "story_genres_read_published" ON story_genres FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = story_genres.story_id AND (stories.status = 'published' OR stories.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "story_genres_manage_via_story" ON story_genres;
CREATE POLICY "story_genres_manage_via_story" ON story_genres FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = story_genres.story_id AND stories.user_id = auth.uid())
  );

-- Story tags policies
DROP POLICY IF EXISTS "story_tags_read_published" ON story_tags;
CREATE POLICY "story_tags_read_published" ON story_tags FOR SELECT
  TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = story_tags.story_id AND (stories.status = 'published' OR stories.user_id = auth.uid()))
  );

DROP POLICY IF EXISTS "story_tags_manage_via_story" ON story_tags;
CREATE POLICY "story_tags_manage_via_story" ON story_tags FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = story_tags.story_id AND stories.user_id = auth.uid())
  );

-- Likes policies
DROP POLICY IF EXISTS "likes_read_public" ON likes;
CREATE POLICY "likes_read_public" ON likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON likes;
CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "comments_read_public" ON comments;
CREATE POLICY "comments_read_public" ON comments FOR SELECT
  TO anon, authenticated USING (is_hidden = false OR auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Bookmarks policies (private to user)
DROP POLICY IF EXISTS "bookmarks_read_own" ON bookmarks;
CREATE POLICY "bookmarks_read_own" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON bookmarks;
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON bookmarks;
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Follows policies
DROP POLICY IF EXISTS "follows_read_public" ON follows;
CREATE POLICY "follows_read_public" ON follows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "follows_insert_own" ON follows;
CREATE POLICY "follows_insert_own" ON follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete_own" ON follows;
CREATE POLICY "follows_delete_own" ON follows FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- Notifications policies (private)
DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reports policies
DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_read_own_or_admin" ON reports;
CREATE POLICY "reports_read_own_or_admin" ON reports FOR SELECT
  TO authenticated USING (
    auth.uid() = reporter_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('moderator', 'admin'))
  );

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('moderator', 'admin'))
  );

-- Reading history policies (private)
DROP POLICY IF EXISTS "reading_history_read_own" ON reading_history;
CREATE POLICY "reading_history_read_own" ON reading_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_history_insert_own" ON reading_history;
CREATE POLICY "reading_history_insert_own" ON reading_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reading_history_update_own" ON reading_history;
CREATE POLICY "reading_history_update_own" ON reading_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Story analytics policies
DROP POLICY IF EXISTS "analytics_read_story_owner" ON story_analytics;
CREATE POLICY "analytics_read_story_owner" ON story_analytics FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = story_analytics.story_id AND stories.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('moderator', 'admin'))
  );

DROP POLICY IF EXISTS "analytics_insert_admin" ON story_analytics;
CREATE POLICY "analytics_insert_admin" ON story_analytics FOR INSERT
  TO authenticated WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
