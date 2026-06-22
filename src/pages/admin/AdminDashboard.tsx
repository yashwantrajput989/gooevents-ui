import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { TrendingUp, Users, Ticket, IndianRupee, ArrowUpRight, Plus, Pencil, Trash2, ShieldAlert, CheckCircle, Calendar, ChevronLeft, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { GlowButton } from '../../components/ui/GlowButton';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { AdminLogin } from './AdminLogin';

export const AdminDashboard: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeEvents: 0,
    avgAttendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verification & Calendar states
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const fetchCalendarData = async (companyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/calendar`);
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.available_dates || []);
        setCalendarEvents(data.events || []);
      }
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  const fetchDashboardData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data.company || null);
        
        // Filter events by the artist's company
        const artistEvents = data.events || [];
        setEvents(artistEvents);
        
        // Calculate stats specific to the artist
        const totalRev = artistEvents.reduce((sum: number, ev: any) => sum + ((ev.tickets_sold || 0) * (ev.price || 0)), 0);
        const totalBks = artistEvents.reduce((sum: number, ev: any) => sum + (ev.tickets_sold || 0), 0);
        
        setStats({
          totalRevenue: totalRev,
          totalBookings: totalBks,
          activeEvents: artistEvents.filter((e: any) => e.status === 'published').length,
          avgAttendance: totalBks > 0 ? 92 : 0
        });

        if (data.company) {
          fetchCalendarData(data.company.id);
        }
      }
    } catch (error) {
      console.error('Error fetching artist dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setEvents(events.filter(e => e.id !== id));
          setStats(prev => ({ ...prev, activeEvents: Math.max(0, prev.activeEvents - 1) }));
        } else {
          throw new Error('Failed to delete event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event.');
      }
    }
  };

  // OTP Email Verification Handlers
  const handleSendOtp = async () => {
    if (!user) return;
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (res.ok) {
        setOtpSent(true);
        setOtpSuccess('OTP code sent to your email.');
      } else {
        const data = await res.json();
        setOtpError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setOtpError('Failed to connect to authentication server.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!user) return;
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: otpCode })
      });
      if (res.ok) {
        setOtpSuccess('Email verified successfully! Updating settings...');
        setUser({ ...user, email_verified: true });
        
        // Refresh dashboard data to see updated state
        setTimeout(() => {
          setIsVerifying(false);
          setOtpSent(false);
          setOtpCode('');
          fetchDashboardData();
        }, 1500);
      } else {
        const data = await res.json();
        setOtpError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setOtpError('Failed to verify OTP code.');
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDateClick = async (dateStr: string) => {
    if (!company) return;
    
    // Check if there is a booked show on this date
    const hasEvent = calendarEvents.some(e => {
      if (!e.start_date) return false;
      const d = new Date(e.start_date).toISOString().split('T')[0];
      return d === dateStr;
    });
    
    if (hasEvent) {
      alert("This date has a scheduled event in Gooevents and cannot be manually modified.");
      return;
    }
    
    const isAlreadyAvailable = availableDates.includes(dateStr);
    const updated = isAlreadyAvailable
      ? availableDates.filter(d => d !== dateStr)
      : [...availableDates, dateStr];
    
    // Optimistic Update
    setAvailableDates(updated);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies/${company.id}/calendar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available_dates: updated })
      });
      if (!res.ok) {
        throw new Error('Failed to save calendar availability');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update availability on server. Reverting.');
      // Revert optimistic update
      setAvailableDates(prev => isAlreadyAvailable ? [...prev, dateStr] : prev.filter(d => d !== dateStr));
    }
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const chartData = [
    { name: 'Mon', revenue: stats.totalRevenue * 0.1 },
    { name: 'Tue', revenue: stats.totalRevenue * 0.15 },
    { name: 'Wed', revenue: stats.totalRevenue * 0.1 },
    { name: 'Thu', revenue: stats.totalRevenue * 0.2 },
    { name: 'Fri', revenue: stats.totalRevenue * 0.25 },
    { name: 'Sat', revenue: stats.totalRevenue * 0.3 },
    { name: 'Sun', revenue: stats.totalRevenue * 0.2 },
  ];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-8 animate-pulse">
          <header className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/5 rounded-lg" />
              <div className="h-4 w-64 bg-white/5 rounded-lg" />
            </div>
            <div className="h-12 w-32 bg-white/5 rounded-xl" />
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-3xl border border-white/5" />
            <div className="h-[400px] bg-white/5 rounded-3xl border border-white/5" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AdminLogin forcedRole="admin" />;
  }

  const isVerified = company?.verified;
  const isEmailVerified = user.email_verified;
  const hasPendingChanges = company?.pending_changes !== null && company?.pending_changes !== undefined;

  // Generate Calendar Days Array
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const calendarDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];
  
  // Previous Month padding days
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dNum = prevMonthDays - i;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: dNum, isCurrentMonth: false });
  }

  // Current Month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // Next Month padding days to complete grid of 42
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        
        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold text-sm">Action Required: Verify Your Email</h4>
                <p className="text-xs text-red-200/80 mt-1 leading-relaxed">
                  Your email address <span className="font-bold text-white">{user.email}</span> is not verified. Please verify your email to secure your account.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVerifying(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-glow hover:scale-105"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Verification Alert Banner */}
        {!isVerified && isEmailVerified && (
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-500 font-bold text-sm">Portfolio Pending Initial Approval</h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Your artist portfolio is currently unverified. Complete your Stage Name, Biography, and showcase media in <span className="font-bold text-white underline cursor-pointer" onClick={() => navigate('/admin/settings')}>Portfolio Settings</span>. Once verified by the Superadmin, you will appear in the public Artist Directory.
              </p>
            </div>
          </div>
        )}

        {/* Pending Changes Banner */}
        {hasPendingChanges && (
          <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-[var(--violet-bright)] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[var(--violet-bright)] font-bold text-sm">Portfolio Edits Pending Review</h4>
              <p className="text-xs text-violet-200/80 mt-1 leading-relaxed">
                You have updated your portfolio details. These edits are saved in pending status and require Super Admin approval. Your public live profile continues to display your original details until the changes are reviewed and approved.
              </p>
            </div>
          </div>
        )}

        {isVerified && !hasPendingChanges && (
          <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-500 font-bold text-sm">Artist Portfolio Verified & Live</h4>
              <p className="text-xs text-green-200/80 mt-1 leading-relaxed">
                Congratulations! Your profile is verified on Goo Events. You are actively visible in the Artist directory, and users can send you booking requests.
              </p>
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display font-bold">{company?.name || 'Artist Profile'}</h1>
              {isVerified ? (
                <span className="bg-green-500/10 text-green-400 border border-green-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase animate-pulse">Verified Artist</span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">Unverified</span>
              )}
            </div>
            <p className="text-[var(--text-secondary)] mt-1">Manage your event schedule and bookings.</p>
          </div>
          <GlowButton onClick={() => navigate('/admin/create-event')} className="gap-2">
            <Plus className="w-5 h-5" /> Create New Show
          </GlowButton>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Booking Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'var(--accent-gold)', trend: '+12.5%' },
            { label: 'Total Tickets Sold', value: stats.totalBookings.toLocaleString(), icon: Ticket, color: 'var(--violet-bright)', trend: '+8.2%' },
            { label: 'Active Shows', value: stats.activeEvents, icon: TrendingUp, color: 'var(--accent-cyan)', trend: '0%' },
            { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: Users, color: 'var(--accent-pink)', trend: '+4.1%' },
          ].map((stat, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/5 text-[var(--text-muted)]" style={{ color: stat.color }}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[var(--accent-green)] flex items-center gap-1">
                  {stat.trend} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold mt-1">{stat.value}</h3>
            </GlassCard>
          ))}
        </div>

        {/* Calendar & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Visual Availability Calendar */}
          <GlassCard className="lg:col-span-2 p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[var(--violet-bright)]" />
                <h3 className="text-xl font-bold font-display">Manage Availability Calendar</h3>
              </div>
              
              <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <button onClick={handlePrevMonth} className="p-1 hover:text-[var(--violet-bright)] transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold min-w-[100px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:text-[var(--violet-bright)] transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-green-500/20 border border-green-500" />
                <span className="text-[var(--text-secondary)] font-medium">Available (Open For Bookings)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-violet-600 border border-[var(--violet-bright)] shadow-glow" />
                <span className="text-[var(--text-secondary)] font-medium">Booked (Show Scheduled)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10" />
                <span className="text-[var(--text-secondary)] font-medium">Blocked / Closed Date</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const isAvailable = availableDates.includes(day.dateStr);
                
                // Find matching event
                const matchingEvent = calendarEvents.find(e => {
                  if (!e.start_date) return false;
                  return new Date(e.start_date).toISOString().split('T')[0] === day.dateStr;
                });

                let cellClass = "relative aspect-square flex flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-all cursor-pointer ";
                
                if (matchingEvent) {
                  cellClass += "bg-violet-600/80 border-[var(--violet-bright)] text-white shadow-glow hover:scale-105";
                } else if (isAvailable) {
                  cellClass += "bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30 hover:scale-105";
                } else {
                  cellClass += "bg-white/5 border-white/5 text-[var(--text-secondary)] hover:border-white/20";
                }

                if (!day.isCurrentMonth) {
                  cellClass += " opacity-40";
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(day.dateStr)}
                    className={cellClass}
                    title={matchingEvent ? `Booked: ${matchingEvent.title}` : (isAvailable ? 'Available' : 'Click to mark available')}
                  >
                    <span>{day.dayNum}</span>
                    {matchingEvent && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-bold font-display mb-6">Upcoming Shows</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {events.length > 0 ? events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 group">
                  <img src={getImageUrl(event.cover_image)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate max-w-[150px]">{event.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{event.tickets_sold} tickets sold</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)] text-sm">No shows scheduled.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Show Analytics */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-display">Earnings Report</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--violet-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--violet-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-muted)', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-muted)', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px'}}
                  itemStyle={{color: 'var(--text-primary)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--violet-bright)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  name="Earnings (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* OTP Verification Modal */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md">
            <GlassCard className="p-8 border-[var(--violet-primary)]/30">
              <button 
                onClick={() => {
                  setIsVerifying(false);
                  setOtpSent(false);
                  setOtpCode('');
                  setOtpError('');
                  setOtpSuccess('');
                }}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white p-1 rounded-full bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[var(--violet-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[var(--violet-bright)]" />
                </div>
                <h3 className="text-2xl font-display font-bold">Email Verification</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Verify your account email to activate your Goo Events profile.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center text-sm font-semibold">
                  {user.email}
                </div>

                {!otpSent ? (
                  <GlowButton onClick={handleSendOtp} className="w-full py-3">
                    Send 6-Digit Verification Code
                  </GlowButton>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block text-left">
                        Enter 6-Digit OTP
                      </label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-[var(--violet-bright)] outline-none transition-all"
                        placeholder="000000"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSendOtp}
                        className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl transition-all"
                      >
                        Resend Code
                      </button>
                      <GlowButton onClick={handleVerifyOtp} disabled={otpCode.length !== 6} className="flex-1 py-3 text-xs">
                        Verify Code
                      </GlowButton>
                    </div>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl text-center">
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
