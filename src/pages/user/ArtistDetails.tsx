import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { 
  MapPin, CheckCircle2, DollarSign, Calendar, Clock,
  Tag, Video, Music, Mail, Phone, ArrowLeft, Send, Bookmark
} from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../../config';
import { useAuthStore } from '../../store/authStore';
import { AnimatePresence } from 'framer-motion';

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

const getYoutubeEmbedId = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [artist, setArtist] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    eventDate: '',
    eventType: 'Club Gigs',
    durationHours: '2',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/artists/${id}`);
        if (response.ok) {
          const data = await response.json();
          setArtist(data.artist || null);
          setEvents(data.events || []);
          if (data.artist?.gallery_images?.length > 0) {
            setActiveImage(data.artist.gallery_images[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching artist details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtistDetails();
  }, [id]);

  useEffect(() => {
    if (id) {
      try {
        const saved = localStorage.getItem('saved_artists');
        if (saved) {
          const ids = JSON.parse(saved);
          if (Array.isArray(ids)) {
            setIsSaved(ids.includes(id));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [id]);

  const handleToggleSave = () => {
    if (!id) return;
    try {
      const saved = localStorage.getItem('saved_artists');
      let ids = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(ids)) ids = [];
      
      if (ids.includes(id)) {
        ids = ids.filter((savedId: string) => savedId !== id);
        setIsSaved(false);
      } else {
        ids.push(id);
        setIsSaved(true);
      }
      localStorage.setItem('saved_artists', JSON.stringify(ids));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a booking request!');
      return;
    }
    if (!bookingForm.eventDate || !bookingForm.budget) {
      alert('Please select event date and propose a budget.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/artists/${artist.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          event_date: bookingForm.eventDate,
          event_type: bookingForm.eventType,
          duration_hours: parseFloat(bookingForm.durationHours),
          message: bookingForm.message,
          budget: parseFloat(bookingForm.budget) || artist.booking_price
        })
      });
      if (response.ok) {
        setShowSuccessModal(true);
        setBookingForm({
          eventDate: '',
          eventType: 'Club Gigs',
          durationHours: '2',
          budget: '',
          message: ''
        });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit booking inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh] animate-pulse">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--violet-bright)]" />
        </div>
      </PageWrapper>
    );
  }

  if (!artist) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold">Artist Not Found</h2>
          <p className="text-[var(--text-secondary)] mt-2">The artist profile you requested does not exist or hasn't been approved yet.</p>
          <GlowButton onClick={() => navigate('/artists')} className="mt-6">
            Back to Directory
          </GlowButton>
        </div>
      </PageWrapper>
    );
  }

  const embedId = getYoutubeEmbedId(artist.video_url);

  return (
    <PageWrapper>
      <FloatingOrb className="top-10 left-10" color="violet" size={500} />
      <FloatingOrb className="bottom-10 right-10" color="cyan" size={400} delay={1} />

      <div className="relative z-10 pb-20">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/artists')}
          className="mb-8 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Artists Directory
        </button>

        {/* Stunning Artist Hero Header */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 mb-10 group shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Background Blurred Wallpaper */}
          <div className="absolute inset-0 z-0">
            <img 
              src={getImageUrl(artist.gallery_images?.[0])} 
              alt="" 
              className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-14 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border border-white/20 shadow-glow flex-shrink-0">
              <img 
                src={getImageUrl(artist.gallery_images?.[0])} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                <span className="bg-[var(--violet-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {artist.category || 'Artist'}
                </span>
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Evento Partner
                </span>
                <button
                  onClick={handleToggleSave}
                  className={`border text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
                    isSaved 
                      ? 'bg-[var(--accent-pink)]/20 border-[var(--accent-pink)] text-[var(--accent-pink)] shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[var(--accent-pink)]' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Artist'}
                </button>
              </div>

              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
                {artist.name}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-[var(--text-secondary)] font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[var(--violet-bright)]" />
                  <span>Based in {artist.city}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30 hidden md:block" />
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <DollarSign className="w-4 h-4 text-[var(--violet-bright)]" />
                  <span>From ₹{(artist.booking_price || 15000).toLocaleString()} / Gig</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Biography, Media, Rider, Shows) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Artist Bio & Genres */}
            <GlassCard className="p-8 space-y-6">
              <h3 className="text-2xl font-bold font-display">Biography</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base font-medium whitespace-pre-wrap">
                {artist.description}
              </p>
              
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Performance Genres</p>
                <div className="flex flex-wrap gap-2">
                  {artist.genres && artist.genres.map((genre: string, index: number) => (
                    <span key={index} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-semibold">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Video Showcase (YouTube embed) */}
            {embedId && (
              <GlassCard className="p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[var(--accent-pink)]" />
                  <h3 className="text-2xl font-bold font-display">Performance Reel</h3>
                </div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${embedId}?autoplay=0&mute=0`}
                    title="Artist Showcase Reel"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </GlassCard>
            )}

            {/* Gallery Carousels */}
            {artist.gallery_images && artist.gallery_images.length > 0 && (
              <GlassCard className="p-8 space-y-6">
                <h3 className="text-2xl font-bold font-display">Showcase Gallery</h3>
                
                {/* Active Image Frame */}
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <img 
                    src={getImageUrl(activeImage || artist.gallery_images[0])} 
                    alt="Artist Showcase" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails list */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                  {artist.gallery_images.map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === imgUrl || (!activeImage && idx === 0) ? 'border-[var(--violet-bright)] scale-95 shadow-glow' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={getImageUrl(imgUrl)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Technical Rider / Specs */}
            <GlassCard className="p-8 space-y-6">
              <h3 className="text-2xl font-bold font-display">Technical Rider</h3>
              <p className="text-xs text-[var(--text-muted)] font-medium">Standard requirements for client venue booking:</p>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                {[
                  { label: "Console Specs: Pioneer CDJ-2000 Nexus 2 or equivalent (for DJs)", checked: artist.category === 'DJ' },
                  { label: "Microphone: Shure SM58 wireless vocal mic (for Singers/Comedians)", checked: artist.category === 'Singer' || artist.category === 'Comedian' || artist.category === 'Host' },
                  { label: "Audio Monitoring: Left & Right stage monitoring speakers", checked: true },
                  { label: "Backstage greenroom with water, snacks, and mirrors", checked: true },
                  { label: "Venue soundcheck required 2 hours prior to doors opening", checked: true }
                ].filter(item => item.checked).map((rider, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--violet-bright)] flex-shrink-0" />
                    <span className="text-[var(--text-secondary)]">{rider.label}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
            
            {/* Shows List */}
            {events.length > 0 && (
              <GlassCard className="p-8 space-y-6">
                <h3 className="text-2xl font-bold font-display">Upcoming Live Shows</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--border-glow)] hover:bg-white/10 transition-all cursor-pointer flex gap-4"
                    >
                      <img src={ev.cover_image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{ev.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-1">{ev.venue_name}, {ev.city}</p>
                        <p className="text-[10px] font-bold text-[var(--violet-bright)] mt-1.5">
                          {new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

          </div>

          {/* Right Column (Booking Widget & Contacts) */}
          <div className="space-y-6">
            
            {/* Booking Form Card */}
            <GlassCard className="p-6 border-[var(--violet-primary)]/20 shadow-glow sticky top-24">
              <header className="mb-6 border-b border-white/5 pb-4">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Est. Starting Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">₹{(artist.booking_price || 15000).toLocaleString()}</span>
                  <span className="text-xs text-[var(--text-secondary)]">/ Gig</span>
                </div>
              </header>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-left w-full text-[10px] font-bold uppercase text-[var(--text-secondary)]">Event Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input 
                      type="date" 
                      value={bookingForm.eventDate}
                      onChange={(e) => setBookingForm({...bookingForm, eventDate: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/8 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-left w-full text-[10px] font-bold uppercase text-[var(--text-secondary)]">Gig Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <select 
                      value={bookingForm.eventType}
                      onChange={(e) => setBookingForm({...bookingForm, eventType: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/8 transition-all [&>option]:bg-[#121214]"
                    >
                      <option value="Club Gigs">Club Gigs / Lounges</option>
                      <option value="Concerts">Public Concerts</option>
                      <option value="Private Shows">Private Corporate Shows</option>
                      <option value="Weddings">Wedding Parties</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-left w-full text-[10px] font-bold uppercase text-[var(--text-secondary)]">Performance Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input 
                      type="number" 
                      min="1" 
                      max="8"
                      value={bookingForm.durationHours}
                      onChange={(e) => setBookingForm({...bookingForm, durationHours: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/8 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-left w-full text-[10px] font-bold uppercase text-[var(--text-secondary)]">Propose Booking Budget (₹ INR)</label>
                  <input 
                    type="number" 
                    placeholder={`e.g. ${artist.booking_price || 15000}`}
                    value={bookingForm.budget}
                    onChange={(e) => setBookingForm({...bookingForm, budget: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/8 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-left w-full text-[10px] font-bold uppercase text-[var(--text-secondary)]">Request Message / Venue Location</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide details about your stage space, audience volume, and requirements..."
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--violet-bright)] focus:bg-white/8 transition-all resize-none"
                  />
                </div>

                <GlowButton 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="w-full py-3 text-xs uppercase tracking-widest font-bold mt-2"
                >
                  <Send className="w-4 h-4 mr-2" /> Book / Hire Artist
                </GlowButton>
              </form>
            </GlassCard>

            {/* Quick Contacts Card */}
            <GlassCard className="p-6 space-y-4">
              <h4 className="text-sm font-bold font-display">Official Artist Channels</h4>
              <div className="space-y-3 text-xs font-medium">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">{artist.contact_email}</span>
                </div>
                {artist.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-secondary)]">{artist.phone}</span>
                  </div>
                )}
              </div>

              {/* Social Channels badges */}
              <div className="flex gap-2.5 pt-3 border-t border-white/5">
                {artist.social_links?.instagram && (
                  <a href={artist.social_links.instagram} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:bg-pink-500/10 hover:text-pink-500 rounded-xl transition-all">
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {artist.social_links?.youtube && (
                  <a href={artist.social_links.youtube} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
                {artist.social_links?.spotify && (
                  <a href={artist.social_links.spotify} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:bg-green-500/10 hover:text-green-500 rounded-xl transition-all">
                    <Music className="w-4 h-4" />
                  </a>
                )}
              </div>
            </GlassCard>

          </div>

        </div>

      </div>

      {/* Booking Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div 
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <GlassCard className="relative w-full max-w-sm p-8 text-center space-y-6 z-10 border-green-500/30 shadow-glow">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display">Booking Sent!</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Your request has been delivered to **{artist.name}**. The artist will review your rider details and contact you via business email within 24 hours.
                </p>
              </div>

              <GlowButton 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-green-500 hover:bg-green-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
              >
                Done
              </GlowButton>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
};
