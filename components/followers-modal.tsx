import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'

export async function FollowersModal({ userId }: { userId: string }) {
  const [{ data: followers }, { data: following }] = await Promise.all([
    supabase.from('follows').select('follower:profiles!follower_id(*)').eq('following_id', userId),
    supabase.from('follows').select('following:profiles!following_id(*)').eq('follower_id', userId),
  ])

  return null
}
