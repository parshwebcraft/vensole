import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Disclaimer | VENSOUL',
  description: 'Read the official disclaimer regarding literary works and third-party ads on VENSOUL.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 paper-texture">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="section-label">Legal Policy</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight flex items-center justify-center gap-3">
              <AlertTriangle className="w-10 h-10 text-gold" />
              Disclaimer
            </h1>
            <p className="text-xs text-midnight/40 font-mono">Last Updated: July 2026</p>
          </div>

          <div className="absolute left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-midnight/80 font-sans leading-relaxed text-sm shadow-soft border border-gold/15">
            
            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">1. Website Disclaimer</h2>
              <p>
                The information provided by VENSOUL ("we," "our," or "us") on <strong>vensoul.in</strong> (the "Site") is for general informational and entertainment purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">2. Creative Writing & Fiction Disclaimer</h2>
              <p>
                The stories, novels, chapters, and creative writing pieces featured on this website, including but not limited to the novel <em>"I Moved On. My Heart Didn't."</em>, are works of fiction. 
              </p>
              <p className="italic">
                Names, characters, businesses, places, events, locales, and incidents are either the products of the author's imagination or used in a fictitious manner. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">3. External Links Disclaimer</h2>
              <p>
                The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
              </p>
              <p>
                We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site or any website or feature linked in any banner or other advertising. We will not be a party to or in any way be responsible for monitoring any transaction between you and third-party providers of products or services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">4. Advertising and Affiliates Disclaimer</h2>
              <p>
                This website may contain advertisements, sponsored content, paid insertions, affiliate links, or other forms of monetization. 
              </p>
              <p>
                Specifically, we may display Google AdSense ads, which are served automatically by Google based on user interests, cookies, and browsing behaviors. We have no direct control over the specific ad items displayed. The presence of an ad does not constitute an endorsement, recommendation, or guarantee of the advertised product or service by VENSOUL.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">5. "Use at Your Own Risk" Disclaimer</h2>
              <p>
                Your use of the Site and your reliance on any information on the Site is solely at your own risk. Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site.
              </p>
            </section>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
