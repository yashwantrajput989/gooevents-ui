import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Music, Mic2, Star, Disc, Users, Smile, Compass, Bookmark, ArrowRight, Zap } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../../config';

const CATEGORIES = [
  { id: 'all', name: 'All Artists', icon: Compass },
  { id: 'DJ', name: 'DJs', icon: Disc },
  { id: 'Singer', name: 'Singers', icon: Music },
  { id: 'Comedian', name: 'Comedy', icon: Mic2 },
  { id: 'Band', name: 'Bands', icon: Users },
  { id: 'Dancer', name: 'Dancers', icon: Sparkles },
  { id: 'Instrumentalist', name: 'Instrumentalists', icon: Music },
  { id: 'Anchor', name: 'Anchors / MCs', icon: Smile },
];

// Static ratings for display
const ARTIST_RATINGS: Record<string, number> = {
  'comp_test_1': 4.9,
  'comp_test_2': 4.8,
  'comp_test_3': 4.7,
  'comp_neha_sharma': 4.8,
  'comp_local_train': 4.9,
  'comp_priya_dance': 4.6,
  'comp_sitar_maestro': 4.9,
  'comp_dj_blaze': 4.7,
  'comp_anchor_vikram': 4.8,
  'comp_rnb_strings': 4.8,
};

