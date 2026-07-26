import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { PremiumClient } from '@/components/premium-client';

export default function PremiumPage() {
  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={20} />
      <Navigation />
      <PremiumClient />
      <Footer />
    </main>
  );
}
