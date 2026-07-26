import { Navigation } from '@/components/navigation';
import { Hero } from '@/components/hero';
import { GoldenParticles } from '@/components/golden-particles';
import { HomeSections } from '@/components/home-sections';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getData() {
  const [trending, newReleases, genres, featuredAuthors] = await Promise.all([
    supabase
      .from('stories')
      .select('*, profiles!stories_author_id_fkey(*)')
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .limit(8),
    supabase
      .from('stories')
      .select('*, profiles!stories_author_id_fkey(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('genres').select('*').order('name'),
    supabase
      .from('profiles')
      .select('*')
      .order('followers_count', { ascending: false })
      .limit(4),
  ]);

  return {
    trending: (trending.data || []).filter((s: any) => s.slug !== 'new-story-622'),
    newReleases: (newReleases.data || []).filter((s: any) => s.slug !== 'new-story-622'),
    genres: genres.data || [],
    featuredAuthors: featuredAuthors.data || [],
    continueReading: [] as any[],
  };
}

export default async function HomePage() {
  const data = await getData();

  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={25} />
      <Navigation />
      <Hero />
      <HomeSections
        trending={data.trending}
        newReleases={data.newReleases}
        continueReading={data.continueReading}
        featuredAuthors={data.featuredAuthors}
        genres={data.genres}
      />
      <Footer />
    </main>
  );
}
