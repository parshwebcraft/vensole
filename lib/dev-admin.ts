import { User } from '@supabase/supabase-js'
import { Profile } from '@/lib/types/database'

export const isDevAdminBypassEnabled =
  process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === 'true' &&
  process.env.NODE_ENV !== 'production'

const now = new Date(0).toISOString()

export const devAdminUser = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'admin@local.dev',
  email_confirmed_at: now,
  phone: '',
  confirmed_at: now,
  last_sign_in_at: now,
  app_metadata: {},
  user_metadata: {
    username: 'local_admin',
    display_name: 'Local Admin',
  },
  identities: [],
  created_at: now,
  updated_at: now,
  is_anonymous: false,
} as User

export const devAdminProfile: Profile = {
  id: '00000000-0000-4000-8000-000000000002',
  user_id: devAdminUser.id,
  username: 'local_admin',
  display_name: 'Local Admin',
  bio: 'Local development admin account',
  avatar_url: null,
  website_url: null,
  role: 'admin',
  is_verified: true,
  follower_count: 0,
  following_count: 0,
  story_count: 0,
  total_read_count: 0,
  created_at: now,
  updated_at: now,
}
