import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Music, Mic2, Star, Disc, Users, Smile, Compass } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { GlassCard } from '../../components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const CATEGORIES = [
  { id: 'all', name: 'ALL talent', icon: Compass },
  { id: 'DJ', name: 'DJs / Producers', icon: Disc },
  { id: 'Singer', name: 'Singers / Solo', icon: Music },
  { id: 'Comedian', name: 'Comedians', icon: Mic2 },
  { id: 'Band', name: 'Bands / Groups', icon: Users },
  { id: 'Dancer', name: 'Dancers / Acts', icon: Sparkles },
  { id: 'Host', name: 'Hosts / MCs', icon: Smile },
];

export const Artists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/artists`);
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
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.genres && a.genres.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageWrapper>
      <FloatingOrb className="-top-40 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-0 right-0" color="cyan" size={300} delay={2} />

      <div className="relative z-10 pb-16">
        
        {/* Header Title */}
        <header className="mb-10 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-[var(--violet-bright)] animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--violet-bright)]">Verified Talent Agency</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
            Book Premium <span className="text-gradient">Artists</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl text-sm md:text-base font-medium mx-auto md:mx-0">
            Hire award-winning DJs, stand-up comics, live acoustic bands, and MCs directly for your clubs, private shows, or large concerts.
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative max-w-xl mb-12 mx-auto md:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search artists by name, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-[var(--violet-bright)]/50 focus:bg-white/10 transition-all placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Category Strip */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-10">
          <div className="flex gap-4 min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--violet-primary)] border-[var(--violet-primary)] text-white shadow-glow'
                    : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Talent Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="py-20 text-center bg-white/3 border border-white/5 rounded-3xl space-y-2">
            <Compass className="w-12 h-12 text-[var(--text-muted)] mx-auto" />
            <p className="text-lg font-bold text-white">No Artists Found</p>
            <p className="text-sm text-[var(--text-muted)]">We couldn't find any verified artists matching your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist) => {
              const coverImg = artist.gallery_images?.[0] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000';
              return (
                <GlassCard 
                  key={artist.id}
                  onClick={() => navigate(`/artists/${artist.id}`)}
                  className="p-0 overflow-hidden cursor-pointer flex flex-col justify-between group hover:border-[var(--border-glow)] hover:shadow-glow duration-300"
                >
                  <div className="relative aspect-[4/4] overflow-hidden">
                    <img 
                      src={coverImg} 
                      alt={artist.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    
                    {/* Category Overlay */}
                    <div className="absolute top-4 left-4 z-10 bg-[var(--violet-primary)] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {artist.category || 'Talent'}
                    </div>

                    {/* Rating Overlay */}
                    <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 text-[var(--violet-glow)] fill-[var(--violet-glow)]" />
                      <span className="text-[10px] font-bold text-white">4.9</span>
                    </div>

                    {/* Stage Name / Location in overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1">
                      <h3 className="text-lg font-display font-extrabold group-hover:text-[var(--violet-bright)] transition-colors leading-tight line-clamp-1">
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-white/80 font-medium">
                        <MapPin className="w-3 h-3 text-[var(--violet-bright)]" />
                        <span>{artist.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Booking Quote Details */}
                  <div className="p-5 bg-[var(--bg-card)] border-t border-white/5 space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {artist.genres && artist.genres.slice(0, 3).map((g: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-semibold bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded-md">
                          {g}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Hire Rate</p>
                        <p className="text-sm font-extrabold text-[var(--violet-bright)]">₹{(artist.booking_price || 15000).toLocaleString()}+</p>
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-[var(--violet-bright)] transition-colors flex items-center gap-1">
                        View Profile &rarr;
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};
