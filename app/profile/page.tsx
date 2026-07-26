import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { ProfileClient } from '@/components/profile-client';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={12} />
      <Navigation />
      <ProfileClient />
      <Footer />
    </main>
  );
}
