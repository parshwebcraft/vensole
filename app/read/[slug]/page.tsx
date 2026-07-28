'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { ReaderClient } from '@/components/reader-client';
import { supabase } from '@/lib/supabase';

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login, passing the current page path as a redirect parameter
        router.push(`/login?redirect=/read/${slug}`);
        return;
      }

      setAuthorized(true);

      // 2. Fetch the story details
      const { data } = await supabase
        .from('stories')
        .select('*, profiles!stories_author_id_fkey(*), chapters(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (data) {
        setStory(data);
        // Increment the views_count of the story in the database
        await supabase
          .from('stories')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', data.id);
      }
      setLoading(false);
    })();
  }, [slug, router]);

  if (loading || !authorized) {
    return (
      <main className="relative min-h-screen bg-ivory paper-texture flex flex-col justify-between">
        <Navigation />
        <div className="text-center py-32 flex-1">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-serif italic text-midnight/50">Verifying access to the library...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!story) {
    return (
      <main className="relative min-h-screen bg-ivory paper-texture flex flex-col justify-between">
        <Navigation />
        <div className="pt-32 pb-20 text-center flex-1">
          <h1 className="font-serif text-5xl text-midnight/40 italic">Story not found</h1>
          <p className="text-midnight/30 mt-4">This story may have been moved or never existed.</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (slug === 'i-moved-on-my-heart-didnt') {
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
