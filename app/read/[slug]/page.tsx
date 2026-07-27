import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { ReaderClient } from '@/components/reader-client';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getStory(slug: string) {
  const { data } = await supabase
    .from('stories')
    .select('*, profiles!stories_author_id_fkey(*), chapters(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (data) {
    // Increment the views_count of the story in the database
    await supabase
      .from('stories')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id);
  }

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

  if (params.slug === 'i-moved-on-my-heart-didnt') {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-[#faf7f2]">
        {/* Floating Back/Library Button */}
        <a
          href="/discover"
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2c2118]/80 text-[#faf7f2] backdrop-blur-md shadow-lg border border-[#e8c4b0]/20 hover:bg-[#2c2118] transition-all text-sm font-sans"
        >
          ← Back to Library
        </a>
        <iframe
          src="/books/heart.html"
          className="w-full h-full border-none"
          title={story.title}
        />
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
