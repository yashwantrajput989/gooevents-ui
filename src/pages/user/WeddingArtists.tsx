import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { ArrowLeft, Music, Star } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../../config';

export const WeddingArtists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/artists`);
        if (res.ok) {
          const data = await res.json();
          setArtists(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  return (
    <PageWrapper className="relative pb-24 pt-4">
      <FloatingOrb className="top-10 -left-20" color="cyan" size={400} />
      <FloatingOrb className="bottom-10 right-0" color="violet" size={300} delay={1.1} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/wedding')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--violet-bright)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Wedding Planner
          </button>

          <header className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-display font-black text-white leading-tight">
              Music & Performers
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              Book professional live bands, Sufi ensembles, premium DJs, and charming anchors/MCs to bring life to your wedding stages.
            </p>
          </header>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--violet-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--text-muted)] font-medium">Fetching wedding performers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.length === 0 ? (
              <div className="col-span-full text-center py-16 text-xs text-[var(--text-secondary)] border border-white/5 bg-white/5 rounded-2xl">
                No artists currently registered.
              </div>
            ) : (
              artists.map((item: any) => (
                <GlassCard key={item.id} className="p-4 border-white/5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {item.gallery_images && item.gallery_images[0] ? (
                      <img 
                        src={getImageUrl(item.gallery_images[0])} 
                        alt={item.name} 
                        className="w-full h-44 object-cover rounded-xl border border-white/5" 
                      />
                    ) : (
                      <div className="w-full h-44 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-xs">
                        No Profile Image
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                        <span className="text-[9px] bg-[var(--violet-primary)]/10 text-[var(--violet-bright)] px-2 py-0.5 rounded-full font-bold uppercase border border-[var(--violet-primary)]/20 shrink-0">
                          {item.category || 'Performer'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-baseline text-xs font-bold">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {item.genres && item.genres.length > 0 ? item.genres.slice(0, 2).join(' / ') : 'Verified Artist'}
                    </span>
                    <span className="text-[var(--accent-cyan)] text-sm font-black">
                      {item.booking_price ? `₹${item.booking_price.toLocaleString()}` : 'Contact For Quote'}
                    </span>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};
