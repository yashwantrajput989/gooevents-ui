import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { 
  Sparkles, Music, Mic2, Disc, Users, Smile, Compass, 
  ArrowRight, Save, Image, Video, Mail, Phone, CheckCircle2 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Singer', label: 'Singer / Solo Vocalist', icon: Music },
  { id: 'Band', label: 'Bands / Music Groups', icon: Users },
  { id: 'DJ', label: 'DJs / Music Producer', icon: Disc },
  { id: 'Dancer', label: 'Dancer / Dance Acts', icon: Sparkles },
  { id: 'Instrumentalist', label: 'Instrumentalist', icon: Compass },
  { id: 'Anchor', label: 'Anchor / MC', icon: Smile },
  { id: 'Comedian', label: 'Comedian / Standup', icon: Mic2 },
  { id: 'Other', label: 'Other Talent', icon: Compass },
];

export const ArtistOnboarding: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Singer',
    genres: '',
    booking_price: '',
    description: '',
    video_url: '',
    contact_email: user?.email || '',
    phone: '',
    instagram: '',
    youtubeLink: '',
    spotify: '',
  });

  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  if (!user) {
    navigate('/events');
    return null;
  }

  const handleNext = () => {
    if (step === 2 && (!formData.name.trim() || !formData.description.trim())) {
      alert('Stage Name and Biography are required.');
      return;
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user.id,
        name: formData.name,
        category: formData.category,
        genres: formData.genres.split(',').map(s => s.trim()).filter(Boolean),
        booking_price: parseFloat(formData.booking_price) || 0,
        description: formData.description,
        video_url: formData.video_url,
        contact_email: formData.contact_email,
        phone: formData.phone,
        social_links: {
          instagram: formData.instagram,
          youtube: formData.youtubeLink,
          spotify: formData.spotify
        },
        gallery_images: galleryImages
      };

      const response = await fetch(`${API_BASE_URL}/artists/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Sync local user role to admin so client redirects work correctly
        const updatedUser = { ...user, role: 'admin' as const };
        setUser(updatedUser);
        setShowSuccess(true);
      } else {
        alert('Failed to register artist profile.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="relative py-12 flex justify-center items-center min-h-[85vh]">
      <FloatingOrb className="-top-40 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-0 right-0" color="cyan" size={300} delay={2} />

      <div className="max-w-2xl w-full px-4 relative z-10">
        
        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s 
                  ? 'bg-[var(--violet-primary)] text-white shadow-glow' 
                  : 'bg-white/5 border border-white/10 text-[var(--text-muted)]'
              }`}>
                {s}
              </div>
              {s < 5 && (
                <div className={`h-0.5 flex-1 transition-colors ${
                  step > s ? 'bg-[var(--violet-primary)]' : 'bg-white/5'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-white">Choose Your Category</h2>
                <p className="text-sm text-[var(--text-secondary)]">Select the talent category that best represents you.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({...formData, category: cat.id})}
                    className={`p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${
                      formData.category === cat.id
                        ? 'bg-[var(--violet-primary)]/10 border-[var(--violet-bright)] shadow-glow scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-xl w-fit ${
                      formData.category === cat.id ? 'bg-[var(--violet-primary)] text-white' : 'bg-white/5 text-[var(--text-muted)] group-hover:text-white'
                    }`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white text-sm">{cat.label}</span>
                    {formData.category === cat.id && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--violet-bright)] absolute top-4 right-4" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <GlowButton onClick={handleNext} className="py-3.5 px-8">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-white">Stage Details</h2>
                <p className="text-sm text-[var(--text-secondary)]">Create your stage identity and professional biography.</p>
              </div>

              <GlassCard className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Artist/Stage Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. DJ Shadow, Neha Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Biography & Experience</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your musical career, live events you've performed at, and what makes your show unique..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.genres}
                    onChange={(e) => setFormData({...formData, genres: e.target.value})}
                    placeholder="e.g. Classical, Hindustani, Fusion, Indie Pop"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                  />
                </div>
              </GlassCard>

              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                  Back
                </button>
                <GlowButton onClick={handleNext} className="py-3.5 px-8">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-white">Showcase Media</h2>
                <p className="text-sm text-[var(--text-secondary)]">Upload showcase pictures and link a video performance reel.</p>
              </div>

              <GlassCard className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">YouTube Video Performance Link</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Gallery Photos</label>
                  
                  {/* File Upload Area */}
                  <div className="relative border-2 border-dashed border-white/10 hover:border-[var(--violet-bright)] rounded-2xl p-6 transition-colors flex flex-col items-center justify-center cursor-pointer text-center bg-white/5 group">
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files) return;
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const uploadData = new FormData();
                          uploadData.append('image', file);
                          try {
                            const response = await fetch(`${API_BASE_URL}/upload`, {
                              method: 'POST',
                              body: uploadData
                            });
                            const data = await response.json();
                            if (data.url) {
                              setGalleryImages(prev => [...prev, data.url]);
                            }
                          } catch (error) {
                            console.error('Showcase image upload failed:', error);
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Image className="w-8 h-8 text-[var(--text-muted)] mb-2 group-hover:text-[var(--violet-bright)] transition-colors" />
                    <p className="text-sm font-bold text-white group-hover:text-[var(--violet-bright)] transition-colors">
                      Upload Profile Showcase Photos
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG or WebP (Max 5MB each)</p>
                  </div>

                  {/* Thumbnail Row */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {galleryImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                          <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                  Back
                </button>
                <GlowButton onClick={handleNext} className="py-3.5 px-8">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-white">Booking Rates & Socials</h2>
                <p className="text-sm text-[var(--text-secondary)]">Set your booking pricing and business links.</p>
              </div>

              <GlassCard className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Base Booking Price (₹ INR / Gig)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">₹</span>
                    <input
                      type="number"
                      required
                      value={formData.booking_price}
                      onChange={(e) => setFormData({...formData, booking_price: e.target.value})}
                      placeholder="e.g. 15000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Social Media Handles (Optional)</label>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)]">Instagram</span>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        placeholder="https://instagram.com/stage_name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-24 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)]"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)]">Spotify</span>
                      <input
                        type="url"
                        value={formData.spotify}
                        onChange={(e) => setFormData({...formData, spotify: e.target.value})}
                        placeholder="https://open.spotify.com/artist/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-24 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)]"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                  Back
                </button>
                <GlowButton onClick={handleNext} className="py-3.5 px-8">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-extrabold text-white">Review & Submit</h2>
                <p className="text-sm text-[var(--text-secondary)]">Review details and submit for Superadmin approval.</p>
              </div>

              <GlassCard className="p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <img 
                      src={galleryImages[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000'} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                    <p className="text-xs text-[var(--violet-bright)] font-bold">{formData.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold uppercase tracking-wider mb-0.5">Starting Pricing</span>
                    <span className="font-bold text-white text-sm">₹{parseFloat(formData.booking_price || '0').toLocaleString()} / Gig</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold uppercase tracking-wider mb-0.5">Genres</span>
                    <span className="font-bold text-white truncate block">{formData.genres || 'None specified'}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[var(--text-muted)] block font-bold uppercase tracking-wider">Biography Summary</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 max-h-24 overflow-y-auto">
                    {formData.description}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed">
                  <strong>Verification details:</strong> Once submitted, your profile will be sent to the Evento admin team. Verification takes up to 24 hours. While pending, you can log in to your dashboard to draft show details.
                </div>
              </GlassCard>

              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                  Back
                </button>
                <GlowButton 
                  onClick={handleSubmit} 
                  isLoading={isSubmitting}
                  className="py-3.5 px-8 font-bold"
                >
                  <Save className="w-4 h-4 mr-2" /> Submit Portfolio
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <GlassCard className="relative w-full max-w-sm p-8 text-center space-y-6 z-10 border-green-500/30 shadow-glow">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Portfolio Submitted!</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Your profile is successfully submitted for verification. You can now access the **Artist/Organizer Dashboard** to draft shows and manage pricing.
                </p>
              </div>
              <GlowButton 
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/admin');
                }}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Go to Dashboard
              </GlowButton>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};
