import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { ReaderClient } from '@/components/reader-client';
import { supabase } from '@/lib/supabase';

async function getStory(slug: string) {
  const { data } = await supabase
    .from('stories')
    .select('*, profiles!stories_author_id_fkey(*), chapters(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  return data;
}

export default async function ReadPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);

  if (!story) {
    return (
      <main className="relative min-h-screen bg-ivory paper-texture">
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-serif text-5xl text-midnight/40 italic">Story not found</h1>
          <p className="text-midnight/30 mt-4">This story may have been moved or never existed.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={8} />
      <ReaderClient story={story} />
    </main>
  );
}
