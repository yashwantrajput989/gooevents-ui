import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useLocationStore } from '../../store/locationStore';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/ui/GlassCard';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { GlowButton } from '../../components/ui/GlowButton';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  UserPlus, 
  Mic2, 
  Star,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../config';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();
  const { city: activeCity } = useLocationStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch events in current city
        const cityParam = activeCity || 'Mumbai';
        const eventRes = await fetch(`${API_BASE_URL}/events?city=${cityParam}`);
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setPopularEvents(Array.isArray(eventData) ? eventData : []);
        }

        // Fetch artists list
        const artistRes = await fetch(`${API_BASE_URL}/api/artists`);
        if (artistRes.ok) {
          const artistData = await artistRes.json();
          setPopularArtists(Array.isArray(artistData) ? artistData.slice(0, 4) : []);
        }
      } catch (error) {
        console.error('Error fetching dashboard home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [activeCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleJoinArtist = () => {
    if (!user) {
      openModal('auth');
    } else if (user.role === 'admin' || user.role === 'superadmin') {
      navigate('/admin');
    } else {
      navigate('/artist-onboarding');
    }
  };

  const firstName = user ? (user.full_name || 'Guest').split(' ')[0] : '';

  return (
    <PageWrapper className="relative pb-24">
      {/* Visual background enhancements */}
      <FloatingOrb className="-top-40 -left-20" color="violet" size={500} />
      <FloatingOrb className="top-40 -right-20" color="cyan" size={400} delay={1.5} />

      <div className="relative z-10 space-y-10 max-w-6xl mx-auto px-4 md:px-0">
        
        {/* ━━━ HERO SECTION ━━━ */}
        <section className="text-center md:text-left space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {user && (
              <span className="inline-block px-3.5 py-1 rounded-full bg-[var(--violet-primary)]/15 border border-[var(--violet-primary)]/30 text-[var(--violet-bright)] text-xs font-bold uppercase tracking-wider">
                Welcome back, {firstName}!
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-none text-white">
              Discover. <br />
              <span className="text-gradient">Book.</span> <br />
              Perform.
            </h1>
            <p className="text-[var(--text-secondary)] font-medium text-base md:text-lg max-w-md">
              Your gateway to amazing events & talented artists.
            </p>
          </motion.div>

          {/* Large Hero Search bar */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative max-w-xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text"
              placeholder="Search events, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-16 py-4.5 text-sm outline-none focus:bg-white/10 focus:border-[var(--border-glow)] transition-all placeholder:text-[var(--text-muted)] shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[var(--violet-primary)] hover:bg-[var(--violet-bright)] text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        </section>

        {/* ━━━ QUICK CARDS CATEGORIES ━━━ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              title: 'Events', 
              sublabel: 'Book Tickets', 
              icon: Calendar, 
              path: '/events', 
              color: 'from-pink-500/20 to-orange-500/10 border-pink-500/20 text-pink-400' 
            },
            { 
              title: 'Book an Artist', 
              sublabel: 'Hire Talents', 
              icon: Sparkles, 
              path: '/artists', 
              color: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-400' 
            },
            { 
              title: 'Join as Artist', 
              sublabel: 'Build Your Profile', 
              icon: UserPlus, 
              action: handleJoinArtist,
              color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400' 
            },
            { 
              title: 'Open Mics', 
              sublabel: 'Show Your Talent', 
              icon: Mic2, 
              path: '/openmics', 
              color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400' 
            },
          ].map((card, idx) => {
            const Container = card.path ? Link : 'button';
            const props = card.path ? { to: card.path } : { onClick: card.action };
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
              >
                <Container
                  {...(props as any)}
                  className={`w-full text-left flex flex-col items-start gap-4 p-5 rounded-2xl bg-gradient-to-br border hover:shadow-glow hover:-translate-y-1 hover:border-white/20 transition-all duration-300 group cursor-pointer h-full relative overflow-hidden`}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div className={`p-3 rounded-xl bg-white/5 ${card.color.split(' ').pop()} group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-display font-extrabold text-base leading-tight">{card.title}</h4>
                    <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mt-1">{card.sublabel}</p>
                  </div>
                </Container>
              </motion.div>
            );
          })}
        </section>

        {/* ━━━ POPULAR EVENTS SLIDER ━━━ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-display font-extrabold text-white">Popular Events</h2>
            <Link to="/events" className="text-xs font-bold text-[var(--violet-bright)] flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/5" />
              ))}
            </div>
          ) : popularEvents.length === 0 ? (
            <GlassCard className="p-10 border-dashed text-center text-sm text-[var(--text-muted)]">
              No live events in {activeCity || 'your area'} yet. Try checking other cities!
            </GlassCard>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:-mx-0 md:px-0">
              {popularEvents.map((event) => (
                <GlassCard 
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="p-0 min-w-[200px] w-[200px] md:min-w-[240px] md:w-[240px] flex-shrink-0 cursor-pointer overflow-hidden group hover:border-[var(--border-glow)] hover:shadow-glow duration-300"
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={getImageUrl(event.cover_image)} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    
                    {/* Event Type / Category Overlay */}
                    <div className="absolute top-3.5 left-3.5 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">
                      {event.category || 'Music'}
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                      <h4 className="font-display font-extrabold text-sm md:text-base leading-tight group-hover:text-[var(--violet-bright)] transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-[10px] text-[var(--violet-bright)] font-bold">
                        ₹{(event.price || 0).toLocaleString()} onwards
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--bg-card)] border-t border-white/5 space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--violet-bright)]" /> {event.venue_name}
                    </p>
                    <p className="text-[9px] font-bold text-white/70">
                      {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* ━━━ FEATURED ARTISTS ━━━ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-display font-extrabold text-white">Featured Artists</h2>
            <Link to="/artists" className="text-xs font-bold text-[var(--violet-bright)] flex items-center gap-1 hover:underline">
              Hire Talents <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/5" />
              ))}
            </div>
          ) : popularArtists.length === 0 ? (
            <GlassCard className="p-10 border-dashed text-center text-sm text-[var(--text-muted)]">
              No registered artists available right now.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popularArtists.map((artist) => {
                const coverImg = artist.gallery_images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000';
                return (
                  <GlassCard
                    key={artist.id}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                    className="p-3 flex items-center gap-3.5 hover:border-[var(--border-glow)] transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={getImageUrl(coverImg)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-white truncate group-hover:text-[var(--violet-bright)] transition-colors">{artist.name}</h4>
                      <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-bold mt-0.5">{artist.category || 'Singer'}</p>
                      <div className="flex items-center gap-0.5 text-[8px] text-[var(--violet-glow)] font-bold mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> 4.9
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </section>

        {/* ━━━ BECOME AN ORGANIZER PROMO BANNER ━━━ */}
        <section>
          <GlassCard className="p-8 relative overflow-hidden rounded-[2rem] border border-[var(--violet-primary)]/20 shadow-glow flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[var(--violet-primary)]/10 to-transparent">
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--violet-bright)] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 animate-bounce" /> Host Your Own Show
              </span>
              <h3 className="text-2xl font-display font-black text-white leading-tight">Got a gig idea? Sell tickets on Goo Events</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium max-w-lg">
                Organize open mics, college fests, rooftops, or band performances. Get free ticketing tools, dashboard stats, and venue recommendations instantly.
              </p>
            </div>
            <GlowButton onClick={() => navigate('/organize')} className="relative z-10 w-fit shrink-0 py-3.5 px-8 font-bold text-xs uppercase tracking-wider">
              Become an Organizer
            </GlowButton>
          </GlassCard>
        </section>

      </div>
    </PageWrapper>
  );
};
