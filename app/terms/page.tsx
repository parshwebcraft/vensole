import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | VENSOUL',
  description: 'Review the Terms of Service and guidelines for reading and writing on VENSOUL.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 paper-texture">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="section-label">Legal Agreement</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight flex items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-gold" />
              Terms & Conditions
            </h1>
            <p className="text-xs text-midnight/40 font-mono">Last Updated: July 2026</p>
          </div>

          <div className="absolute right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-midnight/80 font-sans leading-relaxed text-sm shadow-soft border border-gold/15">
            
            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">1. Agreement to Terms</h2>
              <p>
                By accessing or using the website (<strong>vensoul.in</strong>), you agree to be bound by these Terms and Conditions. If you do not agree with all of these terms, you are expressly prohibited from using the site and must discontinue use immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">2. Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
              </p>
              <p className="italic">
                The featured stories, novels, and literature collections (including the romance novel "I Moved On. My Heart Didn't.") are the copyright-protected intellectual property of their respective authors (Rhythm). You may not copy, reproduce, republish, distribute, sell, or modify any story content without prior written permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">3. User Representation & Registration</h2>
              <p>
                By using the Site, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
                <li>You are not a minor in the jurisdiction in which you reside.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">4. User Comments & Conduct</h2>
              <p>
                We may provide areas on the Site for you to leave comments, feedback, or book reviews. 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You agree not to post comments that are defamatory, abusive, offensive, vulgar, harassing, or violate any copyright/trademarks.</li>
                <li>We reserve the right to remove, edit, or censor any comments that violate these guidelines or disrupt the platform's literary environment.</li>
                <li>By posting comments, you grant us a royalty-free, perpetual, irrevocable license to use, display, and distribute those comments on the platform.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">5. Third-Party Links & Ad Advertisements</h2>
              <p>
                The Site may contain links to other websites ("Third-Party Websites") as well as articles, photographs, text, designs, or ads (e.g. Google AdSense ads). Such Third-Party Websites and Ads are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">6. Limitation of Liability</h2>
              <p>
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">7. Governing Law</h2>
              <p>
                These Terms and Conditions and your use of the Site are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
              </p>
            </section>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