export const Artists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSaved = () => {
      try {
        const saved = localStorage.getItem('saved_artists');
        if (saved) setSavedArtistIds(JSON.parse(saved));
      } catch (e) { console.error(e); }
    };
    loadSaved();
    window.addEventListener('storage', loadSaved);
    return () => window.removeEventListener('storage', loadSaved);
  }, []);

  const toggleSaveArtist = (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('saved_artists');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(ids)) ids = [];
      ids = ids.includes(artistId) ? ids.filter((id) => id !== artistId) : [...ids, artistId];
      setSavedArtistIds(ids);
      localStorage.setItem('saved_artists', JSON.stringify(ids));
      window.dispatchEvent(new Event('storage'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/artists`);
        const data = await res.json();
        setArtists(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching artists:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(a => {
    const matchesCategory = activeCategory === 'all' || (a.category && a.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = !searchQuery ||
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.genres && a.genres.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const featuredArtist = filteredArtists[0];
  const restArtists = filteredArtists.slice(1);

  return (
    <PageWrapper className="pb-24">
      <FloatingOrb className="-top-40 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-0 right-0" color="cyan" size={300} delay={2} />

      <div className="relative z-10 space-y-6 md:space-y-10">

        {/* ── PAGE HEADER ── */}
        <header className="text-center md:text-left space-y-3 pt-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-[var(--violet-bright)] animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--violet-bright)]">Verified Talent Agency</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
            Book Premium <span className="text-gradient">Artists</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium max-w-xl mx-auto md:mx-0">
            Hire award-winning DJs, comedians, live bands, dancers & MCs directly for weddings, college fests, or concerts.
          </p>
        </header>

        {/* ── SEARCH ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:border-[var(--violet-bright)]/50 focus:bg-white/8 transition-all placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* ── CATEGORY CHIPS (horizontally scrollable) ── */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[var(--violet-primary)] border-[var(--violet-primary)] text-white shadow-glow'
                      : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LOADING SKELETON ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/5 aspect-[3/4]" />
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="py-16 text-center bg-white/3 border border-white/5 rounded-3xl space-y-3">
            <Compass className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <p className="font-bold text-white">No Artists Found</p>
            <p className="text-xs text-[var(--text-muted)] px-8">We couldn't find verified artists matching your filters.</p>
          </div>
        ) : (
          <>
            {/* ── FEATURED SPOTLIGHT (first artist) ── */}
            {featuredArtist && !searchQuery && activeCategory === 'all' && (
              <div
                onClick={() => navigate(`/artists/${featuredArtist.id}`)}
                className="relative rounded-3xl overflow-hidden cursor-pointer group border border-white/10 hover:border-[var(--border-glow)] transition-all duration-300 shadow-glow"
              >
                {/* Hero Image */}
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <img
                    src={getImageUrl(featuredArtist.gallery_images?.[0])}
                    alt={featuredArtist.name}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-0" />
                </div>

                {/* Content Panel (Glassmorphism overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 z-10">
                  <div className="glass-card bg-black/60 backdrop-blur-md border border-white/10 p-4 md:p-6 rounded-2xl space-y-2 md:space-y-3 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] bg-gradient-to-r from-amber-500 to-[var(--violet-primary)] text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                            ⭐ Featured
                          </span>
                          <span className="text-[9px] bg-white/10 text-white/90 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                            {featuredArtist.category}
                          </span>
                        </div>
                        
                        <h2 className="text-xl md:text-3xl font-display font-extrabold text-white leading-tight line-clamp-1">
                          {featuredArtist.name}
                        </h2>
                        
                        <div className="flex items-center gap-3 text-xs text-white/80 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--violet-bright)]" />
                            {featuredArtist.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {ARTIST_RATINGS[featuredArtist.id] || '4.9'}
                          </span>
                          <span className="font-extrabold text-[var(--violet-bright)]">
                            ₹{(featuredArtist.booking_price || 15000).toLocaleString()}+
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(featuredArtist.genres || []).slice(0, 3).map((g: string, i: number) => (
                            <span key={i} className="text-[9px] font-semibold bg-white/5 border border-white/5 text-white/70 px-2 py-0.5 rounded-md">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <GlowButton className="text-xs py-2.5 px-6 flex items-center gap-2 w-full md:w-auto justify-center">
                          Book Now <ArrowRight className="w-3.5 h-3.5" />
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESULTS COUNT ── */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {filteredArtists.length} Artists Available
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--violet-bright)]">
                <Zap className="w-3 h-3" /> Instant Booking
              </div>
            </div>

            {/* ── ARTIST GRID (1-col mobile, 2-col tablet, 4-col desktop) ── */}
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {restArtists.map((artist) => {
                const coverImg = getImageUrl(artist.gallery_images?.[0]);
                const rating = ARTIST_RATINGS[artist.id] || (4.5 + Math.random() * 0.5).toFixed(1);
                const isSaved = savedArtistIds.includes(artist.id);

                return (
                  <GlassCard
                    key={artist.id}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                    className="p-0 overflow-hidden cursor-pointer group hover:border-[var(--border-glow)] hover:shadow-glow transition-all duration-300"
                  >
                    {/* Cover image */}
                    <div className="relative overflow-hidden aspect-[16/10]">
                      <img
                        src={coverImg}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                      {/* Category pill */}
                      <div className="absolute top-2.5 left-2.5 z-10 bg-[var(--violet-primary)]/90 backdrop-blur-sm text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {artist.category || 'Artist'}
                      </div>

                      {/* Bookmark */}
                      <button
                        onClick={(e) => toggleSaveArtist(artist.id, e)}
                        className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                          isSaved
                            ? 'bg-[var(--accent-pink)]/20 border border-[var(--accent-pink)]/40'
                            : 'bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[var(--accent-pink)] text-[var(--accent-pink)]' : 'text-white'}`} />
                      </button>

                      {/* Rating */}
                      <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/50 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span className="text-[9px] font-bold text-white">{rating}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3 text-left">
                      <div>
                        <h3 className="text-base font-extrabold text-white leading-tight line-clamp-1 group-hover:text-[var(--violet-bright)] transition-colors">
                          {artist.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-[var(--text-secondary)]">
                          <MapPin className="w-3 h-3 text-[var(--violet-bright)] shrink-0" />
                          <span className="truncate">{artist.city}</span>
                        </div>
                      </div>

                      {/* Genre tags */}
                      {artist.genres && artist.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {artist.genres.slice(0, 2).map((g: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-semibold bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)] block">Starts from</span>
                          <p className="text-xs font-extrabold text-[var(--violet-bright)]">
                            ₹{(artist.booking_price || 15000).toLocaleString()}+
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[var(--violet-bright)] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg group-hover:bg-[var(--violet-primary)] group-hover:text-white transition-all">
                          Hire
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};
