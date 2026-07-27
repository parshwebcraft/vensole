'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users, BookOpen, Tag, Search, Award, Crown, Plus, Trash2, Sliders, Feather,
  ChevronLeft, Eye, Mail, MapPin, Calendar, Heart, MessageCircle, Bookmark,
  MessageSquare, X, Check, Edit2, Activity
} from 'lucide-react';

type Tab = 'stats' | 'users' | 'stories' | 'genres' | 'questions' | 'analytics';

export function AdminClient() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Data
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Analytics states
  const [analyticsLogs, setAnalyticsLogs] = useState<any[]>([]);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [bookClicks, setBookClicks] = useState(0);

  // Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStories: 0, premiumUsers: 0, totalChapters: 0 });

  // Genre form
  const [genreName, setGenreName] = useState('');
  const [genreSlug, setGenreSlug] = useState('');
  const [genreDesc, setGenreDesc] = useState('');
  const [genreColor, setGenreColor] = useState('#C8A46A');

  // Question form
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'text' | 'textarea' | 'choice'>('text');
  const [qOptions, setQOptions] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAdmin(true);
        fetchData();
      } else {
        alert(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      alert('Authentication error. Please try again.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const p1 = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const p2 = supabase.from('stories').select('*, profiles!stories_author_id_fkey(username, display_name)').order('created_at', { ascending: false });
      const p3 = supabase.from('genres').select('*').order('name');
      const p4 = supabase.from('chapters').select('id');
      const p5 = supabase.from('admin_questions').select('*').order('created_at');
      const p6 = supabase.from('analytics_logs').select('*').order('created_at', { ascending: false }).limit(250);
      const p7 = supabase.from('analytics_logs').select('*', { count: 'exact', head: true });
      const p8 = supabase.from('analytics_logs').select('*', { count: 'exact', head: true }).eq('story_slug', 'i-moved-on-my-heart-didnt');

      const [profilesRes, storiesRes, genresRes, chaptersRes, questionsRes, analyticsRes, totalVisitsRes, bookClicksRes] = await Promise.all([
        p1.catch(e => ({ error: e, data: null })),
        p2.catch(e => ({ error: e, data: null })),
        p3.catch(e => ({ error: e, data: null })),
        p4.catch(e => ({ error: e, data: null })),
        p5.catch(e => ({ error: e, data: null })),
        p6.catch(e => ({ error: e, data: null })),
        p7.catch(e => ({ error: e, count: null })),
        p8.catch(e => ({ error: e, count: null })),
      ]);

      if (profilesRes.data) {
        setUsers(profilesRes.data);
        setStats(prev => ({ ...prev, totalUsers: profilesRes.data!.length, premiumUsers: profilesRes.data!.filter(u => u.is_premium || u.role === 'premium').length }));
      }
      if (storiesRes.data) {
        setStories(storiesRes.data);
        setStats(prev => ({ ...prev, totalStories: storiesRes.data!.length }));
      }
      if (genresRes.data) setGenres(genresRes.data);
      if (chaptersRes.data) setStats(prev => ({ ...prev, totalChapters: chaptersRes.data!.length }));
      if (questionsRes.data) setQuestions(questionsRes.data);

      // Handle Analytics
      if (analyticsRes.error || !analyticsRes.data) {
        setAnalyticsEnabled(false);
      } else {
        setAnalyticsEnabled(true);
        setAnalyticsLogs(analyticsRes.data || []);
        if (totalVisitsRes.count !== null) setTotalVisits(totalVisitsRes.count);
        if (bookClicksRes.count !== null) setBookClicks(bookClicksRes.count);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchUserActivity = async (user: any) => {
    setLoadingActivity(true);
    const [storiesRes, likesRes, commentsRes, bookmarksRes, progressRes] = await Promise.all([
      supabase.from('stories').select('id, title, status, views_count, created_at').eq('author_id', user.id),
      supabase.from('likes').select('id, created_at').eq('user_id', user.id),
      supabase.from('comments').select('id, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('bookmarks').select('id').eq('user_id', user.id),
      supabase.from('reading_progress').select('story_id, progress_percent').eq('user_id', user.id),
    ]);
    setUserActivity({
      stories: storiesRes.data || [],
      likesCount: likesRes.data?.length || 0,
      recentComments: commentsRes.data || [],
      bookmarksCount: bookmarksRes.data?.length || 0,
      readingProgress: progressRes.data || [],
    });
    setLoadingActivity(false);
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setUserActivity(null);
    await fetchUserActivity(user);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (selectedUser?.id === userId) setSelectedUser((prev: any) => ({ ...prev, role: newRole }));
  };

  const handleTogglePremium = async (userId: string, currentVal: boolean) => {
    await supabase.from('profiles').update({ is_premium: !currentVal }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_premium: !currentVal } : u));
    if (selectedUser?.id === userId) setSelectedUser((prev: any) => ({ ...prev, is_premium: !currentVal }));
  };

  const handleToggleFeatured = async (storyId: string, currentVal: boolean) => {
    await supabase.from('stories').update({ is_featured: !currentVal }).eq('id', storyId);
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, is_featured: !currentVal } : s));
  };

  const handleToggleStoryPremium = async (storyId: string, currentVal: boolean) => {
    await supabase.from('stories').update({ is_premium: !currentVal }).eq('id', storyId);
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, is_premium: !currentVal } : s));
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName || !genreSlug) return;
    const newG = { name: genreName, slug: genreSlug.toLowerCase(), description: genreDesc, color: genreColor };
    const { data } = await supabase.from('genres').insert([newG]).select();
    setGenres(prev => [...prev, data?.[0] || { id: Date.now().toString(), ...newG }]);
    setGenreName(''); setGenreSlug(''); setGenreDesc('');
  };

  const handleDeleteGenre = async (genreId: string) => {
    await supabase.from('genres').delete().eq('id', genreId);
    setGenres(prev => prev.filter(g => g.id !== genreId));
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText) return;
    const optionsArray = qType === 'choice' ? qOptions.split(',').map(o => o.trim()).filter(Boolean) : null;
    const { data } = await supabase.from('admin_questions').insert([{
      question: qText, type: qType, options: optionsArray, is_active: true
    }]).select();
    if (data?.[0]) setQuestions(prev => [...prev, data[0]]);
    setQText(''); setQOptions('');
  };

  const handleToggleQuestion = async (qId: string, current: boolean) => {
    await supabase.from('admin_questions').update({ is_active: !current }).eq('id', qId);
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, is_active: !current } : q));
  };

  const handleDeleteQuestion = async (qId: string) => {
    await supabase.from('admin_questions').delete().eq('id', qId);
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const filteredUsers = users.filter(u =>
    (u.display_name || u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStories = stories.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory paper-texture flex items-center justify-center">
        <div className="text-center max-w-sm w-full px-6">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 blur-2xl bg-gold/20 rounded-full" />
            <Crown className="w-20 h-20 text-gold relative z-10" />
          </div>
          <h1 className="font-serif text-4xl text-midnight mb-2">Admin Access</h1>
          <p className="text-midnight/40 font-serif italic mb-8">Enter your credentials to access the control center.</p>
          <form onSubmit={handleAdminLogin} className="glass rounded-2xl p-8 space-y-4 text-left">
            <div>
              <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Username</label>
              <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                placeholder="admin username"
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-midnight/40 mb-1 block">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ivory/50 border border-gold/20 rounded-xl px-4 py-3 text-midnight outline-none focus:border-gold transition-all" />
            </div>
            <button type="submit" className="w-full btn-gold py-3 rounded-xl relative">
              <span className="relative z-10">Login to Admin</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // User Detail View
  if (selectedUser) {
    const prefs = selectedUser.preferences || {};
    return (
      <div className="min-h-screen bg-ivory pt-28 pb-16 px-6 paper-texture">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-midnight/50 hover:text-gold transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to Users
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Profile Info */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6 border border-gold/15">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold-dark/20 flex items-center justify-center mx-auto mb-3 text-3xl font-serif text-gold">
                    {(selectedUser.display_name || selectedUser.username || '?')[0].toUpperCase()}
                  </div>
                  <h2 className="font-serif text-2xl text-midnight">{selectedUser.display_name || selectedUser.username}</h2>
                  <p className="text-midnight/40 text-sm">@{selectedUser.username}</p>
                </div>
                <div className="space-y-2 text-sm">
                  {selectedUser.bio && (
                    <div className="p-3 bg-gold/5 rounded-lg text-midnight/60 italic font-serif text-xs">{selectedUser.bio}</div>
                  )}
                  <div className="flex items-center gap-2 text-midnight/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  {selectedUser.location && (
                    <div className="flex items-center gap-2 text-midnight/50">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedUser.location}</span>
                    </div>
                  )}
                  {selectedUser.website_url && (
                    <div className="flex items-center gap-2 text-midnight/50">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="truncate">{selectedUser.website_url}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role Control */}
              <div className="glass rounded-2xl p-5 border border-gold/15">
                <h3 className="text-xs uppercase tracking-wider text-midnight/40 mb-3">Role Control</h3>
                <select value={selectedUser.role} onChange={e => handleUpdateRole(selectedUser.id, e.target.value)}
                  className="w-full bg-transparent border border-gold/30 rounded-lg px-3 py-2 text-sm outline-none mb-3">
                  <option value="reader">Reader</option>
                  <option value="writer">Writer</option>
                  <option value="premium">Premium</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => handleTogglePremium(selectedUser.id, selectedUser.is_premium)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${selectedUser.is_premium ? 'bg-gold/20 text-gold-dark' : 'bg-midnight/5 text-midnight/40'}`}>
                  <Crown className="w-3.5 h-3.5" />
                  {selectedUser.is_premium ? 'Premium Member ✓' : 'Grant Premium Access'}
                </button>
              </div>

              {/* Preferences */}
              {prefs.favorite_genres?.length > 0 && (
                <div className="glass rounded-2xl p-5 border border-gold/15">
                  <h3 className="text-xs uppercase tracking-wider text-midnight/40 mb-3">Favorite Genres</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {prefs.favorite_genres.map((g: string) => (
                      <span key={g} className="px-2 py-1 bg-gold/10 text-gold-dark text-xs rounded-full">{g}</span>
                    ))}
                  </div>
                </div>
              )}

              {prefs.reading_moods?.length > 0 && (
                <div className="glass rounded-2xl p-5 border border-gold/15">
                  <h3 className="text-xs uppercase tracking-wider text-midnight/40 mb-3">Reading Moods</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {prefs.reading_moods.map((m: string) => (
                      <span key={m} className="px-2 py-1 bg-midnight/5 text-midnight/60 text-xs rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {(prefs.reading_frequency || prefs.favorite_book) && (
                <div className="glass rounded-2xl p-5 border border-gold/15 space-y-2">
                  {prefs.reading_frequency && (
                    <div>
                      <span className="text-xs text-midnight/40">Reads: </span>
                      <span className="text-sm text-midnight">{prefs.reading_frequency}</span>
                    </div>
                  )}
                  {prefs.favorite_book && (
                    <div>
                      <span className="text-xs text-midnight/40">Fav book: </span>
                      <span className="text-sm text-midnight italic">{prefs.favorite_book}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Q&A Answers */}
              {prefs.admin_answers && Object.keys(prefs.admin_answers).length > 0 && (
                <div className="glass rounded-2xl p-5 border border-gold/15">
                  <h3 className="text-xs uppercase tracking-wider text-midnight/40 mb-3">Question Responses</h3>
                  <div className="space-y-3">
                    {questions.map(q => prefs.admin_answers[q.id] ? (
                      <div key={q.id}>
                        <div className="text-xs text-midnight/40 mb-1">{q.question}</div>
                        <div className="text-sm text-midnight bg-gold/5 px-3 py-2 rounded-lg">{prefs.admin_answers[q.id]}</div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Activity */}
            <div className="lg:col-span-2 space-y-4">
              {loadingActivity ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userActivity ? (
                <>
                  {/* Activity Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Stories', value: userActivity.stories.length, icon: BookOpen, color: '#C8A46A' },
                      { label: 'Likes', value: userActivity.likesCount, icon: Heart, color: '#e87c7c' },
                      { label: 'Comments', value: userActivity.recentComments.length, icon: MessageCircle, color: '#006D77' },
                      { label: 'Bookmarks', value: userActivity.bookmarksCount, icon: Bookmark, color: '#8B5E34' },
                    ].map(s => (
                      <div key={s.label} className="glass rounded-xl p-4 text-center border border-gold/10">
                        <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
                        <div className="font-serif text-xl text-midnight">{s.value}</div>
                        <div className="text-xs text-midnight/40">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* User's Stories */}
                  {userActivity.stories.length > 0 && (
                    <div className="glass rounded-2xl p-6 border border-gold/15">
                      <h3 className="font-serif text-lg text-midnight mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gold" /> Published Stories
                      </h3>
                      <div className="space-y-2">
                        {userActivity.stories.map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between py-2 border-b border-gold/10 last:border-0">
                            <div>
                              <div className="text-sm text-midnight font-medium">{s.title}</div>
                              <div className="text-xs text-midnight/40">{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-midnight/40">{s.views_count || 0} views</span>
                              <span className={`px-2 py-0.5 rounded-full capitalize ${s.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold-dark'}`}>{s.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reading Progress */}
                  {userActivity.readingProgress.length > 0 && (
                    <div className="glass rounded-2xl p-6 border border-gold/15">
                      <h3 className="font-serif text-lg text-midnight mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gold" /> Currently Reading ({userActivity.readingProgress.length} stories)
                      </h3>
                      <div className="space-y-3">
                        {userActivity.readingProgress.map((rp: any) => (
                          <div key={rp.story_id}>
                            <div className="flex justify-between text-xs text-midnight/50 mb-1">
                              <span>Story progress</span>
                              <span>{rp.progress_percent}%</span>
                            </div>
                            <div className="h-1.5 bg-gold/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full" style={{ width: `${rp.progress_percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Comments */}
                  {userActivity.recentComments.length > 0 && (
                    <div className="glass rounded-2xl p-6 border border-gold/15">
                      <h3 className="font-serif text-lg text-midnight mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gold" /> Recent Comments
                      </h3>
                      <div className="space-y-3">
                        {userActivity.recentComments.map((c: any) => (
                          <div key={c.id} className="bg-gold/5 rounded-lg p-3">
                            <p className="text-sm text-midnight/70">{c.content}</p>
                            <p className="text-xs text-midnight/30 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-16 px-6 paper-texture">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="section-label">VENSOULL Control Center</span>
            <h1 className="font-serif text-4xl md:text-5xl text-midnight mt-1">Admin Panel</h1>
          </div>
          <button onClick={fetchData} className="btn-outline-gold px-4 py-2 rounded-lg text-xs">Refresh Data</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gold/20 mb-8 overflow-x-auto pb-px">
          {([
            { id: 'stats', label: 'Dashboard Stats', icon: Sliders },
            { id: 'analytics', label: 'Traffic Analytics', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'stories', label: 'Story Management', icon: BookOpen },
            { id: 'genres', label: 'Genre Taxonomy', icon: Tag },
            { id: 'questions', label: 'User Questions', icon: MessageSquare },
          ] as { id: Tab; label: string; icon: any }[]).map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-sans text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-gold text-gold bg-gold/5' : 'border-transparent text-midnight/60 hover:text-gold'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-midnight/50">Loading data...</p>
          </div>
        ) : (
          <div>
            {/* Stats */}
            {activeTab === 'stats' && (
              <div className="space-y-8 animate-scale-in">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-gold' },
                    { label: 'Total Stories', value: stats.totalStories, icon: BookOpen, color: 'text-peacock-blue' },
                    { label: 'Premium Users', value: stats.premiumUsers, icon: Crown, color: 'text-gold-dark' },
                    { label: 'Active Chapters', value: stats.totalChapters, icon: Feather, color: 'text-bronze' }
                  ].map((card, i) => (
                    <div key={i} className="glass rounded-xl p-6 hover:glow-gold transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs tracking-wider uppercase text-midnight/40">{card.label}</span>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <div className="font-serif text-3xl md:text-4xl text-midnight font-semibold">{card.value}</div>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-2xl p-8">
                  <h3 className="font-serif text-2xl text-midnight mb-2">Platform Control</h3>
                  <p className="text-midnight/60 text-sm max-w-2xl leading-relaxed">
                    Monitor user activity, moderate stories, feature content, manage genre taxonomy, and create custom questions for user onboarding. Click any user to see their full profile and activity.
                  </p>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-scale-in">
                <div className="flex items-center gap-3 glass rounded-xl px-4 py-2.5 max-w-md">
                  <Search className="w-4 h-4 text-midnight/40" />
                  <input type="text" placeholder="Search users..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm placeholder-midnight/40 text-midnight" />
                </div>
                <div className="glass rounded-xl overflow-hidden border border-gold/15">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gold/15 bg-gold/5 text-xs uppercase tracking-wider text-midnight/55">
                          <th className="p-4 font-sans">User</th>
                          <th className="p-4 font-sans">Username</th>
                          <th className="p-4 font-sans">Role</th>
                          <th className="p-4 font-sans">Premium</th>
                          <th className="p-4 font-sans">Onboarded</th>
                          <th className="p-4 font-sans">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/10 text-sm text-midnight/80">
                        {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gold/5 transition-colors">
                            <td className="p-4 font-medium">{user.display_name || 'No Name'}</td>
                            <td className="p-4 text-midnight/50">@{user.username}</td>
                            <td className="p-4">
                              <select value={user.role} onChange={e => handleUpdateRole(user.id, e.target.value)}
                                className="bg-transparent border border-gold/30 rounded px-2 py-1 text-xs outline-none">
                                <option value="reader">Reader</option>
                                <option value="writer">Writer</option>
                                <option value="premium">Premium</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <button onClick={() => handleTogglePremium(user.id, user.is_premium)}
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${user.is_premium ? 'bg-gold/20 text-gold-dark' : 'bg-midnight/5 text-midnight/40'}`}>
                                <Crown className="w-3.5 h-3.5" />{user.is_premium ? 'Premium' : 'Standard'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${user.onboarding_completed ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold-dark'}`}>
                                {user.onboarding_completed ? '✓ Done' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4">
                              <button onClick={() => handleSelectUser(user)}
                                className="flex items-center gap-1 text-xs text-gold hover:underline">
                                <Eye className="w-3.5 h-3.5" /> View Full Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Stories */}
            {activeTab === 'stories' && (
              <div className="space-y-6 animate-scale-in">
                <div className="flex items-center gap-3 glass rounded-xl px-4 py-2.5 max-w-md">
                  <Search className="w-4 h-4 text-midnight/40" />
                  <input type="text" placeholder="Search stories..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm placeholder-midnight/40 text-midnight" />
                </div>
                <div className="glass rounded-xl overflow-hidden border border-gold/15">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gold/15 bg-gold/5 text-xs uppercase tracking-wider text-midnight/55">
                          <th className="p-4 font-sans">Story Title</th>
                          <th className="p-4 font-sans">Author</th>
                          <th className="p-4 font-sans">Views</th>
                          <th className="p-4 font-sans">Premium</th>
                          <th className="p-4 font-sans">Featured</th>
                          <th className="p-4 font-sans">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold/10 text-sm text-midnight/80">
                        {filteredStories.map(story => (
                          <tr key={story.id} className="hover:bg-gold/5 transition-colors">
                            <td className="p-4 font-medium">{story.title}</td>
                            <td className="p-4 text-midnight/50">{story.profiles?.display_name || 'Unknown'}</td>
                            <td className="p-4 font-mono text-xs">{story.views_count?.toLocaleString() || 0}</td>
                            <td className="p-4">
                              <button onClick={() => handleToggleStoryPremium(story.id, story.is_premium)}
                                className={`px-2 py-1 rounded border text-xs transition-all ${story.is_premium ? 'border-gold text-gold-dark bg-gold/5' : 'border-midnight/15 text-midnight/40'}`}>
                                {story.is_premium ? 'Premium Only' : 'Free Story'}
                              </button>
                            </td>
                            <td className="p-4">
                              <button onClick={() => handleToggleFeatured(story.id, story.is_featured)}
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${story.is_featured ? 'bg-gold/20 text-gold-dark' : 'bg-midnight/5 text-midnight/40'}`}>
                                <Award className="w-3.5 h-3.5" />{story.is_featured ? 'Featured' : 'Regular'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-[0.7rem] uppercase font-bold tracking-wider font-mono">{story.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Genres */}
            {activeTab === 'genres' && (
              <div className="grid lg:grid-cols-3 gap-8 items-start animate-scale-in">
                <div className="glass rounded-xl p-6 border border-gold/15">
                  <h3 className="font-serif text-xl text-midnight mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-gold" />New Genre</h3>
                  <form onSubmit={handleAddGenre} className="space-y-4 font-sans text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Genre Name</label>
                      <input type="text" placeholder="e.g. Science Fiction" value={genreName}
                        onChange={e => { setGenreName(e.target.value); setGenreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }}
                        className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Slug</label>
                      <input type="text" value={genreSlug} onChange={e => setGenreSlug(e.target.value)}
                        className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold font-mono text-xs" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={genreColor} onChange={e => setGenreColor(e.target.value)} className="w-10 h-10 p-0 border border-gold/20 rounded cursor-pointer" />
                        <input type="text" value={genreColor} onChange={e => setGenreColor(e.target.value)} className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold font-mono text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Description</label>
                      <textarea placeholder="Stories related to..." value={genreDesc} onChange={e => setGenreDesc(e.target.value)} rows={3}
                        className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold resize-none" />
                    </div>
                    <button type="submit" className="w-full btn-gold py-3 rounded-lg text-xs">Create Genre</button>
                  </form>
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-xl text-midnight mb-4">Active Categories ({genres.length})</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {genres.map(g => (
                      <div key={g.id} className="glass rounded-xl p-5 border border-gold/15 flex justify-between items-start hover:glow-gold transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: g.color || '#C8A46A' }} />
                            <h4 className="font-serif text-lg text-midnight">{g.name}</h4>
                          </div>
                          <span className="font-mono text-[0.65rem] bg-gold/10 px-2 py-0.5 rounded text-gold-dark">/{g.slug}</span>
                          <p className="text-xs text-midnight/50 mt-2 leading-relaxed">{g.description || 'No description.'}</p>
                        </div>
                        <button onClick={() => handleDeleteGenre(g.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-midnight/40 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Questions */}
            {activeTab === 'questions' && (
              <div className="grid lg:grid-cols-3 gap-8 items-start animate-scale-in">
                <div className="glass rounded-xl p-6 border border-gold/15">
                  <h3 className="font-serif text-xl text-midnight mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-gold" />Add Question</h3>
                  <form onSubmit={handleAddQuestion} className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Question Text</label>
                      <textarea value={qText} onChange={e => setQText(e.target.value)}
                        placeholder="e.g. What kind of endings do you prefer?" rows={3}
                        className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold resize-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-midnight/50 mb-1">Answer Type</label>
                      <select value={qType} onChange={e => setQType(e.target.value as any)}
                        className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold">
                        <option value="text">Short text answer</option>
                        <option value="textarea">Long text answer</option>
                        <option value="choice">Multiple choice (pick one)</option>
                      </select>
                    </div>
                    {qType === 'choice' && (
                      <div>
                        <label className="block text-xs font-semibold text-midnight/50 mb-1">Options (comma-separated)</label>
                        <input type="text" value={qOptions} onChange={e => setQOptions(e.target.value)}
                          placeholder="Happy endings, Sad endings, Open endings"
                          className="w-full glass rounded-lg px-4 py-2.5 outline-none border border-gold/20 focus:border-gold" />
                      </div>
                    )}
                    <button type="submit" className="w-full btn-gold py-3 rounded-lg text-xs">Add Question</button>
                  </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-xl text-midnight mb-2">Questions shown to users ({questions.filter(q => q.is_active).length} active)</h3>
                  <p className="text-xs text-midnight/40 mb-4">These questions appear during user onboarding. Answers are visible in each user's profile.</p>
                  {questions.length === 0 ? (
                    <div className="glass rounded-xl p-10 text-center text-midnight/40">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gold/30" />
                      <p>No questions yet. Add your first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {questions.map(q => (
                        <div key={q.id} className={`glass rounded-xl p-5 border transition-all ${q.is_active ? 'border-gold/20' : 'border-midnight/10 opacity-60'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-midnight font-medium">{q.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[0.65rem] bg-gold/10 text-gold-dark px-2 py-0.5 rounded font-mono">{q.type}</span>
                                {q.options && (
                                  <span className="text-xs text-midnight/40">{q.options.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleToggleQuestion(q.id, q.is_active)}
                                title={q.is_active ? 'Deactivate' : 'Activate'}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${q.is_active ? 'bg-green-100 text-green-600' : 'bg-midnight/5 text-midnight/30'}`}>
                                {q.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleDeleteQuestion(q.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-midnight/30 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-scale-in">
                {!analyticsEnabled ? (
                  <div className="glass rounded-2xl p-8 border border-red-500/20 bg-red-500/5 max-w-2xl mx-auto text-center space-y-4">
                    <Activity className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
                    <h3 className="font-serif text-2xl text-midnight">Database Analytics Table Required</h3>
                    <p className="text-sm text-midnight/60 leading-relaxed font-sans">
                      To track visitors, geolocation, IP addresses, and story reads in real-time, you need to create the <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono text-red-600">analytics_logs</code> table in your database.
                    </p>
                    <div className="text-left space-y-2">
                      <p className="text-xs font-semibold text-midnight/50">Run this SQL code in your Supabase SQL Editor:</p>
                      <pre className="bg-midnight text-ivory/80 text-xs p-4 rounded-xl font-mono overflow-x-auto select-all max-h-60">
{`CREATE TABLE IF NOT EXISTS analytics_logs (
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
CREATE POLICY "Allow public select" ON analytics_logs FOR SELECT TO anon, authenticated USING (true);`}
                      </pre>
                    </div>
                    <button onClick={fetchData} className="btn-gold px-6 py-2.5 rounded-lg text-xs">
                      Refresh Check
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Analytics Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="glass rounded-xl p-6 hover:glow-gold transition-all">
                        <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-2">Total Website Hits</p>
                        <h4 className="text-3xl font-serif text-gold-dark font-bold">{totalVisits.toLocaleString()}</h4>
                        <p className="text-[0.65rem] text-midnight/30 mt-1">Overall raw page views</p>
                      </div>
                      <div className="glass rounded-xl p-6 hover:glow-gold transition-all">
                        <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-2">First Book Clicks (Reads)</p>
                        <h4 className="text-3xl font-serif text-peacock-blue font-bold">{bookClicks.toLocaleString()}</h4>
                        <p className="text-[0.65rem] text-midnight/30 mt-1">"I Moved On. My Heart Didn't."</p>
                      </div>
                      <div className="glass rounded-xl p-6 hover:glow-gold transition-all">
                        <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-2">Unique Visitors</p>
                        <h4 className="text-3xl font-serif text-midnight font-bold">
                          {new Set(analyticsLogs.map(l => l.ip_address)).size}
                        </h4>
                        <p className="text-[0.65rem] text-midnight/30 mt-1">Unique IP addresses logged</p>
                      </div>
                      <div className="glass rounded-xl p-6 hover:glow-gold transition-all">
                        <p className="text-xs font-semibold text-midnight/40 uppercase tracking-wider mb-2">Cities Tracked</p>
                        <h4 className="text-3xl font-serif text-bronze font-bold">
                          {new Set(analyticsLogs.map(l => l.city).filter(c => c && c !== 'local' && c !== 'unknown')).size}
                        </h4>
                        <p className="text-[0.65rem] text-midnight/30 mt-1">Distinct geographical cities</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                      {/* Left: Geo Distribution & Top Pages */}
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
                          <h3 className="font-serif text-lg text-midnight font-semibold border-b border-gold/10 pb-2">Story Reads (Clicks)</h3>
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
                                  <span className="bg-gold/10 text-gold-dark px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">{count} clicks</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Right: Detailed Logs Table */}
                      <div className="lg:col-span-2 glass rounded-xl p-6 border border-gold/15 space-y-4 overflow-hidden">
                        <h3 className="font-serif text-lg text-midnight font-semibold border-b border-gold/10 pb-2">Live Visit Logs (Last 250)</h3>
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
                                        <span>{l.city}, {l.country}</span>
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
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
