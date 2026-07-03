import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Users, Coffee, Music, Paintbrush, Mic, CheckCircle, 
  ChevronRight, X, Award, Star, List, Sparkles 
} from 'lucide-react';

export const WeddingPlanner: React.FC = () => {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();

  // Navigation / Funnel State
  const [funnelTier, setFunnelTier] = useState<'Silver' | 'Gold' | 'Platinum' | null>(null);
  const [funnelStep, setFunnelStep] = useState<number>(0); // 0 = Landing, 1-6 = Customization steps
  const [inventory, setInventory] = useState<any>({
    venues: [], caterers: [], bands: [], artists: [], decors: [], lights: []
  });
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);

  // Standalone/A La Carte Modals
  const [activeAlaCarteTab, setActiveAlaCarteTab] = useState<'catering' | 'venues' | 'decors' | 'artists' | null>(null);
  const [alaCarteItems, setAlaCarteItems] = useState<any[]>([]);
  const [isAlaCarteLoading, setIsAlaCarteLoading] = useState<boolean>(false);

  // Consultant Booking Modal State
  const [isConsultantModalOpen, setIsConsultantModalOpen] = useState<boolean>(false);
  const [consultantForm, setConsultantForm] = useState({
    name: '', email: '', phone: '', date: '', budget: '₹5,000,000+', notes: ''
  });
  const [isConsultantSubmitting, setIsConsultantSubmitting] = useState<boolean>(false);

  // Funnel Selections
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedCaterer, setSelectedCaterer] = useState<any>(null);
  const [catererMenus, setCatererMenus] = useState<{ lunch: string[], dinner: string[], snacks: string[] }>({
    lunch: [], dinner: [], snacks: []
  });
  const [selectedBand, setSelectedBand] = useState<any>(null);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedDecor, setSelectedDecor] = useState<any>(null);
  const [selectedLights, setSelectedLights] = useState<any>(null);
  const [weddingDate, setWeddingDate] = useState<string>('');
  
  // Checkout / Status State
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Load A La Carte items
  const openAlaCarte = async (type: 'catering' | 'venues' | 'decors' | 'artists') => {
    setActiveAlaCarteTab(type);
    setIsAlaCarteLoading(true);
    try {
      let endpoint = '';
      if (type === 'catering') endpoint = `${API_BASE_URL}/admin/wedding/caterers`;
      else if (type === 'venues') endpoint = `${API_BASE_URL}/admin/wedding/venues`;
      else if (type === 'decors') endpoint = `${API_BASE_URL}/admin/wedding/decors`;
      else if (type === 'artists') endpoint = `${API_BASE_URL}/artists`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setAlaCarteItems(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAlaCarteLoading(false);
    }
  };

  // Launch Tier Customization Funnel
  const startFunnel = async (tier: 'Silver' | 'Gold' | 'Platinum') => {
    setFunnelTier(tier);
    setIsLoadingInventory(true);
    setFunnelStep(1);
    
    // Clear selections
    setSelectedVenue(null);
    setSelectedCaterer(null);
    setCatererMenus({ lunch: [], dinner: [], snacks: [] });
    setSelectedBand(null);
    setSelectedArtist(null);
    setSelectedDecor(null);
    setSelectedLights(null);
    setWeddingDate('');

    try {
      const res = await fetch(`${API_BASE_URL}/wedding/inventory?tier=${tier}`);
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Submit Consultant Booking
  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultantSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wedding/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: consultantForm.name,
          email: consultantForm.email,
          phone: consultantForm.phone,
          wedding_date: consultantForm.date,
          estimated_budget: consultantForm.budget,
          notes: consultantForm.notes
        })
      });
      if (res.ok) {
        alert('Your Wedding Consultant request has been successfully submitted! A specialist will contact you within 24 hours.');
        setIsConsultantModalOpen(false);
        setConsultantForm({ name: '', email: '', phone: '', date: '', budget: '₹5,000,000+', notes: '' });
      } else {
        alert('Failed to schedule. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error.');
    } finally {
      setIsConsultantSubmitting(false);
    }
  };

  // Submit Wedding Booking
  const handleCheckoutSubmit = async () => {
    if (!user) {
      openModal('auth');
      return;
    }
    if (!weddingDate) {
      alert('Please select a wedding date.');
      return;
    }
    setIsBookingSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wedding/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          package_tier: funnelTier,
          venue_id: selectedVenue.id,
          caterer_id: selectedCaterer.id,
          lunch_menu: catererMenus.lunch,
          dinner_menu: catererMenus.dinner,
          snacks_menu: catererMenus.snacks,
          band_id: selectedBand.id,
          artist_id: selectedArtist.id,
          decor_id: selectedDecor.id,
          lights_id: selectedLights.id,
          total_price: calculateTotalCost(),
          booking_date: weddingDate
        })
      });
      if (res.ok) {
        setBookingConfirmed(true);
      } else {
        alert('Booking submission failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Pricing Calculation
  const calculateTotalCost = () => {
    if (!funnelTier) return 0;
    const venuePrice = selectedVenue?.price || 0;
    const cateringPrice = (selectedCaterer?.price_per_plate || 0) * 300; // Venue capacity 300 standard guests
    const bandPrice = selectedBand?.booking_price || 0;
    const artistPrice = selectedArtist?.booking_price || 0;
    const decorPrice = selectedDecor?.price || 0;
    const lightsPrice = selectedLights?.price || 0;

    return venuePrice + cateringPrice + bandPrice + artistPrice + decorPrice + lightsPrice;
  };

  return (
    <PageWrapper className="relative pb-24 pt-4">
      <FloatingOrb className="top-0 -left-20" color="violet" size={500} />
      <FloatingOrb className="bottom-0 right-0" color="cyan" size={400} delay={1.5} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 space-y-10">
        
        {/* Landing View (funnelStep === 0) */}
        {funnelStep === 0 && (
          <>
            <header className="text-center space-y-3 max-w-3xl mx-auto pt-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-pink)] bg-[var(--accent-pink)]/10 px-3 py-1 rounded-full border border-[var(--accent-pink)]/20 inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-[var(--accent-pink)]" /> Premium Event Management
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white leading-tight">
                Plan Your Wedding
              </h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)]">
                Design the celebration of your dreams. Select a curated, all-inclusive luxury package or browse stand-alone services customized to perfection.
              </p>
            </header>

            {/* ━━━ SECTION 1: BUNDLED PACKAGES ━━━ */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Sparkles className="w-5 h-5 text-[var(--violet-bright)]" />
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Bundled All-In-One Packages</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Silver Plan */}
                <GlassCard className="p-6 flex flex-col justify-between border-slate-600/30 hover:border-slate-400/50 hover:shadow-[0_0_25px_rgba(203,213,225,0.15)] transition-all group relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-slate-500/20 text-slate-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Silver Package</span>
                      <Award className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Classic Elegance</h3>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Beautiful essential features for a standard wedding. Complete with local venue, catering & light-sound layout.
                    </p>
                    <ul className="text-[10px] text-[var(--text-secondary)] space-y-2 border-t border-white/5 pt-3.5">
                      <li>✓ Convention Hall (300 Cap)</li>
                      <li>✓ Silver Catering (Lunch/Dinner/Snacks)</li>
                      <li>✓ 1 Live Band & 1 Featured Artist</li>
                      <li>✓ Elegant Stage Decor & Lighting</li>
                    </ul>
                  </div>
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-[var(--text-muted)] font-medium">Estimated Pricing starting at:</p>
                    <p className="text-2xl font-black text-white">₹3,40,000 <span className="text-xs font-normal text-[var(--text-muted)]">all-in</span></p>
                    <GlowButton onClick={() => startFunnel('Silver')} className="w-full py-2.5 text-xs font-bold uppercase tracking-wider">
                      Select Silver
                    </GlowButton>
                  </div>
                </GlassCard>

                {/* Gold Plan */}
                <GlassCard className="p-6 flex flex-col justify-between border-amber-600/30 hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all group relative overflow-hidden bg-gradient-to-b from-amber-500/5 to-transparent">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Gold Package</span>
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Royal Crest</h3>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Elevate your celebration with elite venues, royal multi-cuisine spreads and high-power live music acts.
                    </p>
                    <ul className="text-[10px] text-[var(--text-secondary)] space-y-2 border-t border-white/5 pt-3.5">
                      <li>✓ Premium Banquet Hall</li>
                      <li>✓ Gold Royal Catering Menu</li>
                      <li>✓ Sufi Fusion Band & DJ</li>
                      <li>✓ Intricate Floral Mandap Decor</li>
                    </ul>
                  </div>
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-[var(--text-muted)] font-medium">Estimated Pricing starting at:</p>
                    <p className="text-2xl font-black text-white">₹7,80,000 <span className="text-xs font-normal text-[var(--text-muted)]">all-in</span></p>
                    <GlowButton onClick={() => startFunnel('Gold')} className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600">
                      Select Gold
                    </GlowButton>
                  </div>
                </GlassCard>

                {/* Platinum Plan */}
                <GlassCard className="p-6 flex flex-col justify-between border-[var(--violet-primary)]/40 hover:border-[var(--violet-bright)]/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all group relative overflow-hidden bg-gradient-to-b from-[var(--violet-primary)]/10 to-transparent">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--violet-primary)]/20 blur-xl rounded-full" />
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-[var(--violet-primary)] text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">Platinum Package</span>
                      <Sparkles className="w-5 h-5 text-[var(--violet-bright)] animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Grand Imperial</h3>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Our most luxurious experience. Palace estate venues, gourmet signature catering, stadium-level sound & pixel mapping.
                    </p>
                    <ul className="text-[10px] text-[var(--text-secondary)] space-y-2 border-t border-white/5 pt-3.5">
                      <li>✓ Palace Estate / Grand Resort</li>
                      <li>✓ Luxury Gourmet Catering spread</li>
                      <li>✓ Elite Symphony Band & DJ combo</li>
                      <li>✓ Crystal Chandelier Glass Stage Decor</li>
                    </ul>
                  </div>
                  <div className="mt-6 space-y-3 relative z-10">
                    <p className="text-xs text-[var(--text-muted)] font-medium">Estimated Pricing starting at:</p>
                    <p className="text-2xl font-black text-white">₹14,90,000 <span className="text-xs font-normal text-[var(--text-muted)]">all-in</span></p>
                    <GlowButton onClick={() => startFunnel('Platinum')} className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--violet-primary)] hover:bg-[var(--violet-bright)]">
                      Select Platinum
                    </GlowButton>
                  </div>
                </GlassCard>

                {/* Custom Plan */}
                <GlassCard className="p-6 flex flex-col justify-between border-pink-500/20 hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] transition-all group relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-pink-500/10 text-pink-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Custom Plan</span>
                      <Users className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Personal Consultant</h3>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Build your dream wedding from scratch. Speak directly to our wedding specialist to book customized details.
                    </p>
                    <ul className="text-[10px] text-[var(--text-secondary)] space-y-2 border-t border-white/5 pt-3.5">
                      <li>✓ Dedicated wedding planner manager</li>
                      <li>✓ Access to elite exclusive networks</li>
                      <li>✓ Complete custom budgeting limits</li>
                      <li>✓ Custom checklists and schedule</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <GlowButton onClick={() => setIsConsultantModalOpen(true)} className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-pink-500 hover:bg-pink-600">
                      Book Wedding Consultant
                    </GlowButton>
                  </div>
                </GlassCard>

              </div>
            </section>

            {/* ━━━ SECTION 2: STANDALONE SERVICES ━━━ */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <List className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">A La Carte / Standalone Services</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Standalone Venues */}
                <GlassCard onClick={() => openAlaCarte('venues')} className="p-5 text-center space-y-3 cursor-pointer hover:bg-white/5 border-white/5 hover:border-cyan-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Convention & Venues</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Rent premium wedding halls, open-air lawns, and palaces.</p>
                </GlassCard>

                {/* Standalone Catering */}
                <GlassCard onClick={() => openAlaCarte('catering')} className="p-5 text-center space-y-3 cursor-pointer hover:bg-white/5 border-white/5 hover:border-violet-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto text-[var(--violet-bright)] group-hover:scale-110 transition-transform">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Catering & Menus</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Select professional caterers and customize dining menus.</p>
                </GlassCard>

                {/* Standalone Decor */}
                <GlassCard onClick={() => openAlaCarte('decors')} className="p-5 text-center space-y-3 cursor-pointer hover:bg-white/5 border-white/5 hover:border-pink-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mx-auto text-pink-400 group-hover:scale-110 transition-transform">
                    <Paintbrush className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Decorations & Themes</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Choose themed floral mandaps, stages, and canopy decors.</p>
                </GlassCard>

                {/* Standalone Artists */}
                <GlassCard onClick={() => openAlaCarte('artists')} className="p-5 text-center space-y-3 cursor-pointer hover:bg-white/5 border-white/5 hover:border-amber-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                    <Music className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Music & Performers</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Book professional live bands, DJs, and playback singers.</p>
                </GlassCard>

              </div>
            </section>
          </>
        )}

        {/* Funnel Step-by-Step Customization (funnelStep > 0 && funnelStep <= 6) */}
        {funnelStep > 0 && funnelStep <= 6 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
              {[
                { s: 1, label: 'Venues' },
                { s: 2, label: 'Catering' },
                { s: 3, label: 'Music' },
                { s: 4, label: 'Decor' },
                { s: 5, label: 'Production' },
                { s: 6, label: 'Summary' },
              ].map((stepItem) => (
                <div key={stepItem.s} className="flex items-center gap-1.5 md:gap-3 flex-1 last:flex-none">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm border transition-all ${
                    funnelStep === stepItem.s 
                      ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)] text-white shadow-glow' 
                      : funnelStep > stepItem.s 
                        ? 'border-green-500 bg-green-500/20 text-green-500' 
                        : 'border-white/10 text-white/40'
                  }`}>
                    {funnelStep > stepItem.s ? <CheckCircle className="w-4 h-4" /> : stepItem.s}
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold hidden md:inline ${funnelStep === stepItem.s ? 'text-white' : 'text-white/40'}`}>
                    {stepItem.label}
                  </span>
                  {stepItem.s < 6 && <div className="h-0.5 bg-white/10 flex-1 hidden md:block" />}
                </div>
              ))}
            </div>

            {/* Step Container */}
            <GlassCard className="p-6 md:p-8 space-y-6 border-[var(--violet-primary)]/20">
              
              {isLoadingInventory ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[var(--violet-bright)] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[var(--text-muted)] font-medium">Filtering {funnelTier} inventory items...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: VENUES */}
                  {funnelStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[var(--violet-bright)] uppercase tracking-wider">{funnelTier} package</span>
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Select Convention Center / Venue</h2>
                        <p className="text-xs text-[var(--text-muted)]">Includes a minimum 300 pax capacity matching your package tier.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventory.venues?.map((v: any) => (
                          <div 
                            key={v.id}
                            onClick={() => setSelectedVenue(v)}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                              selectedVenue?.id === v.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <img src={getImageUrl(v.cover_image)} alt="" className="w-full h-40 object-cover" />
                            <div className="p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white text-sm">{v.name}</h3>
                                <span className="text-[9px] bg-white/5 text-[var(--text-secondary)] font-bold px-1.5 py-0.5 rounded">{v.tier}</span>
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] truncate">{v.description}</p>
                              <div className="flex justify-between text-[10px] font-bold pt-2 border-t border-white/5">
                                <span className="text-[var(--text-muted)]">Capacity: {v.capacity} pax</span>
                                <span className="text-[var(--violet-bright)]">₹{v.price?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-white/5">
                        <GlowButton 
                          onClick={() => {
                            if (!selectedVenue) {
                              alert('Please select a venue.');
                              return;
                            }
                            setFunnelStep(2);
                          }}
                          className="px-8 py-3.5 text-xs uppercase"
                        >
                          Next: Caterers & Menu <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: CATERERS & MENUS */}
                  {funnelStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Select Caterer & Customize Menu</h2>
                        <p className="text-xs text-[var(--text-muted)]">Customize your breakfast, lunch, and dinner menus.</p>
                      </div>

                      {/* Select Caterer */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventory.caterers?.map((c: any) => (
                          <div 
                            key={c.id}
                            onClick={() => {
                              setSelectedCaterer(c);
                              setCatererMenus({
                                lunch: c.lunch_menu || [],
                                dinner: c.dinner_menu || [],
                                snacks: c.snacks_menu || []
                              });
                            }}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all flex gap-4 p-3 ${
                              selectedCaterer?.id === c.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <img src={getImageUrl(c.cover_image)} alt="" className="w-20 h-20 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="font-bold text-white text-xs truncate">{c.name}</h4>
                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{c.description}</p>
                              <p className="text-[10px] text-[var(--violet-bright)] font-bold">₹{c.price_per_plate} / Plate</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedCaterer && (
                        <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Customize Dishes</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Lunch */}
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold text-cyan-400">Lunch Menu</h4>
                              <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                                {selectedCaterer.lunch_menu?.map((dish: string) => (
                                  <label key={dish} className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-medium cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={catererMenus.lunch.includes(dish)} 
                                      onChange={(e) => {
                                        if (e.target.checked) setCatererMenus(prev => ({ ...prev, lunch: [...prev.lunch, dish] }));
                                        else setCatererMenus(prev => ({ ...prev, lunch: prev.lunch.filter(d => d !== dish) }));
                                      }}
                                      className="rounded bg-white/5 border-white/10 text-[var(--violet-bright)] outline-none"
                                    />
                                    {dish}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Dinner */}
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold text-[var(--violet-bright)]">Dinner Menu</h4>
                              <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                                {selectedCaterer.dinner_menu?.map((dish: string) => (
                                  <label key={dish} className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-medium cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={catererMenus.dinner.includes(dish)} 
                                      onChange={(e) => {
                                        if (e.target.checked) setCatererMenus(prev => ({ ...prev, dinner: [...prev.dinner, dish] }));
                                        else setCatererMenus(prev => ({ ...prev, dinner: prev.dinner.filter(d => d !== dish) }));
                                      }}
                                      className="rounded bg-white/5 border-white/10 text-[var(--violet-bright)] outline-none"
                                    />
                                    {dish}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Snacks */}
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-bold text-pink-400">Snacks & Beverages</h4>
                              <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                                {selectedCaterer.snacks_menu?.map((dish: string) => (
                                  <label key={dish} className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-medium cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={catererMenus.snacks.includes(dish)} 
                                      onChange={(e) => {
                                        if (e.target.checked) setCatererMenus(prev => ({ ...prev, snacks: [...prev.snacks, dish] }));
                                        else setCatererMenus(prev => ({ ...prev, snacks: prev.snacks.filter(d => d !== dish) }));
                                      }}
                                      className="rounded bg-white/5 border-white/10 text-[var(--violet-bright)] outline-none"
                                    />
                                    {dish}
                                  </label>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <button onClick={() => setFunnelStep(1)} className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={() => {
                            if (!selectedCaterer) {
                              alert('Please select a caterer.');
                              return;
                            }
                            setFunnelStep(3);
                          }}
                          className="px-8 py-3.5 text-xs uppercase"
                        >
                          Next: Live Band & Artists <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: ARTISTS & BANDS */}
                  {funnelStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Select Live Band and Featured Artist</h2>
                        <p className="text-xs text-[var(--text-muted)]">Includes 1 Live Band performance and 1 Featured Artist / DJ from your package tier.</p>
                      </div>

                      {/* Select Live Band */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Live Band:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inventory.bands?.map((b: any) => (
                            <div 
                              key={b.id}
                              onClick={() => setSelectedBand(b)}
                              className={`rounded-2xl border flex gap-4 p-3 cursor-pointer transition-all ${
                                selectedBand?.id === b.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                              }`}
                            >
                              <img src={getImageUrl(b.gallery_images[0])} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h4 className="font-bold text-white text-xs truncate">{b.name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{b.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select Artist / DJ */}
                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Featured Artist or DJ:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inventory.artists?.map((a: any) => (
                            <div 
                              key={a.id}
                              onClick={() => setSelectedArtist(a)}
                              className={`rounded-2xl border flex gap-4 p-3 cursor-pointer transition-all ${
                                selectedArtist?.id === a.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                              }`}
                            >
                              <img src={getImageUrl(a.gallery_images[0])} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h4 className="font-bold text-white text-xs truncate">{a.name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{a.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <button onClick={() => setFunnelStep(2)} className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={() => {
                            if (!selectedBand || !selectedArtist) {
                              alert('Please select both a Live Band and a Featured Artist.');
                              return;
                            }
                            setFunnelStep(4);
                          }}
                          className="px-8 py-3.5 text-xs uppercase"
                        >
                          Next: Decor & Layout <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: DECOR & LAYOUT */}
                  {funnelStep === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Select Decor Theme & Layout</h2>
                        <p className="text-xs text-[var(--text-muted)]">Includes tents, flower arrangements, drapes, and dining setups.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {inventory.decors?.map((d: any) => (
                          <div 
                            key={d.id}
                            onClick={() => setSelectedDecor(d)}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                              selectedDecor?.id === d.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <img src={getImageUrl(d.cover_image)} alt="" className="w-full h-40 object-cover" />
                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-white text-sm">{d.name}</h4>
                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{d.description}</p>
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {d.themes?.map((t: string) => (
                                  <span key={t} className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-[var(--text-secondary)]">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <button onClick={() => setFunnelStep(3)} className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={() => {
                            if (!selectedDecor) {
                              alert('Please select a decor setup.');
                              return;
                            }
                            setFunnelStep(5);
                          }}
                          className="px-8 py-3.5 text-xs uppercase"
                        >
                          Next: Lights & Audio <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: LIGHTS & AUDIO */}
                  {funnelStep === 5 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Select Lights & Sound Setup</h2>
                        <p className="text-xs text-[var(--text-muted)]">Includes professional amplifiers, speakers, moving heads, stage wash, and wireless systems.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {inventory.lights?.map((l: any) => (
                          <div 
                            key={l.id}
                            onClick={() => setSelectedLights(l)}
                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                              selectedLights?.id === l.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <img src={getImageUrl(l.cover_image)} alt="" className="w-full h-40 object-cover" />
                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-white text-sm">{l.name}</h4>
                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{l.description}</p>
                              <ul className="text-[9px] text-[var(--text-secondary)] space-y-1 pt-2 border-t border-white/5">
                                {l.equipment?.map((eq: string, index: number) => (
                                  <li key={index}>• {eq}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-4 border-t border-white/5">
                        <button onClick={() => setFunnelStep(4)} className="px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={() => {
                            if (!selectedLights) {
                              alert('Please select a production setup.');
                              return;
                            }
                            setFunnelStep(6);
                          }}
                          className="px-8 py-3.5 text-xs uppercase"
                        >
                          Next: Review & Summary <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 6: SUMMARY & CHECKOUT */}
                  {funnelStep === 6 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      
                      {!bookingConfirmed ? (
                        <>
                          <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-display font-extrabold text-white">Wedding Plan Review & Invoice</h2>
                            <p className="text-xs text-[var(--text-muted)]">Review details of your {funnelTier} package selection before finalizing.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Selected Package Specs */}
                            <div className="space-y-4">
                              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Plan Details</h3>
                              
                              <div className="space-y-3.5">
                                
                                {/* Venue Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                                    <Users className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Convention Center</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedVenue?.name}</p>
                                  </div>
                                </div>

                                {/* Caterer Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-[var(--violet-bright)] shrink-0">
                                    <Coffee className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Catering Spreads</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedCaterer?.name} (₹{selectedCaterer?.price_per_plate}/plate)</p>
                                  </div>
                                </div>

                                {/* Band Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                    <Music className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Live Band performance</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedBand?.name}</p>
                                  </div>
                                </div>

                                {/* Artist Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                                    <Mic className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Featured Artist / DJ</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedArtist?.name}</p>
                                  </div>
                                </div>

                                {/* Decor Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                                    <Paintbrush className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Theme & Decor Layout</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedDecor?.name}</p>
                                  </div>
                                </div>

                                {/* Sound Item */}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Heart className="w-4.5 h-4.5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--text-muted)] leading-tight">Sound & Light Production</p>
                                    <p className="text-xs font-bold text-white leading-normal mt-0.5">{selectedLights?.name}</p>
                                  </div>
                                </div>

                              </div>

                              <div className="space-y-1.5 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Select Wedding Date</label>
                                <input 
                                  type="date" 
                                  required
                                  value={weddingDate}
                                  onChange={(e) => setWeddingDate(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                                />
                              </div>
                            </div>

                            {/* Itemized invoice receipt */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                              <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Itemized Invoice</h3>
                                
                                <div className="space-y-3 pt-3 text-[11px] text-[var(--text-secondary)]">
                                  <div className="flex justify-between">
                                    <span>Venue Rentals:</span>
                                    <span className="font-bold text-white">₹{selectedVenue?.price?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Catering (300 guests x ₹{selectedCaterer?.price_per_plate}):</span>
                                    <span className="font-bold text-white">₹{((selectedCaterer?.price_per_plate || 0) * 300).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Live Band booking:</span>
                                    <span className="font-bold text-white">₹{selectedBand?.booking_price?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Featured Artist/DJ booking:</span>
                                    <span className="font-bold text-white">₹{selectedArtist?.booking_price?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Themes & Decor Canopy:</span>
                                    <span className="font-bold text-white">₹{selectedDecor?.price?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Stage Production & Lighting:</span>
                                    <span className="font-bold text-white">₹{selectedLights?.price?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-white/5 pt-4 mt-6">
                                <div className="flex justify-between items-baseline mb-4">
                                  <span className="text-xs font-bold text-white">Total Booking Cost:</span>
                                  <span className="text-2xl font-black text-transparent bg-clip-text bg-[image:var(--gradient-hero)]">₹{calculateTotalCost().toLocaleString()}</span>
                                </div>
                                
                                <GlowButton 
                                  onClick={handleCheckoutSubmit}
                                  isLoading={isBookingSubmitting}
                                  className="w-full py-3.5 text-xs font-bold uppercase tracking-wider"
                                >
                                  Confirm & Book Package
                                </GlowButton>
                              </div>
                            </div>

                          </div>

                          <div className="flex justify-start pt-2">
                            <button onClick={() => setFunnelStep(5)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
                              Back
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 space-y-6">
                          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <CheckCircle className="w-10 h-10" />
                          </div>
                          
                          <div className="space-y-2">
                            <h2 className="text-3xl font-display font-black text-white">Wedding Package Booked!</h2>
                            <p className="text-xs text-[var(--text-secondary)] font-medium max-w-md mx-auto">
                              Congratulations! Your {funnelTier} wedding package has been successfully reserved on {weddingDate}. Our primary planner will call you shortly.
                            </p>
                          </div>

                          <GlowButton onClick={() => setFunnelStep(0)} className="py-3 px-8 text-xs">
                            Return to Wedding Landing
                          </GlowButton>
                        </div>
                      )}

                    </motion.div>
                  )}

                </AnimatePresence>
              )}

            </GlassCard>
          </div>
        )}

      </div>

      {/* ━━━ CONSULTANT BOOKING MODAL (FOR CUSTOM PLAN) ━━━ */}
      <AnimatePresence>
        {isConsultantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsConsultantModalOpen(false)} />
            
            <GlassCard className="relative z-10 w-full max-w-md p-6 md:p-8 space-y-5 border-[var(--violet-primary)]/20 shadow-2xl rounded-2xl">
              <button onClick={() => setIsConsultantModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <Users className="w-10 h-10 text-pink-500 mx-auto" />
                <h3 className="text-xl font-display font-extrabold text-white">Book Wedding Consultant</h3>
                <p className="text-xs text-[var(--text-secondary)]">Personalized expert consultation to outline your bespoke event setup.</p>
              </div>

              <form onSubmit={handleConsultantSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={consultantForm.name}
                    onChange={(e) => setConsultantForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Yashwant Rajput" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={consultantForm.email}
                      onChange={(e) => setConsultantForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. name@mail.com" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={consultantForm.phone}
                      onChange={(e) => setConsultantForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 9876543210" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Wedding Date</label>
                    <input 
                      type="date" 
                      required 
                      value={consultantForm.date}
                      onChange={(e) => setConsultantForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Estimated Budget</label>
                    <select 
                      value={consultantForm.budget}
                      onChange={(e) => setConsultantForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white"
                    >
                      <option value="₹1,500,000 - ₹3,000,000">₹15L - ₹30L</option>
                      <option value="₹3,000,000 - ₹5,000,000">₹30L - ₹50L</option>
                      <option value="₹5,000,000+">₹50L+</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Special Requests / Notes</label>
                  <textarea 
                    rows={3} 
                    value={consultantForm.notes}
                    onChange={(e) => setConsultantForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Mention custom details, decor plans, location priorities..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-pink-500 text-xs text-white resize-none" 
                  />
                </div>

                <GlowButton type="submit" isLoading={isConsultantSubmitting} className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-xs font-bold uppercase tracking-wider">
                  Request Consultation Call
                </GlowButton>
              </form>
            </GlassCard>
          </div>
        )}
      </AnimatePresence>

      {/* ━━━ A LA CARTE STANDALONE MODALS ━━━ */}
      <AnimatePresence>
        {activeAlaCarteTab !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setActiveAlaCarteTab(null)} />
            
            <GlassCard className="relative z-10 w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 border-cyan-500/20 shadow-2xl rounded-2xl scrollbar-none">
              <button onClick={() => setActiveAlaCarteTab(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-display font-extrabold text-white capitalize">
                  Browse {activeAlaCarteTab}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">Standalone event service inventory browsing directory.</p>
              </div>

              {isAlaCarteLoading ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[var(--text-muted)] font-medium">Fetching details...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {alaCarteItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-xs text-[var(--text-secondary)] border border-white/5 bg-white/5 rounded-2xl">
                      No standalone items registered in this category.
                    </div>
                  ) : (
                    alaCarteItems.map((item: any) => (
                      <GlassCard key={item.id} className="p-4 border-white/5 space-y-3">
                        {item.cover_image || (item.gallery_images && item.gallery_images[0]) ? (
                          <img 
                            src={getImageUrl(item.cover_image || item.gallery_images[0])} 
                            alt="" 
                            className="w-full h-36 object-cover rounded-xl" 
                          />
                        ) : (
                          <div className="w-full h-36 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-[10px]">No Cover</div>
                        )}
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                            <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">{item.tier}</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                        </div>

                        <div className="flex justify-between items-baseline pt-2 border-t border-white/5 text-[10px] font-bold">
                          <span className="text-[var(--text-muted)]">
                            {item.capacity ? `Capacity: ${item.capacity} Pax` : activeAlaCarteTab === 'catering' ? 'Catering' : activeAlaCarteTab === 'decors' ? 'Theme Decor' : item.category || 'Artist'}
                          </span>
                          <span className="text-cyan-400">
                            {item.price_per_plate ? `₹${item.price_per_plate}/plate` : item.price ? `₹${item.price?.toLocaleString()}` : item.booking_price ? `₹${item.booking_price?.toLocaleString()}` : 'Contact For Quote'}
                          </span>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
};
