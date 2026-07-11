import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { ArrowLeft, Users, MapPin } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../../config';

export const WeddingVenues: React.FC = () => {
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/wedding/venues`);
        if (res.ok) {
          const data = await res.json();
          setVenues(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <PageWrapper className="relative pb-24 pt-4">
      <FloatingOrb className="top-10 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-10 right-0" color="cyan" size={300} delay={1} />

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
              Convention Centers & Venues
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              Rent premium wedding halls, open-air lawns, resorts, and heritage palaces tailored for your grand celebration.
            </p>
          </header>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--violet-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--text-muted)] font-medium">Fetching premium venues...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.length === 0 ? (
              <div className="col-span-full text-center py-16 text-xs text-[var(--text-secondary)] border border-white/5 bg-white/5 rounded-2xl">
                No venues currently registered.
              </div>
            ) : (
              venues.map((item: any) => (
                <GlassCard key={item.id} className="p-4 border-white/5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {item.cover_image || (item.gallery_images && item.gallery_images[0]) ? (
                      <img 
                        src={getImageUrl(item.cover_image || item.gallery_images[0])} 
                        alt={item.name} 
                        className="w-full h-44 object-cover rounded-xl border border-white/5" 
                      />
                    ) : (
                      <div className="w-full h-44 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-xs">
                        No Cover Image Available
                      </div>
                    )}
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                        <span className="text-[9px] bg-[var(--violet-primary)]/10 text-[var(--violet-bright)] px-2 py-0.5 rounded-full font-bold uppercase border border-[var(--violet-primary)]/20 shrink-0">
                          {item.tier}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/5">
                    {item.location && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--violet-bright)]" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[var(--violet-bright)]" />
                        Capacity: {item.capacity ? `${item.capacity} Pax` : 'N/A'}
                      </span>
                      <span className="text-[var(--accent-cyan)] text-sm font-black">
                        {item.price ? `₹${item.price.toLocaleString()}` : 'Contact For Quote'}
                      </span>
                    </div>
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
