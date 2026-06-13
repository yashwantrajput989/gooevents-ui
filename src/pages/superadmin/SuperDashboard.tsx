import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Sparkles, Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { AdminLogin } from '../admin/AdminLogin';
import { API_BASE_URL } from '../../config';

export const SuperDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 86,
    activeCompanies: 0,
    totalEvents: 0,
    grossRevenue: 0
  });
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchPlatformStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/global-stats`);
      if (response.ok) {
        const data = await response.json();
        
        const allComps = data.companies || [];
        const pending = allComps.filter((c: any) => !c.verified && c.id !== 'vhop_official');
        const active = allComps.filter((c: any) => c.verified && c.id !== 'vhop_official');
        
        setPendingCompanies(pending);
        setStats({
          totalUsers: 86,
          activeCompanies: active.length,
          totalEvents: data.events?.length || 0,
          grossRevenue: data.stats?.totalRevenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const handleApproveCompany = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setPendingCompanies(prev => prev.filter(c => c.id !== id));
        alert('Artist approved and verified successfully!');
        fetchPlatformStats();
      }
    } catch (error) {
      console.error('Error approving artist:', error);
    }
  };

  const handleRejectCompany = async (id: string) => {
    if (window.confirm('Reject this artist portfolio verification?')) {
      setPendingCompanies(prev => prev.filter(c => c.id !== id));
      alert('Artist application rejected.');
    }
  };

  const platformData = [
    { name: 'DJ/Music', value: 50, color: 'var(--violet-bright)' },
    { name: 'Comedy', value: 30, color: 'var(--accent-pink)' },
    { name: 'Singers/Bands', value: 20, color: 'var(--accent-cyan)' },
  ];

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--violet-bright)]"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return <AdminLogin forcedRole="superadmin" />;
  }

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold">Platform Overview</h1>
            <p className="text-[var(--text-secondary)] font-medium">Super Admin Control Center • Goo Events Global</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 font-bold text-sm">Export Report</button>
            <button className="px-6 py-2 rounded-xl bg-[image:var(--gradient-hero)] font-bold text-sm">Broadcast Alerts</button>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Members', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'var(--violet-bright)' },
            { label: 'Verified Artists', value: stats.activeCompanies.toLocaleString(), icon: Sparkles, color: 'var(--accent-pink)' },
            { label: 'Platform Shows', value: stats.totalEvents.toLocaleString(), icon: Calendar, color: 'var(--accent-cyan)' },
            { label: 'Gross Revenue', value: `₹${stats.grossRevenue.toLocaleString()}`, icon: IndianRupee, color: 'var(--accent-gold)' },
          ].map((kpi, i) => (
            <GlassCard key={i} className="p-6">
              <div className="p-3 w-fit rounded-xl bg-white/5 mb-4" style={{ color: kpi.color }}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium">{kpi.label}</p>
              <h3 className="text-3xl font-display font-bold mt-1">{kpi.value}</h3>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold font-display mb-8 font-bold">Artist Category Performance</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px'}}
                  />
                  <Bar dataKey="value" fill="var(--violet-primary)" radius={[4, 4, 0, 0]}>
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-bold font-display mb-8 font-bold">Category Distribution</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-4">
                {platformData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-sm text-[var(--text-muted)] ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Verification requests */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-display font-bold">Artist Verification & Portfolio Requests</h3>
            <span className="bg-[var(--violet-primary)] px-3 py-1 rounded-full text-xs font-bold">{pendingCompanies.length} Pending Approval</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <th className="pb-4 font-bold">Artist/Stage Name</th>
                  <th className="pb-4 font-bold">Category</th>
                  <th className="pb-4 font-bold">Start Price</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendingCompanies.length > 0 ? pendingCompanies.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border-subtle)]/50 group hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold flex items-center gap-2">
                      <span>{row.name}</span>
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[var(--text-muted)]">{row.city}</span>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)] font-semibold text-[var(--violet-bright)]">{row.category || 'DJ'}</td>
                    <td className="py-4 text-[var(--text-secondary)]">₹{(row.booking_price || 0).toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedCompany(row)}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          Review Portfolio
                        </button>
                        <button 
                          onClick={() => handleRejectCompany(row.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Reject Portfolio"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleApproveCompany(row.id)}
                          className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                          title="Approve Artist"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[var(--text-muted)] font-medium">No pending artist requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Portfolio Review Modal */}
        <AnimatePresence>
          {selectedCompany && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCompany(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-2xl z-10"
              >
                <GlassCard className="p-8 border-[var(--violet-primary)]/40 shadow-glow">
                  <header className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-display font-bold">{selectedCompany.name}</h2>
                        <span className="bg-[var(--violet-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedCompany.category || 'Artist'}</span>
                      </div>
                      <p className="text-[var(--text-muted)] font-medium">Portfolio Verification Details</p>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-white/5 rounded-lg text-white font-bold">
                      X
                    </button>
                  </header>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Hometown / City</label>
                        <p className="text-lg font-medium">{selectedCompany.city}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Contact Details</label>
                        <p className="text-sm font-medium">{selectedCompany.contact_email}</p>
                        <p className="text-xs text-[var(--text-muted)]">{selectedCompany.phone || 'No phone'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Starting Quote</label>
                        <p className="text-lg font-medium text-[var(--violet-bright)]">₹{(selectedCompany.booking_price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Genres</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedCompany.genres && selectedCompany.genres.map((g: string, i: number) => (
                            <span key={i} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white font-medium">{g}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Media Reels & Links</label>
                        {selectedCompany.video_url ? (
                          <p className="text-xs truncate text-[var(--violet-bright)] font-semibold mt-1">
                            <a href={selectedCompany.video_url} target="_blank" rel="noreferrer" className="hover:underline">Reel Link: {selectedCompany.video_url}</a>
                          </p>
                        ) : <p className="text-xs text-[var(--text-muted)] mt-1">No video reel provided</p>}
                        {selectedCompany.website && (
                          <p className="text-xs truncate text-cyan-400 font-semibold mt-1">
                            <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="hover:underline">Website: {selectedCompany.website}</a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Biography & Experience</label>
                    <p className="text-[var(--text-secondary)] mt-2 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                      {selectedCompany.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        handleRejectCompany(selectedCompany.id);
                        setSelectedCompany(null);
                      }}
                      className="flex-1 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all text-sm uppercase tracking-wider"
                    >
                      Reject Request
                    </button>
                    <button 
                      onClick={() => {
                        handleApproveCompany(selectedCompany.id);
                        setSelectedCompany(null);
                      }}
                      className="flex-1 py-4 rounded-xl bg-green-500/10 text-green-500 font-bold border border-green-500/20 hover:bg-green-500/20 transition-all text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      Approve & Verify Artist
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};
