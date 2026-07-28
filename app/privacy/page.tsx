import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | VENSOUL',
  description: 'Learn how VENSOUL handles data protection, cookies, and reader privacy.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 paper-texture">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="section-label">Legal Agreement</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight flex items-center justify-center gap-3">
              <Shield className="w-10 h-10 text-gold" />
              Privacy Policy
            </h1>
            <p className="text-xs text-midnight/40 font-mono">Last Updated: July 2026</p>
          </div>

          <div className="absolute left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-midnight/80 font-sans leading-relaxed text-sm shadow-soft border border-gold/15">
            
            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">1. Introduction</h2>
              <p>
                Welcome to VENSOUL ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data of our readers, writers, and visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (<strong>vensoul.in</strong>) and read our storytelling collections.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">2. Information We Collect</h2>
              <p>
                We may collect information about you in a variety of ways. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Personal Identification Information:</strong> Name, username, and email address when you register an account, subscribe to our newsletter, or contact us.
                </li>
                <li>
                  <strong>Device and Usage Data:</strong> IP address, browser type, operating system, page views, click counts (e.g. story views), referring URLs, and geographical details (Country, City) collected automatically when accessing our services.
                </li>
                <li>
                  <strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance user experience, track platform statistics, and personalize content.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">3. Google AdSense & Third-Party Advertising</h2>
              <p>
                We may partner with third-party advertising vendors, including Google, to serve ads when you visit our website. 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Google uses cookies to serve ads on our site based on your prior visits to our website or other websites on the Internet.
                </li>
                <li>
                  Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline font-semibold">Google Ads Settings</a>.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">4. How We Use Your Information</h2>
              <p>
                Having accurate information about you allows us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, operate, and maintain our story reading platform.</li>
                <li>Analyze website traffic logs, clicks, and geo-demographics to improve user experience (e.g., measuring performance of our feature books).</li>
                <li>Deliver newsletters, updates, and marketing communications (with your consent).</li>
                <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">5. Data Sharing and Protection</h2>
              <p>
                We do not sell, trade, or rent your personal identification information to others. We implement a variety of security measures to maintain the safety of your personal information when you log in, enter, or submit details. All traffic is secured using Secure Socket Layer (SSL) encryption.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">6. Your Rights (GDPR / CCPA)</h2>
              <p>
                Depending on your location, you may have rights regarding the access, correction, deletion, or restriction of use of your personal data. You have the right to opt out of marketing communications at any time by clicking the unsubscribe link in our emails.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">7. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <p className="font-mono text-xs text-gold-dark bg-gold/5 p-3.5 rounded-xl border border-gold/15 inline-block">
                Email: support@vensoul.com
              </p>
            </section>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
