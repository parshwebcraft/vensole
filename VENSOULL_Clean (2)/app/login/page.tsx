import { Navigation } from '@/components/navigation';
import { GoldenParticles } from '@/components/golden-particles';
import { Footer } from '@/components/footer';
import { AuthClient } from '@/components/auth-client';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-ivory paper-texture">
      <GoldenParticles count={20} />
      <Navigation />
      <AuthClient mode="login" />
      <Footer />
    </main>
  );
}
