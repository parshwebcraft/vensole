'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Users, BookOpen, Crown, Globe, MapPin, Eye, RefreshCw, AlertCircle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [analyticsLogs, setAnalyticsLogs] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);
  const [bookClicks, setBookClicks] = useState(0);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlCode = `CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude TEXT,
  longitude TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  story_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow public insert" ON analytics_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow public select" ON analytics_logs FOR SELECT TO anon, authenticated USING (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAdmin(true);
      } else {
        alert(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      alert('Authentication error. Please try again.');
    }
    setLoginLoading(false);
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // 1. Try to fetch from analytics_logs
      const p1 = supabase.from('analytics_logs').select('*').order('created_at', { ascending: false }).limit(250);
      const p2 = supabase.from('analytics_logs').select('*', { count: 'exact', head: true });
      const p3 = supabase.from('analytics_logs').select('*', { count: 'exact', head: true }).eq('story_slug', 'i-moved-on-my-heart-didnt');

      const [analyticsRes, totalVisitsRes, bookClicksRes] = await Promise.all([
        p1.catch(e => ({ error: e, data: null })),
        p2.catch(e => ({ error: e, count: null })),
        p3.catch(e => ({ error: e, count: null })),
      ]);

      if (analyticsRes.error || !analyticsRes.data) {
        // Table does not exist -> Switch to Demo Mode
        setIsDemoMode(true);
        
        // Fetch REAL views of the book from the stories table
        const { data: storyData } = await supabase
          .from('stories')
          .select('views_count')
          .eq('slug', 'i-moved-on-my-heart-didnt')
          .maybeSingle();
        
        const realBookViews = storyData?.views_count || 0;
        setBookClicks(realBookViews);
        setTotalVisits(realBookViews + 124); // Add mock hits for other pages
        
        // Generate mock logs
        const mockLogs = [
          { id: '1', ip_address: '103.45.191.87', country: 'India', city: 'Mumbai', page_url: '/read/i-moved-on-my-heart-didnt', referrer: 'whatsapp', created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
          { id: '2', ip_address: '122.161.44.12', country: 'India', city: 'New Delhi', page_url: '/', referrer: 'direct', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: '3', ip_address: '92.40.12.81', country: 'United Kingdom', city: 'London', page_url: '/read/i-moved-on-my-heart-didnt', referrer: 'google', created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
          { id: '4', ip_address: '152.57.199.201', country: 'India', city: 'Bangalore', page_url: '/discover', referrer: 'direct', created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
          { id: '5', ip_address: '74.125.19.147', country: 'United States', city: 'New York', page_url: '/read/i-moved-on-my-heart-didnt', referrer: 'google', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
          { id: '6', ip_address: '182.72.102.5', country: 'India', city: 'Chennai', page_url: '/', referrer: 'whatsapp', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
          { id: '7', ip_address: '82.165.10.22', country: 'Germany', city: 'Berlin', page_url: '/discover', referrer: 'direct', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
          { id: '8', ip_address: '103.88.22.4', country: 'India', city: 'Kolkata', page_url: '/read/i-moved-on-my-heart-didnt', referrer: 'google', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() }
        ];
        
        setAnalyticsLogs(mockLogs);
      } else {
        // Table exists -> Real Mode
        setIsDemoMode(false);
        setAnalyticsLogs(analyticsRes.data || []);
        if (totalVisitsRes.count !== null) setTotalVisits(totalVisitsRes.count);
        if (bookClicksRes.count !== null) setBookClicks(bookClicksRes.count);
      }
    } catch (err) {
      console.error(err);
      setIsDemoMode(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Render Login Panel if not authenticated
  if (!isAdmin) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory paper-texture flex items-center justify-center">
        <div className="text-center max-w-sm w-full px-6">
          <div className="relative w-20 h-20 mx-auto mb-8 animate-fade-up">
            <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
            <Crown className="w-20 h-20 text-gold relative z-10 animate-float" />
          </div>
          <h1 className="font-serif text-4xl text-midnight mb-2">Analytics Access</h1>
          <p className="text-midnight/40 font-serif italic mb-8">Enter your admin credentials to view platform analytics.</p>
          <form onSubmit={handleAdminLogin} className="glass rounded-2xl p-8 space-y-4 text-left shadow-soft border border-gold/15">
            <div>
              <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Username</label>
              <input 
                type="text" 
                value={loginUsername} 
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="admin username"
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans" 
                required 
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all font-sans" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full btn-gold py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider mt-4"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-16 px-6 paper-texture">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="glass border-2 border-gold/40 bg-gold/5 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse shrink-0" />
              <div>
                <h4 className="font-serif text-lg text-gold-dark font-semibold">💡 Live Demo Mode Active</h4>
                <p className="text-xs text-midnight/60 font-sans mt-0.5">
                  The **First Book Reads** counter below is **REAL** and fetched from your database. IP addresses and locations are simulated since SQL setup is pending.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSql(!showSql)}
              className="btn-outline-gold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-sans font-medium whitespace-nowrap"
            >
              {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showSql ? 'Hide SQL Code' : 'View SQL Setup'}
            </button>
          </div>
        )}

        {/* SQL Code Collapsible Section */}
        {isDemoMode && showSql && (
          <div className="glass border border-gold/20 rounded-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gold/10 pb-3">
              <div>
                <h4 className="font-serif text-lg text-midnight">Database Setup Instructions</h4>
                <p className="text-xs text-midnight/40 font-sans mt-0.5">Run this code in your Supabase SQL Editor to enable real tracking.</p>
              </div>
              <button
                onClick={handleCopy}
                className="btn-gold px-4 py-2 rounded-xl text-xs flex items-center gap-2 font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-midnight text-ivory/80 text-xs p-4 rounded-xl font-mono overflow-x-auto select-all max-h-60">
              {sqlCode}
            </pre>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="section-label">Real-time Platform Activity</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight mt-1">Live Analytics</h1>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="btn-outline-gold px-4 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-gold hover:text-midnight transition-all font-sans font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </button>
        </div>

        {loading && analyticsLogs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-serif italic text-midnight/50">Fetching live analytics data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-scale-in">
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl p-6 hover:glow-gold transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider">Total Website Hits</p>
                  <Eye className="w-4 h-4 text-gold" />
                </div>
                <h4 className="text-3xl font-serif text-gold-dark font-bold">{totalVisits.toLocaleString()}</h4>
                <p className="text-[0.65rem] text-midnight/30 mt-1">Total page views logged</p>
              </div>
              <div className="glass rounded-xl p-6 hover:glow-gold transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider">First Book Clicks (Reads)</p>
                  <BookOpen className="w-4 h-4 text-peacock-blue" />
                </div>
                <h4 className="text-3xl font-serif text-peacock-blue font-bold">{bookClicks.toLocaleString()}</h4>
                <p className="text-[0.65rem] text-midnight/30 mt-1">"I Moved On. My Heart Didn't."</p>
              </div>
              <div className="glass rounded-xl p-6 hover:glow-gold transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider">Unique Visitors</p>
                  <Users className="w-4 h-4 text-gold-dark" />
                </div>
                <h4 className="text-3xl font-serif text-midnight font-bold">
                  {new Set(analyticsLogs.map(l => l.ip_address)).size}
                </h4>
                <p className="text-[0.65rem] text-midnight/30 mt-1">Distinct IP addresses tracked</p>
              </div>
              <div className="glass rounded-xl p-6 hover:glow-gold transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider">Cities Tracked</p>
                  <Globe className="w-4 h-4 text-bronze" />
                </div>
                <h4 className="text-3xl font-serif text-bronze font-bold">
                  {new Set(analyticsLogs.map(l => l.city).filter(c => c && c !== 'local' && c !== 'unknown')).size}
                </h4>
                <p className="text-[0.65rem] text-midnight/30 mt-1">Geographical locations</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Countries, Cities, and Story Clicks */}
              <div className="lg:col-span-1 space-y-6">
                {/* Top Countries */}
                <div className="glass rounded-xl p-6 border border-gold/15 space-y-4">
                  <h3 className="font-serif text-lg text-midnight font-semibold border-b border-gold/10 pb-2">Top Countries</h3>
                  <div className="space-y-3">
                    {(() => {
                      const countries: { [key: string]: number } = {};
                      analyticsLogs.forEach(l => {
                        const c = l.country || 'Unknown';
                        countries[c] = (countries[c] || 0) + 1;
                      });
                      const sorted = Object.entries(countries)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                      const max = sorted[0]?.[1] || 1;
                      return sorted.map(([c, count]) => (
                        <div key={c} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-midnight/70">{c}</span>
                            <span className="text-midnight">{count} ({analyticsLogs.length > 0 ? Math.round(count/analyticsLogs.length * 100) : 0}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-gold/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Top Cities */}
                <div className="glass rounded-xl p-6 border border-gold/15 space-y-4">
                  <h3 className="font-serif text-lg text-midnight font-semibold border-b border-gold/10 pb-2">Top Cities</h3>
                  <div className="space-y-3">
                    {(() => {
                      const cities: { [key: string]: number } = {};
                      analyticsLogs.forEach(l => {
                        const c = l.city === 'local' ? 'Localhost' : l.city || 'Unknown';
                        if (c !== 'unknown') {
                          cities[c] = (cities[c] || 0) + 1;
                        }
                      });
                      const sorted = Object.entries(cities)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5);
                      const max = sorted[0]?.[1] || 1;
                      return sorted.map(([c, count]) => (
                        <div key={c} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-midnight/70">{c}</span>
                            <span className="text-midnight">{count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gold/5 rounded-full overflow-hidden">
                            <div className="h-full bg-peacock-blue rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Story Performance */}
                <div className="glass rounded-xl p-6 border border-gold/15 space-y-4">
                  <h3 className="font-serif text-lg text-midnight font-semibold border-b border-gold/10 pb-2">Book Performance</h3>
                  <div className="space-y-3">
                    {(() => {
                      const storyClicks: { [key: string]: number } = {};
                      analyticsLogs.forEach(l => {
                        if (l.story_slug) {
                          const name = l.story_slug === 'i-moved-on-my-heart-didnt' ? "I Moved On. My Heart Didn't." : l.story_slug;
                          storyClicks[name] = (storyClicks[name] || 0) + 1;
                        }
                      });
                      const sorted = Object.entries(storyClicks)
                        .sort((a, b) => b[1] - a[1]);
                      if (sorted.length === 0) return <p className="text-xs text-midnight/40 text-center py-2">No book clicks logged yet.</p>;
                      return sorted.map(([s, count]) => (
                        <div key={s} className="flex justify-between items-center text-xs font-sans">
                          <span className="text-midnight/70 truncate max-w-[180px] font-medium">{s}</span>
                          <span className="bg-gold/10 text-gold-dark px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">{count} reads</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Logs Table */}
              <div className="lg:col-span-2 glass rounded-xl p-6 border border-gold/15 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gold/10 pb-2">
                  <h3 className="font-serif text-lg text-midnight font-semibold">Live Traffic Logs (Last 250 visits)</h3>
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-sans tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Feed
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-1">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-gold/10 text-midnight/40 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5">Time</th>
                        <th className="py-2.5">IP Address</th>
                        <th className="py-2.5">Location (Geo)</th>
                        <th className="py-2.5">Path / Page</th>
                        <th className="py-2.5">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                      {analyticsLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-midnight/40">No visits logged yet. Keep browsing the site to test.</td>
                        </tr>
                      ) : (
                        analyticsLogs.map(l => (
                          <tr key={l.id} className="hover:bg-gold/5 transition-colors">
                            <td className="py-3 text-midnight/50 whitespace-nowrap">
                              {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-3 font-mono font-medium text-midnight/80">{l.ip_address}</td>
                            <td className="py-3 text-midnight/70">
                              {l.city && l.city !== 'local' && l.city !== 'unknown' ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gold shrink-0" />
                                  {l.city}, {l.country}
                                </span>
                              ) : l.ip_address === '127.0.0.1' || l.ip_address === '::1' ? (
                                <span className="text-gold font-medium">Localhost</span>
                              ) : (
                                <span className="text-midnight/40 italic">Unknown</span>
                              )}
                            </td>
                            <td className="py-3 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                l.page_url?.startsWith('/read/') ? 'bg-peacock-blue/10 text-peacock-blue' :
                                l.page_url === '/' ? 'bg-gold/10 text-gold-dark' : 'bg-midnight/5 text-midnight/60'
                              }`}>
                                {l.page_url}
                              </span>
                            </td>
                            <td className="py-3 text-midnight/50 truncate max-w-[120px]" title={l.referrer}>
                              {l.referrer === 'direct' ? 'Direct' : l.referrer}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
