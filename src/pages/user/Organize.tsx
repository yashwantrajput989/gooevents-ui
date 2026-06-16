import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlowButton } from '../../components/ui/GlowButton';
import { FloatingOrb } from '../../components/ui/FloatingOrb';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, CheckCircle, Building2, Info, CheckCircle2, ChevronRight, Play 
} from 'lucide-react';

export const Organize: React.FC = () => {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<'organize' | 'venue'>('organize');
  
  // Organizer Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Wizard Form Fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('Open Mic');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('Mumbai');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  
  // Ticket Form Fields
  const [ticketName, setTicketName] = useState('General Admission');
  const [ticketPrice, setTicketPrice] = useState('199');
  const [totalTickets, setTotalTickets] = useState('100');
  const [isFree, setIsFree] = useState(false);

  // Venue Partner Form Fields
  const [venueName, setVenueName] = useState('');
  const [venueCategory, setVenueCategory] = useState('Cafe');
  const [venueCapacity, setVenueCapacity] = useState('');
  const [venuePrice, setVenuePrice] = useState('');
  const [venueCity, setVenueCity] = useState('Mumbai');
  const [venueDescription, setVenueDescription] = useState('');
  const [venueCover, setVenueCover] = useState('');

  const handleBack = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch User's company profile (autocreated on the fly if needed)
        const dashRes = await fetch(`${API_BASE_URL}/admin/dashboard/${user.id}`);
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setCompany(dashData.company);
          setMyEvents(dashData.events || []);
        }

        // Fetch Venues list for step 2
        const venueRes = await fetch(`${API_BASE_URL}/venues?city=${eventCity}`);
        if (venueRes.ok) {
          const venueData = await venueRes.json();
          setVenues(Array.isArray(venueData) ? venueData : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [user, eventCity]);

  // Handle Event Creation (Publish)
  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openModal('auth');
      return;
    }
    setIsLoading(true);

    const compId = company?.id || 'vhop_official';
    
    // Set Ticket price
    const finalPrice = isFree ? 0 : parseFloat(ticketPrice) || 0;
    
    const eventPayload = {
      title: eventTitle,
      short_description: `Join us for a spectacular ${eventType} night!`,
      description: `Hosted at ${selectedVenue?.name || 'TBA'}. A wonderful community event for live entertainment.`,
      category: eventType,
      price: finalPrice,
      city: eventCity,
      venue_name: selectedVenue?.name || 'TBA',
      cover_image: selectedVenue?.cover_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000',
      start_date: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      total_tickets: parseInt(totalTickets) || 100,
      status: 'published',
      company_id: compId,
      ticket_types: [
        {
          id: `t-${Math.random().toString(36).substring(2, 9)}`,
          name: ticketName,
          price: finalPrice,
          benefits: isFree ? ['Free Entry Pass'] : ['Standard Admission Entry', 'Access to main floor']
        }
      ]
    };

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });
      if (response.ok) {
        // Send request to venue partner
        if (selectedVenue) {
          await fetch(`${API_BASE_URL}/venues/${selectedVenue.id}/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_title: eventTitle,
              preferred_date: eventDate,
              organizer_id: user.id
            })
          });
        }
        
        // Refresh local dashboard data
        const dashRes = await fetch(`${API_BASE_URL}/admin/dashboard/${user.id}`);
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setMyEvents(dashData.events || []);
        }
        setWizardStep(4); // Show dashboard & checklist step
      } else {
        alert('Failed to publish event.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Venue Partnership Registration
  const handleRegisterVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venueName,
          city: venueCity,
          capacity: parseInt(venueCapacity) || 100,
          price: parseFloat(venuePrice) || 0.00,
          description: venueDescription,
          cover_image: venueCover || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000'
        })
      });

      if (response.ok) {
        alert('Venue Partnership Registered! Your space is now listed in the venue search directories.');
        setVenueName('');
        setVenueCapacity('');
        setVenuePrice('');
        setVenueDescription('');
        setVenueCover('');
        
        // Refresh Venues list
        const venueRes = await fetch(`${API_BASE_URL}/venues?city=${eventCity}`);
        if (venueRes.ok) {
          const venueData = await venueRes.json();
          setVenues(Array.isArray(venueData) ? venueData : []);
        }
      } else {
        alert('Failed to register venue.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="relative pb-24 pt-4">
      <FloatingOrb className="top-0 -left-20" color="violet" size={400} />
      <FloatingOrb className="bottom-0 right-0" color="cyan" size={300} delay={1.5} />

      <div className="relative z-10 max-w-5xl mx-auto px-0 md:px-4 space-y-6 md:space-y-10">
        
        {/* Header Tab navigation */}
        <header className="flex flex-col gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white">Organize & Partner</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)]">Host events or list your venue to connect with Goo Events creators.</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-fit">
            <button
              onClick={() => setActiveTab('organize')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'organize' ? 'bg-[var(--violet-primary)] text-white shadow-glow' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Organize Event
            </button>
            <button
              onClick={() => setActiveTab('venue')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'venue' ? 'bg-[var(--violet-primary)] text-white shadow-glow' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              List Venue
            </button>
          </div>
        </header>

        {activeTab === 'organize' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
            
            {/* Left Column: Organizer steps / Wizard */}
            <div className="lg:col-span-2 space-y-5 md:space-y-6">
              
              {!user ? (
                <GlassCard className="p-8 text-center space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">Please sign in to organize events on Goo Events.</p>
                  <GlowButton onClick={() => openModal('auth')} className="mx-auto">
                    Sign In to Continue
                  </GlowButton>
                </GlassCard>
              ) : (
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Event Idea */}
                  {wizardStep === 1 && (
                    <motion.div
                      key="wizard1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--violet-bright)]">Step 1 of 3</span>
                        <h2 className="text-2xl font-display font-extrabold text-white">Let's Start Your Event</h2>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Fill in the core idea of your event below.</p>
                      </div>

                      <GlassCard className="p-5 md:p-8 space-y-5 md:space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Event Title</label>
                          <input 
                            type="text" 
                            required
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g. Acoustic Evening, Open Mic Night"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[var(--violet-bright)] text-white text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Event Type</label>
                            <select
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white [&>option]:bg-[#121214]"
                            >
                              <option value="Open Mic">Open Mic</option>
                              <option value="Concert">Concert / Band Night</option>
                              <option value="Comedy">Comedy Show</option>
                              <option value="Theatre">Theatre Act</option>
                              <option value="Workshop">Workshop</option>
                              <option value="Wellness">Wellness Camp</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">City</label>
                            <select
                              value={eventCity}
                              onChange={(e) => setEventCity(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white [&>option]:bg-[#121214]"
                            >
                              <option value="Mumbai">Mumbai</option>
                              <option value="Visakhapatnam">Visakhapatnam</option>
                              <option value="Bangalore">Bangalore</option>
                              <option value="Hyderabad">Hyderabad</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Preferred Date & Time</label>
                          <input 
                            type="datetime-local" 
                            required
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white"
                          />
                        </div>
                      </GlassCard>

                      <div className="flex justify-end pt-4">
                        <GlowButton 
                          onClick={() => {
                            if (!eventTitle || !eventDate) {
                              alert('Please fill out Event Title and Date.');
                              return;
                            }
                            setWizardStep(2);
                          }}
                          className="px-8 py-3.5"
                        >
                          Next: Choose Venue <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Choose Venue */}
                  {wizardStep === 2 && (
                    <motion.div
                      key="wizard2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--violet-bright)]">Step 2 of 3</span>
                        <h2 className="text-2xl font-display font-extrabold text-white">Choose Venue</h2>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Select a venue partner to request stage space.</p>
                      </div>

                      <div className="space-y-3 max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
                        {venues.length === 0 ? (
                          <div className="text-center p-8 bg-white/5 rounded-2xl text-xs text-[var(--text-secondary)]">
                            No verified venues available in {eventCity} right now. You can draft a custom venue or list one in the other tab.
                          </div>
                        ) : (
                          venues.map(v => (
                            <GlassCard 
                              key={v.id}
                              onClick={() => setSelectedVenue(v)}
                              className={`p-4 flex gap-4 items-center cursor-pointer transition-all ${
                                selectedVenue?.id === v.id ? 'border-[var(--violet-bright)] bg-[var(--violet-primary)]/10 shadow-glow' : 'hover:bg-white/5'
                              }`}
                            >
                              <img src={getImageUrl(v.cover_image)} alt="" className="w-16 h-16 rounded-xl object-cover" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{v.name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] truncate mt-1">Capacity: {v.capacity} Pax • {v.city}</p>
                                <p className="text-[10px] text-[var(--violet-bright)] font-bold mt-1">₹{v.price?.toLocaleString()} / Hour</p>
                              </div>
                              <div className="w-5 h-5 border-2 rounded-full flex items-center justify-center shrink-0 border-white/20">
                                {selectedVenue?.id === v.id && <div className="w-3 h-3 bg-[var(--violet-bright)] rounded-full" />}
                              </div>
                            </GlassCard>
                          ))
                        )}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={() => {
                            if (!selectedVenue) {
                              alert('Please select a venue.');
                              return;
                            }
                            setWizardStep(3);
                          }}
                          className="px-8 py-3.5"
                        >
                          Next: Ticket Details <ChevronRight className="w-4 h-4 ml-1 inline" />
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Ticket Pricing / Free Ticketing */}
                  {wizardStep === 3 && (
                    <motion.div
                      key="wizard3"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--violet-bright)]">Step 3 of 3</span>
                        <h2 className="text-2xl font-display font-extrabold text-white">Set Ticket Details</h2>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Select free ticketing or set a customizable pricing tier.</p>
                      </div>

                      <GlassCard className="p-5 md:p-8 space-y-5 md:space-y-6">
                        <div className="flex items-center justify-between p-3.5 md:p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <h4 className="font-bold text-white text-sm">Make it Free</h4>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Allow users to register and perform for free.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsFree(!isFree)}
                            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                              isFree ? 'bg-[var(--violet-bright)]' : 'bg-white/10'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                              isFree ? 'translate-x-5.5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Ticket Name</label>
                            <input 
                              type="text" 
                              value={ticketName}
                              onChange={(e) => setTicketName(e.target.value)}
                              placeholder="e.g. Early Bird, Performer Pass"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Price (₹ INR)</label>
                              <input 
                                type="number" 
                                disabled={isFree}
                                value={isFree ? '0' : ticketPrice}
                                onChange={(e) => setTicketPrice(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white text-sm disabled:opacity-50"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Tickets available</label>
                              <input 
                                type="number" 
                                value={totalTickets}
                                onChange={(e) => setTotalTickets(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      <div className="flex justify-between pt-4">
                        <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
                          Back
                        </button>
                        <GlowButton 
                          onClick={handlePublishEvent}
                          isLoading={isLoading}
                          className="px-12 py-3.5 font-bold uppercase tracking-wider"
                        >
                          Publish Event
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Event Dashboard & Checklist */}
                  {wizardStep === 4 && (
                    <motion.div
                      key="wizard4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8"
                    >
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-display font-extrabold text-white">Event Created Successfully!</h2>
                        <p className="text-sm text-[var(--text-secondary)]">Your event details are live in the discovery search directories.</p>
                      </div>

                      {/* Organizer Guidance Checklist */}
                      <GlassCard className="p-8 space-y-6">
                        <h3 className="text-lg font-bold font-display text-white border-b border-white/5 pb-3">Organizer Guidance</h3>
                        
                        <div className="space-y-4">
                          {[
                            { label: 'Plan Your Event idea', desc: 'Title, category description, dates setup.', status: 'completed' },
                            { label: 'Select Verified Venue Partner', desc: `Assigned venue: "${selectedVenue?.name}". Request sent.`, status: 'completed' },
                            { label: 'Set Ticket Pricing details', desc: `General ticketing ticket value set to ₹${isFree ? 0 : ticketPrice}.`, status: 'completed' },
                            { label: 'Invite Artists & Performers', desc: 'Invite DJ, singers, or standup comics from directory.', status: 'in-progress' },
                            { label: 'Promote Your Event', desc: 'Share your event link on social platforms.', status: 'pending' },
                          ].map((guide, idx) => (
                            <div key={idx} className="flex gap-4 items-start border-l-2 pl-4 border-white/5 py-1">
                              <div className="shrink-0 mt-0.5">
                                {guide.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                {guide.status === 'in-progress' && <div className="w-5 h-5 rounded-full border border-amber-500/40 flex items-center justify-center"><Play className="w-2.5 h-2.5 text-amber-500 fill-current animate-pulse" /></div>}
                                {guide.status === 'pending' && <div className="w-5 h-5 rounded-full border border-white/10" />}
                              </div>
                              <div>
                                <h4 className={`text-xs font-bold ${guide.status === 'completed' ? 'text-white/60 line-through' : 'text-white'}`}>{guide.label}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{guide.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>

                      <div className="flex justify-center pt-4">
                        <GlowButton onClick={() => {
                          setEventTitle('');
                          setEventDate('');
                          setSelectedVenue(null);
                          setWizardStep(1);
                        }} className="py-3 px-8">
                          Organize Another Event
                        </GlowButton>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              )}
            </div>

            {/* Right Column: Organizer Dashboard & Quick Stats */}
            <div className="space-y-6">
              
              {/* Event Dashboard panel */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Award className="w-5 h-5 text-[var(--violet-bright)]" />
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">Event Dashboard</h3>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                  {myEvents.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-6">No active shows created.</p>
                  ) : (
                    myEvents.map(e => (
                      <div key={e.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-center">
                        <img src={getImageUrl(e.cover_image)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{e.title}</h4>
                          <p className="text-[9px] text-[var(--text-muted)] truncate mt-0.5">{e.venue_name}</p>
                          <p className="text-[9px] text-[var(--violet-bright)] font-bold mt-0.5">{e.tickets_sold} tickets sold</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Guide Tips */}
              <GlassCard className="p-6 space-y-4 text-xs font-medium leading-relaxed">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold font-display text-white">Organizer Guide</h3>
                </div>
                <ul className="space-y-3 text-[11px] text-[var(--text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--violet-bright)]">•</span>
                    <span><strong>Free Ticketing</strong>: Goo Events provides free basic ticketing. Commisions only apply for premium concert pricing.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--violet-bright)]">•</span>
                    <span><strong>Venue Recommendations</strong>: Select verified venue partners to auto-generate request emails.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--violet-bright)]">•</span>
                    <span><strong>Visibility boost</strong>: Published events are automatically advertised in user local discovery grids.</span>
                  </li>
                </ul>
              </GlassCard>

            </div>

          </div>
        ) : (
          /* Register Venue Partner tab */
          <div className="max-w-xl mx-auto">
            <GlassCard className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <Building2 className="w-10 h-10 text-[var(--violet-bright)] mx-auto" />
                <h2 className="text-2xl font-display font-extrabold text-white">Register Venue Partner</h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium">List your restaurant, cafe, pub, rooftop, or studio to host live events.</p>
              </div>

              <form onSubmit={handleRegisterVenue} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Venue Name</label>
                  <input 
                    type="text" 
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. The Neon Nest Loft, Story Cafe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Venue Type</label>
                    <select
                      value={venueCategory}
                      onChange={(e) => setVenueCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white [&>option]:bg-[#121214]"
                    >
                      <option value="Cafe">Cafe</option>
                      <option value="Pub">Pub / Lounge</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Rooftop">Rooftop Area</option>
                      <option value="Studio">Studio Space</option>
                      <option value="Event Space">Large Event Hall</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">City</label>
                    <select
                      value={venueCity}
                      onChange={(e) => setVenueCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white [&>option]:bg-[#121214]"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Max Capacity (Pax)</label>
                    <input 
                      type="number" 
                      required
                      value={venueCapacity}
                      onChange={(e) => setVenueCapacity(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Hourly Booking Price (₹ INR)</label>
                    <input 
                      type="number" 
                      required
                      value={venuePrice}
                      onChange={(e) => setVenuePrice(e.target.value)}
                      placeholder="e.g. 8000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Space Description</label>
                  <textarea 
                    rows={4}
                    required
                    value={venueDescription}
                    onChange={(e) => setVenueDescription(e.target.value)}
                    placeholder="Describe your sound systems, stage dimensions, custom lights, and catering offerings..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Cover Image URL</label>
                  <input 
                    type="url" 
                    value={venueCover}
                    onChange={(e) => setVenueCover(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-sm text-white"
                  />
                </div>

                <GlowButton type="submit" isLoading={isLoading} className="w-full py-3.5 uppercase tracking-wider font-bold">
                  List Venue Partnership
                </GlowButton>
              </form>
            </GlassCard>
          </div>
        )}

      </div>
    </PageWrapper>
  );
};
