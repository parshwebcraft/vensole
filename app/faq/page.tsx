'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is VENSOUL?",
      a: "VENSOUL is an emotional storytelling ecosystem designed to bring readers and writers closer in a beautiful, premium literary universe. It features collections of heart-stirring novels and visual storytelling experiences."
    },
    {
      q: "Who is Rhythm?",
      a: "Rhythm is the principal author, creator, and emotional architect behind VENSOUL's featured stories. Rhythm's signature debut work is the romance novel 'I Moved On. My Heart Didn't.'"
    },
    {
      q: "How can I read the romance novel 'I Moved On. My Heart Didn't.'?",
      a: "You can read the entire romance novel directly in your browser! Navigate to the 'Discover' or 'Library' page, select the story, and hit 'Read'. It features a beautiful, non-cropped book cover layout and reader controls optimized for mobile and desktop screens."
    },
    {
      q: "Is it free to read books on VENSOUL?",
      a: "Yes! Currently, reading the core chapters of our featured books is open to all readers. Premium features, writing studio access, and exclusive chapters are in development and will be released in the future."
    },
    {
      q: "How can I get notified about new chapters or book releases?",
      a: "You can subscribe to our newsletter in the footer of any page! Simply enter your email address and click the subscribe button. We will notify you directly whenever a new story or chapter is published."
    },
    {
      q: "Who should I contact if I have questions or feedback?",
      a: "We would love to hear from you! You can go to our 'Contact Us' page and send a message directly to our admin team, or write to us at support@vensoul.com. We typically respond within 24 to 48 hours."
    }
  ];

  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 paper-texture">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="section-label">Help Center</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight flex items-center justify-center gap-3">
              <HelpCircle className="w-10 h-10 text-gold" />
              Frequently Asked Questions
            </h1>
            <p className="text-xs text-midnight/40 font-serif italic">Find answers to common questions about VENSOUL, books, and authors.</p>
          </div>

          <div className="absolute right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

          {/* Content (Accordion) */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="glass rounded-xl border border-gold/15 overflow-hidden transition-all duration-300 shadow-soft"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gold/5 transition-colors"
                  >
                    <span className="font-serif text-lg text-midnight font-medium">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gold shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gold shrink-0" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-midnight/70 leading-relaxed font-sans border-t border-gold/5 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
