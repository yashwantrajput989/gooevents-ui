import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/locationStore';
import { useUIStore } from '../../store/uiStore';
import { getImageUrl } from '../../config';
import { BookingModal } from '../../components/events/BookingModal';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MapPin, Star, ShieldAlert, Award
} from 'lucide-react';

export const OpenMics: React.FC = () => {
  const { user } = useAuthStore();
  const { city: activeCity } = useLocationStore();
  const { openModal } = useUIStore();
  const navigate = useNavigate();

  const [openMicEvents, setOpenMicEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Booking modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Emerging Talent Board state (mocked for premium look)
  const talents = [
    { id: '1', name: 'Kabir Mehta', category: 'Standup', rating: 4.8, city: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200', instruments: ['Acoustic Guitar'] },
    { id: '2', name: 'Riya Sen', category: 'Singer', rating: 4.9, city: 'Visakhapatnam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200', instruments: ['Vocals', 'Piano'] },
    { id: '3', name: 'Aman Preet', category: 'Poetry', rating: 4.7, city: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200', instruments: ['Spoken Word'] },
    { id: '4', name: 'Suhana Dev', category: 'Indie Artist', rating: 4.6, city: 'Bangalore', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', instruments: ['Violin'] },
  ];

  useEffect(() => {
    const fetchOpenMics = async () => {
      setIsLoading(true);
      try {
        const cityParam = activeCity || 'Mumbai';
        // Dynamically import API_BASE_URL to avoid unused warnings when code blocks change
        const configModule = await import('../../config');
        const res = await fetch(`${configModule.API_BASE_URL}/events?city=${cityParam}`);
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((e: any) => 
            e.category?.toLowerCase() === 'open mic' || 
            e.title?.toLowerCase().includes('open mic')
          );
          setOpenMicEvents(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpenMics();
  }, [activeCity]);

  // Handle performer pass registration
  const handleRegisterPerformer = (event: any) => {
    if (!user) {
      openModal('auth');
      return;
    }
    
    // Find Performer pass or fallback to first ticket type
    let performerTicket = event.ticket_types?.find((t: any) => 
      t.name?.toLowerCase().includes('performer') || 
      t.name?.toLowerCase().includes('pass')
    );
    
    if (!performerTicket && event.ticket_types?.length > 0) {
      performerTicket = event.ticket_types[0];
    }
    
    setSelectedEvent(event);
    setSelectedTicketId(performerTicket?.id || null);
    setIsBookingOpen(true);
  };

  return (
    <PageWrapper className="relative pb-24">
      <FloatingOrb className="top-0 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-0 right-10" color="cyan" size={300} delay={1} />

      <div className="relative z-10 space-y-12 max-w-5xl mx-auto px-1 md:px-0">
        
        {/* Header */}
        <header className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Mic className="w-5 h-5 text-[var(--violet-bright)] animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--violet-bright)]">Emerging Talent Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight">
            Open Mic <span className="text-gradient">Discovery</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl text-sm md:text-base font-medium mx-auto md:mx-0">
            Find local open mics, register for performer passes, build your career recognition, and connect directly with local organizers.
          </p>
        </header>

        {/* Info box for new talent */}
        <section>
          <GlassCard className="p-6 border-[var(--violet-primary)]/20 shadow-glow bg-gradient-to-r from-[var(--violet-primary)]/5 to-transparent">
            <h3 className="text-lg font-bold font-display text-white mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--violet-bright)]" /> Performer Pass Benefits
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When booking a **Performer Pass**, your stage name is automatically listed on the event's talent roster, notifying venues and organizers of your act. Register, show your observational wit or acoustic covers, and get noticed!
            </p>
          </GlassCard>
        </section>

        {/* Active Open Mics list */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-3xl font-display font-extrabold text-white">Upcoming Open Mics in {activeCity || 'Mumbai'}</h2>
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : openMicEvents.length === 0 ? (
            <div className="text-center p-12 bg-white/3 border border-white/5 rounded-3xl space-y-4">
              <ShieldAlert className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">No Open Mic Events Listed</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Be the first to create one! Click "Become an Organizer" to list your open mic.</p>
              </div>
              <GlowButton onClick={() => navigate('/dashboard?organize=true')} className="mx-auto text-xs py-2 px-6">
                Host Open Mic
              </GlowButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {openMicEvents.map(event => (
                <GlassCard 
                  key={event.id}
                  className="p-5 flex flex-col justify-between hover:border-[var(--border-glow)] transition-all group duration-300"
                >
                  <div className="flex gap-4">
                    <img 
                      src={getImageUrl(event.cover_image)} 
                      alt="" 
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <span className="text-[8px] bg-[var(--violet-primary)] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {event.category || 'Open Mic'}
                      </span>
                      <h4 className="text-base font-extrabold text-white truncate mt-1.5 group-hover:text-[var(--violet-bright)] transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[var(--accent-pink)]" /> {event.venue_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                    <div>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Date & Time</p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {new Date(event.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • 7 PM onwards
                      </p>
                    </div>
                    
                    <GlowButton 
                      onClick={() => handleRegisterPerformer(event)}
                      className="py-2.5 px-5 text-xs font-bold"
                    >
                      Register to Perform
                    </GlowButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Emerging Talent Board */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-display font-extrabold text-white">Emerging Talent Board</h2>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Rising Stars</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {talents.map((t) => (
              <GlassCard 
                key={t.id}
                className="p-4 flex flex-col items-center justify-between text-center gap-4 hover:border-white/20 transition-all duration-300"
              >
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                    <p className="text-[9px] text-[var(--violet-bright)] font-bold uppercase tracking-wider mt-0.5">{t.category}</p>
                    <div className="flex items-center justify-center gap-0.5 text-[8px] text-[var(--violet-glow)] font-bold mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" /> {t.rating}
                    </div>
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-white/5 flex flex-wrap gap-1 justify-center">
                  {t.instruments.map((ins, i) => (
                    <span key={i} className="text-[8px] font-semibold bg-white/5 border border-white/10 text-white/70 px-1.5 py-0.5 rounded">
                      {ins}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

      </div>

      {/* Booking Modal Popup */}
      {selectedEvent && (
        <BookingModal 
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedEvent(null);
            setSelectedTicketId(null);
          }}
          event={selectedEvent}
          selectedTicketId={selectedTicketId}
        />
      )}
    </PageWrapper>
  );
};
