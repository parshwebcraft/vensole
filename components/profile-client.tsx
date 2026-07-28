'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Feather, Edit3, Settings, LogOut, MapPin, Link as LinkIcon,
  Calendar, BookOpen, Clock, TrendingUp, ChevronRight, PenLine, Award, Camera,
  Heart, Eye, Users, Crown, Plus, Grid3x3, List, X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { StoryCard } from '@/components/story-card';

export function ProfileClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'stories' | 'collections' | 'activity'>('stories');
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrlState, setAvatarUrlState] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);
      setDisplayName(profileData?.display_name || '');
      setBio(profileData?.bio || '');
      setLocation(profileData?.location || '');
      setAvatarUrlState(profileData?.avatar_url || null);

      const { data: storyData } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      
      setStories(storyData || []);
      setLoading(false);
    })();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are supported');
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('File size exceeds the 1.5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrlState(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  const handleSaveProfile = async () => {
    try {
      const updates: any = { display_name: displayName, bio, location };
      if (avatarUrlState) {
        updates.avatar_url = avatarUrlState;
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
        if (passError) throw passError;
        setNewPassword('');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, ...updates }));
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="pt-0">
      {/* Cinematic cover */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-bronze/40" />
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg" alt="cover" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-midnight/20 to-transparent" />

        {/* Floating particles on cover */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gold/40"
              style={{
                left: `${10 + i * 11}%`,
                bottom: '20%',
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                animation: `particle-drift ${10 + i * 2}s linear ${i * 1.5}s infinite`,
                ['--drift-x' as string]: '0px',
              }}
            />
          ))}
        </div>

        {/* Settings button */}
        <div className="absolute top-24 right-6 flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="glass-dark px-4 py-2 rounded-lg text-ivory/80 hover:text-gold transition-colors flex items-center gap-2 text-sm"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            onClick={handleSignOut}
            className="glass-dark px-4 py-2 rounded-lg text-ivory/80 hover:text-gold transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Avatar Container positioned halfway over the cover boundary */}
      <div className="relative -mt-16 md:-mt-20 z-10 flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-ivory shadow-deep bg-ivory">
            <img
              src={avatarUrlState || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name || profile?.username || 'User'}&background=C8A46A&color=111111&size=300`}
              alt={profile?.display_name || profile?.username}
              className="w-full h-full object-cover"
            />
          </div>
          {profile?.is_premium && (
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-glow-gold animate-golden-pulse">
              <Crown className="w-5 h-5 text-midnight" />
            </div>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-6 max-w-5xl mx-auto px-6 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-midnight mb-2">
          {profile?.display_name || profile?.username || 'Writer'}
        </h1>
        <p className="text-gold text-sm tracking-wider uppercase">@{profile?.username}</p>
        {profile?.bio && (
          <p className="text-midnight/60 font-serif text-lg italic mt-4 max-w-xl mx-auto">{profile.bio}</p>
        )}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-midnight/40">
          {profile?.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>
          )}
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16 mt-8">
          {[
            { label: 'Stories', value: profile?.stories_count || stories.length, icon: BookOpen },
            { label: 'Followers', value: profile?.followers_count || 0, icon: Users },
            { label: 'Following', value: profile?.following_count || 0, icon: Heart },
            { label: 'Total Views', value: stories.reduce((acc, s) => acc + s.views_count, 0), icon: Eye },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center mb-1">
                <stat.icon className="w-4 h-4 text-gold/50" />
              </div>
              <div className="font-serif text-2xl md:text-3xl text-midnight">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-midnight/40 tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-center gap-1 border-b border-gold/15 mb-8">
          {(['stories', 'collections', 'activity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-sans capitalize transition-all relative ${
                tab === t ? 'text-gold' : 'text-midnight/40 hover:text-midnight'
              }`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'stories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-midnight">My Stories</h2>
            </div>
            {stories.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center">
                <Feather className="w-12 h-12 text-gold/30 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-midnight/60 italic">No stories yet</h3>
                <p className="text-midnight/40 mt-2">Your bookshelf awaits its first story.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stories.map((s, i) => (
                  <StoryCard key={s.id} story={s} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'collections' && (
          <div className="glass rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-midnight/60 italic">No collections yet</h3>
            <p className="text-midnight/40 mt-2">Create collections to organize your favorite stories.</p>
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-3">
            {[
              { icon: Heart, text: 'Liked "The Moonlit Garden"', time: '2 hours ago' },
              { icon: BookOpen, text: 'Started reading "Whispers in the Dark"', time: '5 hours ago' },
              { icon: Feather, text: 'Published a new chapter in "Midnight Letters"', time: '1 day ago' },
              { icon: Users, text: 'Started following Aria Chen', time: '2 days ago' },
              { icon: Award, text: 'Earned the "First Words" achievement', time: '3 days ago' },
            ].map((a, i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-midnight font-sans">{a.text}</p>
                  <p className="text-xs text-midnight/30 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal Dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-md transition-all duration-300">
          <div className="glass rounded-2xl p-8 max-w-lg w-full space-y-4 text-left border border-gold/15 relative shadow-deep animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditing(false)}
              className="absolute top-4 right-4 text-midnight/40 hover:text-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-midnight mb-2">Edit Profile</h3>

            {/* Avatar edit inside modal */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-gold/20 shadow-soft">
                <img
                  src={avatarUrlState || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name || profile?.username || 'User'}&background=C8A46A&color=111111&size=150`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-ivory hover:text-gold transition-colors gap-1 text-[0.65rem] font-sans"
                >
                  <Camera className="w-4 h-4 animate-pulse" />
                  <span>Change Photo</span>
                </button>
              </div>
              <span className="text-[0.65rem] text-midnight/40 mt-1.5 uppercase tracking-wider font-sans">JPG, JPEG or PNG (max 1.5MB)</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg, image/png, image/jpg"
                className="hidden"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-1 block font-sans">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-ivory/50 border border-gold/20 rounded-lg px-4 py-2 outline-none focus:border-gold transition-all text-midnight font-sans"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-1 block font-sans">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-ivory/50 border border-gold/20 rounded-lg px-4 py-2 outline-none focus:border-gold transition-all resize-none text-midnight font-sans"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-1 block font-sans">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-ivory/50 border border-gold/20 rounded-lg px-4 py-2 outline-none focus:border-gold transition-all text-midnight font-sans"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-midnight/40 mb-1 block font-sans">Change Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-ivory/50 border border-gold/20 rounded-lg px-4 py-2 outline-none focus:border-gold transition-all text-midnight placeholder:text-midnight/30 font-sans"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditing(false)} className="btn-outline-gold px-4 py-2 rounded-lg text-xs font-sans">Cancel</button>
              <button onClick={handleSaveProfile} className="btn-gold px-4 py-2 rounded-lg text-xs relative font-sans">
                <span className="relative z-10">Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
