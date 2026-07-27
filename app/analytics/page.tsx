import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';

export const metadata = {
  title: 'Live Analytics | VENSOUL',
  description: 'Real-time traffic, geo-location, and reader visit logs for the VENSOUL platform.',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      <AnalyticsDashboard />
      <Footer />
    </main>
  );
}
