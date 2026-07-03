import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  Ticket, IndianRupee, Plus, Pencil, Trash2, 
  ShieldAlert, Calendar, ChevronLeft, ChevronRight, ShieldCheck, X, 
  Bell, Settings, Utensils, Warehouse, MapPin, Sparkles, Sliders 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlowButton } from '../../components/ui/GlowButton';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { AdminLogin } from './AdminLogin';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Navigation and State
  const [adminTab, setAdminTab] = useState<'overview' | 'calendar' | 'settings' | 'notifications'>('overview');
  const [adminType, setAdminType] = useState<'artist' | 'venue' | 'caterer'>('artist');
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]); // For artist shows
  const [isLoading, setIsLoading] = useState(true);

  // Email verification/verification flags
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  
  // Settings Form States
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('Mumbai');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCapacity, setFormCapacity] = useState('');

  // Caterer Specific Form States
  const [formLunchMenu, setFormLunchMenu] = useState('');
  const [formDinnerMenu, setFormDinnerMenu] = useState('');
  const [formSnacksMenu, setFormSnacksMenu] = useState('');

  // Artist Specific Form States
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formGenres, setFormGenres] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Calendar Year/Month States
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // OTP Validation modal states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const fetchDashboardData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAdminType(data.type || 'artist');
        setProfile(data.profile || null);
        setBookings(data.bookings || []);
        setBlockedDates(data.blockedDates || []);
        setNotifications(data.notifications || []);
        setEvents(data.events || []);

        setIsEmailVerified(!!user.email_verified);
        setIsVerified(data.profile ? !!data.profile.verified : true);

        // Pre-fill setting fields
        if (data.profile) {
          const prof = data.profile;
          setFormName(prof.name || '');
          setFormCity(prof.city || 'Mumbai');
          setFormDescription(prof.description || '');
          setFormCoverImage(prof.cover_image || (prof.gallery_images && prof.gallery_images[0]) || '');
          
          setFormPrice(prof.price ? String(prof.price) : prof.booking_price ? String(prof.booking_price) : prof.price_per_plate ? String(prof.price_per_plate) : '');
          setFormCapacity(prof.capacity ? String(prof.capacity) : '');

          if (data.type === 'caterer') {
            setFormLunchMenu(prof.lunch_menu ? prof.lunch_menu.join(', ') : '');
            setFormDinnerMenu(prof.dinner_menu ? prof.dinner_menu.join(', ') : '');
            setFormSnacksMenu(prof.snacks_menu ? prof.snacks_menu.join(', ') : '');
          }

          if (data.type === 'artist') {
            setFormContactEmail(prof.contact_email || '');
            setFormPhone(prof.phone || '');
            setFormWebsite(prof.website || '');
            setFormGenres(prof.genres ? prof.genres.join(', ') : '');
            setFormVideoUrl(prof.video_url || '');
          }
        }
      }
    } catch (err) {
      console.error("Fetch admin dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Submit Settings edits
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingSettings(true);

    const payload: any = {
      name: formName,
      description: formDescription,
      cover_image: formCoverImage,
      city: formCity
    };

    if (adminType === 'artist') {
      payload.contact_email = formContactEmail;
      payload.phone = formPhone;
      payload.website = formWebsite;
      payload.genres = formGenres.split(',').map(s => s.trim()).filter(Boolean);
      payload.gallery_images = [formCoverImage];
      payload.video_url = formVideoUrl;
      payload.booking_price = parseFloat(formPrice) || 0;
    } else if (adminType === 'venue') {
      payload.capacity = parseInt(formCapacity) || 300;
      payload.price = parseFloat(formPrice) || 0;
    } else if (adminType === 'caterer') {
      payload.price_per_plate = parseFloat(formPrice) || 0;
      payload.lunch_menu = formLunchMenu.split(',').map(s => s.trim()).filter(Boolean);
      payload.dinner_menu = formDinnerMenu.split(',').map(s => s.trim()).filter(Boolean);
      payload.snacks_menu = formSnacksMenu.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/${adminType}/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Settings saved successfully!');
        fetchDashboardData();
      } else {
        alert('Failed to save profile settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Toggle blocked date from calendar
  const handleToggleBlockDate = async (dateStr: string) => {
    if (!profile) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/blocked-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: profile.id,
          resourceType: adminType,
          date: dateStr
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.blocked) {
          setBlockedDates([...blockedDates, dateStr]);
        } else {
          setBlockedDates(blockedDates.filter(d => d !== dateStr));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notification Actions
  const handleMarkNotificationRead = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, { method: 'POST' });
      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all/${user.id}`, { method: 'POST' });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // OTP Email Verification Handlers
  const handleSendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      });
      if (response.ok) {
        setOtpSent(true);
        setOtpSuccess('6-digit OTP code sent to your email.');
      } else {
        setOtpError('Failed to send OTP. Try again.');
      }
    } catch (err) {
      setOtpError('Network error.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, code: otpCode })
      });
      if (response.ok) {
        setOtpSuccess('Email verified successfully!');
        setIsEmailVerified(true);
        setTimeout(() => setIsVerifyingEmail(false), 1500);
      } else {
        setOtpError('Invalid OTP code. Please verify and try again.');
      }
    } catch (err) {
      setOtpError('Network error.');
    }
  };

  // Calendar Helpers
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Delete event for artists
  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setEvents(events.filter(e => e.id !== eventId));
          alert('Show deleted successfully.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <AdminLogin forcedRole="admin" />;
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--violet-bright)]"></div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Generate calendar days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays: any[] = [];
  
  // Previous month buffer padding
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const day = prevMonthTotalDays - i;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: day, isCurrentMonth: false });
  }

  // Active month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // Next month buffer padding
  const totalSlotsUsed = calendarDays.length;
  const remainingSlots = 42 - totalSlotsUsed; // standard 6-row calendar
  for (let i = 1; i <= remainingSlots; i++) {
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        
        {/* Email verification warning */}
        {!isEmailVerified && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold text-sm">Action Required: Verify Email Address</h4>
                <p className="text-xs text-red-200/80 mt-1 leading-relaxed">
                  Your email address <span className="font-bold text-white">{user.email}</span> is not verified. Verify now to secure your account.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setIsVerifyingEmail(true); handleSendOtp(); }}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow hover:scale-105"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Verification Alert Banner */}
        {adminType === 'artist' && !isVerified && isEmailVerified && (
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-500 font-bold text-sm">Portfolio Pending Superadmin verification</h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Your portfolio is currently unverified. Add your details, description, and genres in the **Settings** tab. Once approved by the superadmin, you will appear live in the directories.
              </p>
            </div>
          </div>
        )}

        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display font-black text-white">{profile?.name || 'Goo Events Admin'}</h1>
              <span className="bg-[var(--violet-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {adminType.toUpperCase()} PARTNER
              </span>
            </div>
            <p className="text-[var(--text-secondary)] font-medium mt-1">Portal control dashboard for managing booking slots, profiles, and listings.</p>
          </div>
          {adminType === 'artist' && (
            <GlowButton onClick={() => navigate('/admin/create-event')} className="gap-2">
              <Plus className="w-5 h-5" /> Create New Show
            </GlowButton>
          )}
        </header>

        {/* Admin Navigation Tab bar */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full overflow-x-auto scrollbar-none gap-2">
          {[
            { key: 'overview', label: 'Overview Metrics', icon: Sliders },
            { key: 'calendar', label: 'Availability Calendar', icon: Calendar },
            { key: 'settings', label: 'Portal settings', icon: Settings },
            { 
              key: 'notifications', 
              label: `In-App Notifications`, 
              icon: Bell, 
              badge: unreadCount > 0 ? unreadCount : undefined 
            },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setAdminTab(t.key as any)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                adminTab === t.key 
                  ? 'bg-[var(--violet-primary)] text-white shadow-glow' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Displays */}
        <div>

          {/* TAB 1: OVERVIEW METRICS */}
          {adminTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                  <div className="p-3 w-fit rounded-xl bg-white/5 text-[var(--accent-gold)] mb-4">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    {adminType === 'caterer' ? 'Price / Plate' : 'Booking Base Price'}
                  </p>
                  <h3 className="text-3xl font-display font-black mt-1 text-white">
                    ₹{parseFloat(formPrice || '0').toLocaleString()}
                  </h3>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="p-3 w-fit rounded-xl bg-white/5 text-[var(--violet-bright)] mb-4">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Bookings Received</p>
                  <h3 className="text-3xl font-display font-black mt-1 text-white">{bookings.length}</h3>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="p-3 w-fit rounded-xl bg-white/5 text-cyan-400 mb-4">
                    {adminType === 'artist' ? <Sparkles className="w-6 h-6" /> : adminType === 'venue' ? <Warehouse className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    {adminType === 'artist' ? 'Active Local Shows' : adminType === 'venue' ? 'Capacity' : 'Menu Courses'}
                  </p>
                  <h3 className="text-3xl font-display font-black mt-1 text-white">
                    {adminType === 'artist' ? events.length : adminType === 'venue' ? `${formCapacity} Pax` : '3 Tiers'}
                  </h3>
                </GlassCard>
              </div>

              {/* Bookings Queue and Action Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bookings listing */}
                <GlassCard className="lg:col-span-2 p-8 space-y-6">
                  <h3 className="text-lg font-bold font-display text-white">Active Bookings Queue</h3>
                  <div className="space-y-4">
                    {bookings.length > 0 ? bookings.map((b) => (
                      <div key={b.id} className="p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {b.event_type || b.package_tier ? `Wedding Booking (${b.package_tier || 'Custom'})` : 'Concert Ticket Sales'}
                            </span>
                            <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[var(--text-secondary)] font-medium">
                              Code: {b.id.toUpperCase().slice(0, 10)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)] font-medium pt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {b.booking_date || b.event_date}</span>
                            <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Total Amount: ₹{(b.total_price || b.budget || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
                            {b.status || 'confirmed'}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-[var(--text-muted)] font-medium">
                        No bookings scheduled currently.
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* Left side actions (e.g. Shows list for artists) */}
                <GlassCard className="p-8 space-y-6">
                  {adminType === 'artist' ? (
                    <>
                      <h3 className="text-lg font-bold font-display text-white">Local Stage Shows</h3>
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center gap-4 group">
                            <img src={getImageUrl(event.cover_image)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{event.title}</p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{event.tickets_sold} tickets sold</p>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                                className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {events.length === 0 && (
                          <p className="text-xs text-[var(--text-muted)] text-center py-6">No shows scheduled.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold font-display text-white">Partner Info Summary</h3>
                      <div className="space-y-4 text-xs">
                        <div className="p-3 bg-white/2 border border-white/5 rounded-lg space-y-1">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Service Category</span>
                          <span className="text-white font-medium capitalize">{adminType} Services</span>
                        </div>
                        <div className="p-3 bg-white/2 border border-white/5 rounded-lg space-y-1">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">City Location</span>
                          <span className="text-white font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {formCity}</span>
                        </div>
                        <div className="p-3 bg-white/2 border border-white/5 rounded-lg space-y-1">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Profile Description</span>
                          <span className="text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">{formDescription}</span>
                        </div>
                      </div>
                    </>
                  )}
                </GlassCard>
              </div>
            </div>
          )}

          {/* TAB 2: AVAILABILITY CALENDAR */}
          {adminTab === 'calendar' && (
            <GlassCard className="p-8 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-display text-white">Booking Calendar Manager</h3>
                  <p className="text-xs text-[var(--text-muted)]">Click on any date to toggle block/unblock, preventing or enabling client bookings.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
                  <button onClick={handlePrevMonth} className="p-1 hover:text-[var(--violet-bright)]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold min-w-[100px] text-center text-white">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:text-[var(--violet-bright)]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Legend indicators */}
              <div className="flex flex-wrap gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500/10 border border-emerald-500/20" />
                  <span className="text-[var(--text-secondary)]">Available (Open)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-red-500/10 border border-red-500/30" />
                  <span className="text-[var(--text-secondary)]">Blocked (Unavailable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[var(--violet-primary)] text-white" />
                  <span className="text-[var(--text-secondary)]">Booked (Client Reservation)</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => {
                    const isBlocked = blockedDates.includes(day.dateStr);
                    const bookingMatch = bookings.find(b => (b.booking_date === day.dateStr || b.event_date === day.dateStr));
                    const isBooked = !!bookingMatch;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => !isBooked && handleToggleBlockDate(day.dateStr)}
                        className={`min-h-[70px] p-2 rounded-xl border flex flex-col justify-between transition-all relative ${
                          day.isCurrentMonth ? 'cursor-pointer' : 'opacity-25 pointer-events-none'
                        } ${
                          isBooked 
                            ? 'bg-[var(--violet-primary)] border-[var(--violet-bright)] text-white shadow-glow'
                            : isBlocked
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={isBooked ? `Booked: ${bookingMatch.package_tier || 'Wedding Event'}` : ''}
                      >
                        <span className="text-xs font-extrabold">{day.dayNum}</span>
                        {isBooked && (
                          <span className="text-[8px] font-black uppercase tracking-wider block bg-black/30 px-1 py-0.5 rounded truncate max-w-full">
                            Booked
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-[8px] font-black uppercase tracking-wider block bg-black/20 px-1 py-0.5 rounded truncate max-w-full text-center">
                            Blocked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 3: PORTAL SETTINGS */}
          {adminTab === 'settings' && (
            <GlassCard className="p-8 animate-fadeIn">
              <h3 className="text-xl font-bold font-display text-white mb-6">Manage Profile Settings</h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Global fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Service/Company Name</label>
                    <input 
                      type="text" required value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">City Location</label>
                    <select 
                      value={formCity} onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {adminType === 'caterer' ? 'Price Per Plate (₹)' : 'Booking Cost (₹)'}
                    </label>
                    <input 
                      type="number" required value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>

                  {adminType === 'venue' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Maximum Capacity (Pax)</label>
                      <input 
                        type="number" required value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      />
                    </div>
                  ) : adminType === 'artist' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Genres (comma-separated)</label>
                      <input 
                        type="text" value={formGenres}
                        onChange={(e) => setFormGenres(e.target.value)}
                        placeholder="Electronic, Pop, Bollywood"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      />
                    </div>
                  ) : null}
                </div>

                {/* Dynamic fields for Caterer Menus */}
                {adminType === 'caterer' && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Manage Menu Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Lunch Menu (comma-separated)</label>
                        <textarea 
                          rows={3} value={formLunchMenu}
                          onChange={(e) => setFormLunchMenu(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dinner Menu (comma-separated)</label>
                        <textarea 
                          rows={3} value={formDinnerMenu}
                          onChange={(e) => setFormDinnerMenu(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Snacks Menu (comma-separated)</label>
                        <textarea 
                          rows={3} value={formSnacksMenu}
                          onChange={(e) => setFormSnacksMenu(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Artist specifics */}
                {adminType === 'artist' && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contact Email</label>
                        <input 
                          type="email" value={formContactEmail}
                          onChange={(e) => setFormContactEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contact Phone</label>
                        <input 
                          type="text" value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Website URL</label>
                        <input 
                          type="url" value={formWebsite}
                          onChange={(e) => setFormWebsite(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video Reel URL</label>
                        <input 
                          type="url" value={formVideoUrl}
                          onChange={(e) => setFormVideoUrl(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-bold">Biography / Service Description</label>
                  <textarea 
                    rows={4} required value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-bold">Cover Image / Media URL</label>
                  <input 
                    type="url" required value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                  />
                </div>

                <GlowButton type="submit" isLoading={isSavingSettings} className="w-full py-3.5 text-xs font-bold uppercase tracking-wider">
                  Save settings
                </GlowButton>
              </form>
            </GlassCard>
          )}

          {/* TAB 4: IN-APP NOTIFICATIONS */}
          {adminTab === 'notifications' && (
            <GlassCard className="p-8 space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Notifications center</h3>
                  <p className="text-xs text-[var(--text-muted)]">Check real-time booking updates and requests sent by platform customers.</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllNotificationsRead}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-bold transition-all"
                  >
                    Mark All As Read
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-xl border flex justify-between gap-4 transition-all ${
                      n.read 
                        ? 'bg-white/2 border-white/5 opacity-60' 
                        : 'bg-[var(--violet-primary)]/10 border-[var(--violet-primary)]/30 shadow-[0_0_20px_rgba(139,92,246,0.05)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold ${n.read ? 'text-[var(--text-secondary)]' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-[var(--text-muted)] font-medium block pt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>

                    {!n.read && (
                      <button 
                        onClick={() => handleMarkNotificationRead(n.id)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white h-fit"
                      >
                        Read
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-12 text-[var(--text-muted)] font-medium">
                    You have no notifications yet.
                  </div>
                )}
              </div>
            </GlassCard>
          )}

        </div>
      </div>

      {/* OTP verification Modal */}
      {isVerifyingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md">
            <GlassCard className="p-8 border-[var(--violet-primary)]/30 space-y-6">
              <button 
                onClick={() => {
                  setIsVerifyingEmail(false);
                  setOtpSent(false);
                  setOtpCode('');
                  setOtpError('');
                  setOtpSuccess('');
                }}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-[var(--violet-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-[var(--violet-bright)]" />
                </div>
                <h3 className="text-xl font-display font-extrabold text-white">Email Verification</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  Verify your account email to secure operations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center text-xs font-semibold text-white">
                  {user.email}
                </div>

                {!otpSent ? (
                  <GlowButton onClick={handleSendOtp} className="w-full py-3 text-xs font-bold uppercase tracking-wider">
                    Send OTP Verification Code
                  </GlowButton>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block text-left">
                        Enter 6-Digit Code
                      </label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-xl font-bold tracking-widest focus:border-[var(--violet-bright)] outline-none transition-all text-white"
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSendOtp}
                        className="flex-1 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold rounded-xl transition-all text-white uppercase tracking-wider"
                      >
                        Resend
                      </button>
                      <GlowButton onClick={handleVerifyOtp} disabled={otpCode.length !== 6} className="flex-1 py-2.5 text-[10px] uppercase tracking-wider font-bold">
                        Verify
                      </GlowButton>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl text-center">
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-xl text-center">
                    {otpSuccess}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};
