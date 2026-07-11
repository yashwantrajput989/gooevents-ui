import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { ArrowLeft, Coffee, Sparkles, ChefHat } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../../config';

export const WeddingCatering: React.FC = () => {
  const [caterers, setCaterers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaterers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/wedding/caterers`);
        if (res.ok) {
          const data = await res.json();
          setCaterers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCaterers();
  }, []);

  return (
    <PageWrapper className="relative pb-24 pt-4">
      <FloatingOrb className="top-10 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-10 right-0" color="pink" size={300} delay={1.2} />

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
              Catering & Menus
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              Indulge your guests with exquisite multi-cuisine buffet spreads, customized live stations, and signature mocktail bars.
            </p>
          </header>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--violet-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--text-muted)] font-medium">Fetching caterers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caterers.length === 0 ? (
              <div className="col-span-full text-center py-16 text-xs text-[var(--text-secondary)] border border-white/5 bg-white/5 rounded-2xl">
                No caterers currently registered.
              </div>
            ) : (
              caterers.map((item: any) => (
                <GlassCard key={item.id} className="p-6 border-white/5 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {item.cover_image || (item.gallery_images && item.gallery_images[0]) ? (
                        <img 
                          src={getImageUrl(item.cover_image || item.gallery_images[0])} 
                          alt={item.name} 
                          className="w-24 h-24 object-cover rounded-xl border border-white/5 shrink-0" 
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-[10px] shrink-0">
                          No Cover
                        </div>
                      )}
                      
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
                          <span className="text-[8px] bg-[var(--violet-primary)]/10 text-[var(--violet-bright)] px-2 py-0.5 rounded-full font-bold uppercase border border-[var(--violet-primary)]/20 shrink-0">
                            {item.tier}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Menus Section */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--violet-bright)] flex items-center gap-1">
                          <Coffee className="w-3 h-3" /> Breakfast / Snacks
                        </span>
                        <div className="text-[10px] text-[var(--text-secondary)] space-y-1 bg-white/3 p-2 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                          {item.snacks_menu && item.snacks_menu.length > 0 ? (
                            item.snacks_menu.map((dish: string, i: number) => <div key={i} className="truncate">• {dish}</div>)
                          ) : (
                            <div className="text-[9px] text-[var(--text-muted)]">No snacks listed</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                          <ChefHat className="w-3 h-3" /> Lunch Menu
                        </span>
                        <div className="text-[10px] text-[var(--text-secondary)] space-y-1 bg-white/3 p-2 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                          {item.lunch_menu && item.lunch_menu.length > 0 ? (
                            item.lunch_menu.map((dish: string, i: number) => <div key={i} className="truncate">• {dish}</div>)
                          ) : (
                            <div className="text-[9px] text-[var(--text-muted)]">No items listed</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Dinner Menu
                        </span>
                        <div className="text-[10px] text-[var(--text-secondary)] space-y-1 bg-white/3 p-2 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                          {item.dinner_menu && item.dinner_menu.length > 0 ? (
                            item.dinner_menu.map((dish: string, i: number) => <div key={i} className="truncate">• {dish}</div>)
                          ) : (
                            <div className="text-[9px] text-[var(--text-muted)]">No items listed</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-baseline text-xs font-bold mt-2">
                    <span className="text-[var(--text-muted)]">Standard 300 Guests Cap</span>
                    <span className="text-[var(--accent-cyan)] text-sm font-black">
                      {item.price_per_plate ? `₹${item.price_per_plate}/plate` : 'Contact For Quote'}
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
