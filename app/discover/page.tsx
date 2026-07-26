import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { DiscoverClient } from '@/components/discover-client';
import { supabase } from '@/lib/supabase';

async function getDiscoverData() {
  const [stories, genres] = await Promise.all([
    supabase
      .from('stories')
      .select('*, profiles!stories_author_id_fkey(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase.from('genres').select('*').order('name'),
  ]);

  return {
    stories: stories.data || [],
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
