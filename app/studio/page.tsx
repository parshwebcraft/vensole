import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { StudioClient } from '@/components/studio-client';
import { supabase } from '@/lib/supabase';

export default function StudioPage() {
  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={10} />
      <Navigation />
      <StudioClient />
      <Footer />
    </main>
  );
}
