import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { User, Mail, Phone, Globe, CreditCard, Save, Sparkles, Video, Image, Music } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config';

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);

const CATEGORY_OPTIONS = ['DJ', 'Singer', 'Comedian', 'Band', 'Dancer', 'Host'];

export const AdminSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    payoutUpi: '',
    category: 'DJ',
    genres: '',
    galleryImages: '',
    videoUrl: '',
    bookingPrice: '',
    instagram: '',
    youtubeLink: '',
    spotify: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const comp = data.company;
          setCompany(comp);
          setFormData({
            companyName: comp.name || '',
            email: comp.contact_email || user.email || '',
            phone: comp.phone || '',
            website: comp.website || '',
            bio: comp.description || '',
            payoutUpi: comp.payout_upi || '',
            category: comp.category || 'DJ',
            genres: Array.isArray(comp.genres) ? comp.genres.join(', ') : '',
            galleryImages: Array.isArray(comp.gallery_images) ? comp.gallery_images.join(', ') : '',
            videoUrl: comp.video_url || '',
            bookingPrice: comp.booking_price ? String(comp.booking_price) : '',
            instagram: comp.social_links?.instagram || '',
            youtubeLink: comp.social_links?.youtube || '',
            spotify: comp.social_links?.spotify || '',
          });
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    
    const targetId = company?.id || `comp_${Math.random().toString(36).substring(2, 11)}`;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName,
          phone: formData.phone,
          website: formData.website,
          description: formData.bio,
          payout_upi: formData.payoutUpi,
          contact_email: formData.email,
          category: formData.category,
          genres: formData.genres.split(',').map(s => s.trim()).filter(Boolean),
          gallery_images: formData.galleryImages.split(',').map(s => s.trim()).filter(Boolean),
          video_url: formData.videoUrl,
          booking_price: parseFloat(formData.bookingPrice) || 0,
          social_links: {
            instagram: formData.instagram,
            youtube: formData.youtubeLink,
            spotify: formData.spotify
          }
        })
      });

      if (response.ok) {
        alert('Portfolio settings updated successfully! Verification status depends on Superadmin review.');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <header>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-[var(--violet-bright)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--violet-bright)]">Artist Workspace</span>
          </div>
          <h1 className="text-4xl font-display font-bold">Portfolio Settings</h1>
          <p className="text-[var(--text-secondary)]">Design your public profile to attract events and organizers.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Info */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <User className="w-5 h-5 text-[var(--violet-bright)]" />
              <h3 className="text-xl font-bold font-display">Artist Stage Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Artist/Stage Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all"
                  placeholder="e.g. DJ Shadow"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Artist Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all text-white [&>option]:bg-[#121214] [&>option]:text-white"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Genres (Comma separated)</label>
                <input 
                  type="text" 
                  value={formData.genres}
                  onChange={(e) => setFormData({...formData, genres: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all"
                  placeholder="e.g. Techno, Cyberpunk, Progressive House"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Starting Booking Price (₹ INR)</label>
                <input 
                  type="number" 
                  value={formData.bookingPrice}
                  onChange={(e) => setFormData({...formData, bookingPrice: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all"
                  placeholder="e.g. 25000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Biography / Pitch</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all resize-none"
                placeholder="Briefly describe your career, performance style, and key references..."
                required
              />
            </div>
          </GlassCard>

          {/* Media & Showcase */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Video className="w-5 h-5 text-[var(--accent-pink)]" />
              <h3 className="text-xl font-bold font-display">Performance Showcase</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">YouTube Performance Reel URL</label>
                <div className="relative">
                  <YoutubeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="url" 
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Gallery Image URLs (Comma separated)</label>
                <div className="relative">
                  <Image className="absolute left-4 top-4 w-4 h-4 text-[var(--text-muted)]" />
                  <textarea 
                    rows={3}
                    value={formData.galleryImages}
                    onChange={(e) => setFormData({...formData, galleryImages: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all resize-none"
                    placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Contact & Social Links */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Globe className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h3 className="text-xl font-bold font-display">Contact & Social Channels</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Instagram Handle URL</label>
                <div className="relative">
                  <InstagramIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="url" 
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Spotify Artist Link</label>
                <div className="relative">
                  <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="url" 
                    value={formData.spotify}
                    onChange={(e) => setFormData({...formData, spotify: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all"
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Payout & Payments */}
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <CreditCard className="w-5 h-5 text-[var(--accent-gold)]" />
              <h3 className="text-xl font-bold font-display">Payout Details</h3>
            </div>

            <div className="p-4 rounded-xl bg-[var(--violet-primary)]/5 border border-[var(--border-subtle)] text-xs text-[var(--violet-bright)] font-medium">
              Payouts for hired shows are automatically escrowed and released within 48 hours of event completion.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase">UPI ID for Payouts</label>
              <input 
                type="text" 
                value={formData.payoutUpi}
                onChange={(e) => setFormData({...formData, payoutUpi: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] outline-none transition-all text-white placeholder:text-[var(--text-muted)]"
                placeholder="yourname@upi"
              />
            </div>
          </GlassCard>

          <div className="flex justify-end gap-4">
            <GlowButton type="submit" disabled={isLoading} className="px-12 py-4">
              <Save className="w-5 h-5 mr-2" /> Save Portfolio Changes
            </GlowButton>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};
