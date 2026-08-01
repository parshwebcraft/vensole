import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { DiscoverClient } from '@/components/discover-client';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getDiscoverData() {
  const [stories, genres] = await Promise.all([
    supabase
      .from('stories')
      .select('*, profiles!stories_author_id_fkey(id, username, display_name, avatar_url, bio, role)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('genres')
      .select('*, story_genres!inner(stories!inner(status))')
      .eq('story_genres.stories.status', 'published')
      .order('name'),
  ]);

  return {
    stories: (stories.data || []).filter((s: any) => s.slug !== 'new-story-622'),
    genres: genres.data || [],
  };
}

export default async function DiscoverPage() {
  const data = await getDiscoverData();

  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={15} />
      <Navigation />
      <DiscoverClient stories={data.stories} genres={data.genres} />
      <Footer />
    </main>
  );
}
