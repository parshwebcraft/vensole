'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
    // Reset form fields
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <main className="min-h-screen bg-ivory">
      <Navigation />
      
      <div className="pt-32 pb-20 px-6 paper-texture">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="section-label">Get In Touch</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight">Contact Us</h1>
            <p className="text-xs text-midnight/40 font-serif italic max-w-md mx-auto">
              Have questions, feedback, or business inquiries? Write to us and the VENSOUL team will respond shortly.
            </p>
          </div>

          <div className="absolute left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            
            {/* Left Column: Contact details */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 border border-gold/15 space-y-6">
                <h3 className="font-serif text-2xl text-midnight border-b border-gold/10 pb-2">Support Channels</h3>
                
                <div className="space-y-4 font-sans text-sm text-midnight/80">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-midnight">Email Support</p>
                      <a href="mailto:support@vensoul.com" className="text-gold-dark hover:underline font-mono text-xs">
                        support@vensoul.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-midnight">Response Time</p>
                      <p className="text-xs text-midnight/60">Within 24 to 48 hours (Monday - Friday)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-midnight">Address</p>
                      <p className="text-xs text-midnight/60">Delhi NCR, India</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-gold/15 bg-gold/5">
                <p className="text-xs font-serif italic text-midnight/60 leading-relaxed">
                  "Writing is an act of courage; connecting is an act of soul. Thank you for sharing your thoughts, ideas, and reading journeys with us."
                </p>
                <p className="text-[10px] uppercase font-sans tracking-wider text-gold-dark mt-2 font-bold">— Rhythm</p>
              </div>
            </div>

            {/* Right Column: Contact form */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="glass rounded-2xl p-8 border border-green-500/20 bg-green-500/5 text-center space-y-4 animate-scale-in">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="font-serif text-2xl text-midnight">Message Sent Successfully!</h3>
                  <p className="text-sm text-midnight/70 max-w-sm mx-auto font-sans leading-relaxed">
                    Thank you for reaching out. We have received your message and our support team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="btn-gold px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-gold/15 space-y-4 shadow-soft text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Feedback on Chapter 1"
                      className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Your Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message here..."
                      rows={5}
                      className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans resize-none" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-gold py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider mt-4 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
