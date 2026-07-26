import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  role: 'reader' | 'writer' | 'premium' | 'moderator' | 'admin';
  is_premium: boolean;
  followers_count: number;
  following_count: number;
  stories_count: number;
  website_url: string | null;
  location: string | null;
  created_at: string;
};

export type Story = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  language: string;
  status: 'draft' | 'published' | 'completed' | 'hiatus' | 'removed';
  content_rating: 'general' | 'teen' | 'mature' | 'explicit';
  word_count: number;
  chapter_count: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Chapter = {
  id: string;
  story_id: string;
  author_id: string;
  title: string;
  content: string | null;
  chapter_number: number;
  word_count: number;
  status: 'draft' | 'published' | 'scheduled';
  is_premium: boolean;
  views_count: number;
  published_at: string | null;
  created_at: string;
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
};

export type Comment = {
  id: string;
  user_id: string;
  story_id: string | null;
  chapter_id: string | null;
  parent_id: string | null;
  content: string;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  profiles?: Profile;
};
