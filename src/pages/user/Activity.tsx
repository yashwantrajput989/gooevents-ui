import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { 
  Bookmark, Ticket, Search, Clock, Trash2, ArrowRight, 
  MapPin, Calendar, Sparkles, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { API_BASE_URL, getImageUrl } from '../../config';

export const Activity: React.FC = () => {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();
  const navigate = useNavigate();
  
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocalStorage = () => {
      // 1. Get saved artist IDs from localStorage
      try {
        const savedIds = localStorage.getItem('saved_artists');
        if (savedIds) {
          setSavedArtistIds(JSON.parse(savedIds));
        } else {
          setSavedArtistIds([]);
        }
      } catch (e) {
        console.error(e);
      }

      // 2. Get recent search terms from localStorage
      try {
        const searches = localStorage.getItem('recent_searches');
        if (searches) {
          setRecentSearches(JSON.parse(searches));
        } else {
          // Mock fallback searches if empty
          const defaultSearches = ['Techno Rave', 'Standup Comedy', 'Indie Acoustic', 'Mumbai DJs'];
          setRecentSearches(defaultSearches);
          localStorage.setItem('recent_searches', JSON.stringify(defaultSearches));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadLocalStorage();
    window.addEventListener('storage', loadLocalStorage);
    return () => window.removeEventListener('storage', loadLocalStorage);
  }, []);

  // Fetch artists and bookings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all verified artists
        const artistRes = await fetch(`${API_BASE_URL}/artists`);
        if (artistRes.ok) {
          const artistData = await artistRes.json();
          setArtists(Array.isArray(artistData) ? artistData : []);
        }

        // Fetch bookings if user is logged in
        if (user) {
          const bookingsRes = await fetch(`${API_BASE_URL}/bookings/user/${user.id}`);
          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json();
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          }
        }
      } catch (err) {
        console.error('Error fetching activity data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter artists that are saved
  const savedArtists = artists.filter(a => savedArtistIds.includes(a.id));

  // Toggle remove artist from saved
  const handleRemoveSavedArtist = (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedIds = savedArtistIds.filter(id => id !== artistId);
    setSavedArtistIds(updatedIds);
    localStorage.setItem('saved_artists', JSON.stringify(updatedIds));
  };

  // Clear search history
  const handleClearSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  // Click on search history pill
  const handleSearchClick = (term: string) => {
    // Navigate to events page with search query
    navigate(`/events?search=${encodeURIComponent(term)}`);
  };

  return (
    <PageWrapper>
      <FloatingOrb className="-top-40 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-20 right-10" color="cyan" size={300} delay={1} />

      <div className="relative z-10 space-y-8 pb-16 max-w-5xl mx-auto px-1 md:px-0">
        
        {/* Header */}
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Your <span className="text-gradient">Activity</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-xs md:text-sm font-medium">
            Manage your booked tickets, saved artist profiles, and search history in one place.
          </p>
        </header>

        {/* Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main: Booked Tickets & Saved Profiles */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Booked Tickets */}
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[var(--violet-bright)]" />
                  <h3 className="text-lg font-bold font-display">Booked Event Tickets</h3>
                </div>
                {user && bookings.length > 0 && (
                  <span className="text-[10px] bg-[var(--violet-primary)]/20 text-[var(--violet-bright)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {bookings.length} Active
                  </span>
                )}
              </div>

              {!user ? (
                <div className="py-8 text-center space-y-4">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Sign in to view and manage your booked tickets.</p>
                  <GlowButton onClick={() => openModal('auth')} className="mx-auto text-xs py-2 px-6">
                    <LogIn className="w-3.5 h-3.5 mr-2" /> Sign In
                  </GlowButton>
                </div>
              ) : isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--violet-bright)]" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-[var(--text-secondary)] font-bold">No tickets booked yet</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Explore events in your city and secure your entry pass.</p>
                  <GlowButton onClick={() => navigate('/events')} className="mx-auto text-xs py-2 px-6 mt-3">
                    Browse Events <ArrowRight className="w-3 h-3 ml-2" />
                  </GlowButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div 
                      key={b.id}
                      onClick={() => navigate(`/events/${b.event_id}`)}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--border-glow)] hover:bg-white/10 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-3 items-center min-w-0 w-full sm:w-auto">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                          <img src={getImageUrl(b.cover_image)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{b.event_title}</h4>
                          <p className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1 mt-1 font-medium">
                            <MapPin className="w-3 h-3 text-[var(--violet-bright)]" />
                            {b.venue_name}, {b.city}
                          </p>
                          <p className="text-[10px] text-[var(--violet-bright)] font-bold mt-1">
                            {b.ticket_name} x {b.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <span className="text-[10px] font-bold text-white flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
                          {b.start_date ? new Date(b.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                        </span>
                        <span className="text-xs font-black text-[var(--violet-bright)] sm:mt-1">
                          ING-{b.booking_id?.split('-')[1] || b.id.substring(3, 9).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* 2. Saved Artist Profiles */}
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[var(--accent-pink)] fill-current" />
                  <h3 className="text-lg font-bold font-display">Saved Artists</h3>
                </div>
                {savedArtists.length > 0 && (
                  <span className="text-[10px] bg-[var(--accent-pink)]/20 text-[var(--accent-pink)] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {savedArtists.length} Saved
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--violet-bright)]" />
                </div>
              ) : savedArtists.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-[var(--text-secondary)] font-bold">No saved artists yet</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Save profiles of talent you like to check booking rates quickly.</p>
                  <GlowButton onClick={() => navigate('/artists')} className="mx-auto text-xs py-2 px-6 mt-3">
                    Browse Artists <ArrowRight className="w-3 h-3 ml-2" />
                  </GlowButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedArtists.map(artist => {
                    const avatarImg = artist.gallery_images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000';
                    return (
                      <div 
                        key={artist.id}
                        onClick={() => navigate(`/artists/${artist.id}`)}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--border-glow)] hover:bg-white/10 transition-all cursor-pointer flex gap-3 relative group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                          <img src={getImageUrl(avatarImg)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <span className="text-[8px] bg-[var(--violet-primary)] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {artist.category}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate mt-1">{artist.name}</h4>
                          <p className="text-[10px] text-[var(--violet-bright)] font-bold mt-0.5">
                            ₹{(artist.booking_price || 15000).toLocaleString()}+
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemoveSavedArtist(artist.id, e)}
                          className="absolute top-2.5 right-2.5 p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

          </div>

          {/* Side: Search History & Quick Stats */}
          <div className="space-y-6">
            
            {/* Search History */}
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--accent-cyan)]" />
                  <h3 className="text-sm font-bold font-display">Recent Searches</h3>
                </div>
                {recentSearches.length > 0 && (
                  <button 
                    onClick={handleClearSearches}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">No recent searches</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchClick(term)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[var(--text-secondary)] hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Quick Tips */}
            <GlassCard className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="text-sm font-bold font-display">Evento Tips</h3>
              </div>
              <ul className="space-y-3 text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[var(--violet-bright)]">•</span>
                  <span><strong>Saved Artists</strong>: Bookmarked artists will show their baseline pricing on this page for easier planning.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--violet-bright)]">•</span>
                  <span><strong>Active Passes</strong>: Download/Verify event tickets with their QR code directly from the event details.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--violet-bright)]">•</span>
                  <span><strong>Hire Requests</strong>: Inquiries sent directly to artists will prompt responses on your email profile.</span>
                </li>
              </ul>
            </GlassCard>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
};
