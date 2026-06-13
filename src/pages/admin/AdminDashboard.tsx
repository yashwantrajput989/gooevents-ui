import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { TrendingUp, Users, Ticket, IndianRupee, ArrowUpRight, Plus, Pencil, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { GlowButton } from '../../components/ui/GlowButton';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL, getImageUrl } from '../../config';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
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

  const fetchDashboardData = async () => {
    if (!user) return;
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

  const isVerified = company?.verified;

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        
        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] flex items-start gap-4 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-500 font-bold text-sm">Portfolio Pending Approval</h4>
              <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                Your artist portfolio is currently unverified. Complete your Stage Name, Biography, and showcase media in <span className="font-bold text-white underline cursor-pointer" onClick={() => navigate('/admin/settings')}>Portfolio Settings</span>. Once verified by the Superadmin, you will appear in the public Artist Directory.
              </p>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-500 font-bold text-sm">Artist Portfolio Verified</h4>
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
                <span className="bg-green-500/10 text-green-400 border border-green-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">Verified Artist</span>
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

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-display">Show Analytics</h3>
              <div className="flex gap-2">
                {['Day', 'Week', 'Month'].map(t => (
                  <button key={t} className="px-3 py-1 rounded-lg bg-white/5 text-xs hover:bg-white/10 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
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
      </div>
    </PageWrapper>
  );
};
