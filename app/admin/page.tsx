import { AdminClient } from '@/components/admin-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Admin Panel | VENSOUL',
  description: 'Manage users, stories, and genres for the VENSOUL platform.',
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      <AdminClient />
      <Footer />
    </main>
  );
}
