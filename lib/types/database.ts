export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          role: 'reader' | 'author' | 'moderator' | 'admin'
          is_verified: boolean
          follower_count: number
          following_count: number
          story_count: number
          total_read_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          role?: 'reader' | 'author' | 'moderator' | 'admin'
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          story_count?: number
          total_read_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          role?: 'reader' | 'author' | 'moderator' | 'admin'
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          story_count?: number
          total_read_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          story_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          story_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          story_count?: number
          created_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_url: string | null
          status: 'draft' | 'published' | 'archived' | 'deleted'
          language: string
          age_rating: 'everyone' | 'teen' | 'mature' | 'adult'
          content_warnings: string[]
          view_count: number
          read_count: number
          like_count: number
          comment_count: number
          bookmark_count: number
          chapter_count: number
          word_count: number
          is_featured: boolean
          is_completed: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          cover_url?: string | null
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          language?: string
          age_rating?: 'everyone' | 'teen' | 'mature' | 'adult'
          content_warnings?: string[]
          view_count?: number
          read_count?: number
          like_count?: number
          comment_count?: number
          bookmark_count?: number
          chapter_count?: number
          word_count?: number
          is_featured?: boolean
          is_completed?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_url?: string | null
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          language?: string
          age_rating?: 'everyone' | 'teen' | 'mature' | 'adult'
          content_warnings?: string[]
          view_count?: number
          read_count?: number
          like_count?: number
          comment_count?: number
          bookmark_count?: number
          chapter_count?: number
          word_count?: number
          is_featured?: boolean
          is_completed?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          story_id: string
          title: string
          content: string
          chapter_number: number
          status: 'draft' | 'published'
          word_count: number
          view_count: number
          read_count: number
          comment_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          title: string
          content: string
          chapter_number: number
          status?: 'draft' | 'published'
          word_count?: number
          view_count?: number
          read_count?: number
          comment_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          title?: string
          content?: string
          chapter_number?: number
          status?: 'draft' | 'published'
          word_count?: number
          view_count?: number
          read_count?: number
          comment_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      story_genres: {
        Row: {
          id: string
          story_id: string
          genre_id: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          genre_id: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          genre_id?: string
          created_at?: string
        }
      }
      story_tags: {
        Row: {
          id: string
          story_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          tag?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          story_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          story_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          parent_id: string | null
          content: string
          like_count: number
          is_edited: boolean
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          chapter_id: string
          parent_id?: string | null
          content: string
          like_count?: number
          is_edited?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          parent_id?: string | null
          content?: string
          like_count?: number
          is_edited?: boolean
          is_hidden?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          story_id: string
          reading_list: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          story_id: string
          reading_list?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          reading_list?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id?: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'reply' | 'new_chapter' | 'report_status' | 'system'
          title: string
          content: string | null
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'reply' | 'new_chapter' | 'report_status' | 'system'
          title: string
          content?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'follow' | 'like' | 'comment' | 'reply' | 'new_chapter' | 'report_status' | 'system'
          title?: string
          content?: string | null
          data?: Json
          is_read?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          story_id: string | null
          chapter_id: string | null
          comment_id: string | null
          reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
          description: string | null
          status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          reviewed_by: string | null
          reviewed_at: string | null
          action_taken: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          story_id?: string | null
          chapter_id?: string | null
          comment_id?: string | null
          reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
          action_taken?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          story_id?: string | null
          chapter_id?: string | null
          comment_id?: string | null
          reason?: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
          action_taken?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reading_history: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string | null
          last_read_at: string
          progress_percent: number
        }
        Insert: {
          id?: string
          user_id?: string
          story_id: string
          chapter_id?: string | null
          last_read_at?: string
          progress_percent?: number
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string | null
          last_read_at?: string
          progress_percent?: number
        }
      }
      story_analytics: {
        Row: {
          id: string
          story_id: string
          date: string
          views: number
          reads: number
          unique_readers: number
          new_likes: number
          new_comments: number
          new_bookmarks: number
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          date?: string
          views?: number
          reads?: number
          unique_readers?: number
          new_likes?: number
          new_comments?: number
          new_bookmarks?: number
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          date?: string
          views?: number
          reads?: number
          unique_readers?: number
          new_likes?: number
          new_comments?: number
          new_bookmarks?: number
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Genre = Database['public']['Tables']['genres']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type Chapter = Database['public']['Tables']['chapters']['Row']
export type StoryGenre = Database['public']['Tables']['story_genres']['Row']
export type StoryTag = Database['public']['Tables']['story_tags']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type ReadingHistory = Database['public']['Tables']['reading_history']['Row']
export type StoryAnalytics = Database['public']['Tables']['story_analytics']['Row']

export type UserRole = 'reader' | 'author' | 'moderator' | 'admin'
export type StoryStatus = 'draft' | 'published' | 'archived' | 'deleted'
export type ChapterStatus = 'draft' | 'published'
export type AgeRating = 'everyone' | 'teen' | 'mature' | 'adult'
export type NotificationType = 'follow' | 'like' | 'comment' | 'reply' | 'new_chapter' | 'report_status' | 'system'
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed'

export interface StoryWithRelations extends Story {
  author: Profile
  genres: Genre[]
  tags: string[]
  chapters?: Chapter[]
  isLiked?: boolean
  isBookmarked?: boolean
  isFollowing?: boolean
}

export interface ChapterWithRelations extends Chapter {
  story: Story
  comments?: Comment[]
}

export interface ProfileWithStats extends Profile {
  followers: number
  following: number
  stories?: Story[]
  isFollowing?: boolean
}
