import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, Sparkles, Calendar, IndianRupee, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { AdminLogin } from '../admin/AdminLogin';
import { GlowButton } from '../../components/ui/GlowButton';
import { API_BASE_URL, getImageUrl } from '../../config';

export const SuperDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCompanies: 0,
    totalEvents: 0,
    grossRevenue: 0
  });
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [platformData, setPlatformData] = useState<any[]>([
    { name: 'DJ/Music', value: 0, percentage: 0, color: 'var(--violet-bright)' },
    { name: 'Comedy', value: 0, percentage: 0, color: 'var(--accent-pink)' },
    { name: 'Singers/Bands', value: 0, percentage: 0, color: 'var(--accent-cyan)' },
  ]);

  // Form states for creating new artist profile
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistEmail, setNewArtistEmail] = useState('');
  const [newArtistPassword, setNewArtistPassword] = useState('');
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);

  const fetchPlatformStats = async () => {
    setIsLoading(true);
    try {
      // Fetch platform global stats
      const response = await fetch(`${API_BASE_URL}/admin/global-stats`);
      if (response.ok) {
        const data = await response.json();
        const allComps = data.companies || [];
        const active = allComps.filter((c: any) => c.verified && c.id !== 'vhop_official');
        
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          activeCompanies: active.length,
          totalEvents: data.events?.length || 0,
          grossRevenue: data.stats?.totalRevenue || 0
        });

        // Compute dynamic category distribution
        const categoryMap: Record<string, string> = {
          'DJ': 'DJ/Music',
          'Singer': 'Singers/Bands',
          'Band': 'Singers/Bands',
          'Comedian': 'Comedy',
          'Dancer': 'Dancers',
          'Instrumentalist': 'Instrumentalists',
          'Anchor': 'Anchors / MCs'
        };

        const colorsMap: Record<string, string> = {
          'DJ/Music': 'var(--violet-bright)',
          'Comedy': 'var(--accent-pink)',
          'Singers/Bands': 'var(--accent-cyan)',
        };

        const extraColors = [
          'var(--accent-gold)',
          '#10B981', // green
          '#3B82F6', // blue
          '#EC4899', // pink
          '#8B5CF6', // purple
        ];

        const counts: Record<string, number> = {
          'DJ/Music': 0,
          'Comedy': 0,
          'Singers/Bands': 0,
        };

        active.forEach((c: any) => {
          const rawCat = c.category || 'Other';
          const displayCat = categoryMap[rawCat] || rawCat;
          counts[displayCat] = (counts[displayCat] || 0) + 1;
        });

        const totalVerified = active.length;
        let colorIdx = 0;
        const dynamicPlatformData = Object.entries(counts)
          .filter(([name, val]) => val > 0 || ['DJ/Music', 'Comedy', 'Singers/Bands'].includes(name))
          .map(([name, val]) => {
            const color = colorsMap[name] || extraColors[colorIdx++ % extraColors.length];
            const percentage = totalVerified > 0 ? Math.round((val / totalVerified) * 100) : 0;
            return {
              name,
              value: val,
              percentage,
              color
            };
          });

        setPlatformData(dynamicPlatformData);
      }

      // Fetch pending verifications & edits
      const approvalsResponse = await fetch(`${API_BASE_URL}/superadmin/pending-approvals`);
      if (approvalsResponse.ok) {
        const approvalsData = await approvalsResponse.json();
        setPendingCompanies(approvalsData);
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchPlatformStats();
    }
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/approve-changes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        alert('Changes approved and verified successfully!');
        setSelectedCompany(null);
        fetchPlatformStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve changes.');
      }
    } catch (error) {
      console.error('Error approving changes:', error);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Reject and discard these changes?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/superadmin/reject-changes/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          alert('Changes rejected and cleared.');
          setSelectedCompany(null);
          fetchPlatformStats();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to reject changes.');
        }
      } catch (error) {
        console.error('Error rejecting changes:', error);
      }
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingArtist(true);
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/create-artist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newArtistName,
          email: newArtistEmail,
          password: newArtistPassword
        })
      });

      if (response.ok) {
        alert(`Artist account for "${newArtistName}" created successfully!`);
        setNewArtistName('');
        setNewArtistEmail('');
        setNewArtistPassword('');
        fetchPlatformStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create artist profile.');
      }
    } catch (error) {
      console.error('Error creating artist:', error);
      alert('Failed to create artist profile.');
    } finally {
      setIsCreatingArtist(false);
    }
  };

  if (!user || user.role !== 'superadmin') {
    return <AdminLogin forcedRole="superadmin" />;
  }

  if (isLoading && pendingCompanies.length === 0) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--violet-bright)]"></div>
        </div>
      </PageWrapper>
    );
  }

  // Helper to render Side-by-Side comparison rows
  const renderCompareRow = (fieldName: string, liveVal: any, pendingVal: any) => {
    const formatValue = (val: any) => {
      if (val === undefined || val === null) return 'N/A';
      if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'None';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    const liveStr = formatValue(liveVal);
    const pendingStr = formatValue(pendingVal);

    if (liveStr === pendingStr) return null; // Hide if unchanged

    return (
      <tr key={fieldName} className="border-b border-white/5 hover:bg-white/2 transition-colors">
        <td className="py-3 px-4 font-bold text-xs uppercase text-[var(--text-secondary)]">{fieldName}</td>
        <td className="py-3 px-4 text-xs text-red-400 bg-red-500/5 line-through max-w-[200px] truncate" title={liveStr}>
          {liveStr}
        </td>
        <td className="py-3 px-4 text-xs text-green-400 bg-green-500/5 font-semibold max-w-[200px] truncate animate-pulse" title={pendingStr}>
          {pendingStr}
        </td>
      </tr>
    );
  };

  const renderSocialCompare = () => {
    if (!selectedCompany?.pending_changes?.social_links) return null;
    const live = selectedCompany.social_links || {};
    const pending = selectedCompany.pending_changes.social_links || {};
    return (
      <>
        {renderCompareRow('Instagram', live.instagram, pending.instagram)}
        {renderCompareRow('YouTube Channel', live.youtube, pending.youtube)}
        {renderCompareRow('Spotify Artist Link', live.spotify, pending.spotify)}
      </>
    );
  };

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold">Platform Overview</h1>
            <p className="text-[var(--text-secondary)] font-medium">Super Admin Control Center • Goo Events Global</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={fetchPlatformStats}
              className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
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

        {/* Create Artist Form */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[var(--violet-bright)] animate-pulse" />
            <h3 className="text-xl font-bold font-display">Create Artist Admin Account</h3>
          </div>
          <form onSubmit={handleCreateArtist} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Artist/Stage Name</label>
              <input
                type="text"
                required
                value={newArtistName}
                onChange={(e) => setNewArtistName(e.target.value)}
                placeholder="e.g. DJ Shadow"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Login Email</label>
              <input
                type="email"
                required
                value={newArtistEmail}
                onChange={(e) => setNewArtistEmail(e.target.value)}
                placeholder="artist@gooevents.in"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Account Password</label>
              <input
                type="password"
                required
                value={newArtistPassword}
                onChange={(e) => setNewArtistPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--violet-bright)] focus:bg-white/10 outline-none transition-all text-sm text-white"
              />
            </div>
            <div>
              <GlowButton type="submit" isLoading={isCreatingArtist} className="w-full py-3.5 text-sm">
                Create Artist Profile
              </GlowButton>
            </div>
          </form>
        </GlassCard>

        {/* Verification requests */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-display font-bold">Artist Verification & Portfolio Requests</h3>
            <span className="bg-[var(--violet-primary)] px-3 py-1 rounded-full text-xs font-bold">{pendingCompanies.length} Pending Review</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <th className="pb-4 font-bold">Artist/Stage Name</th>
                  <th className="pb-4 font-bold">Category</th>
                  <th className="pb-4 font-bold">Request Type</th>
                  <th className="pb-4 font-bold">Start Price</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pendingCompanies.length > 0 ? pendingCompanies.map((row) => {
                  const isEdit = !!row.pending_changes;
                  return (
                    <tr key={row.id} className="border-b border-[var(--border-subtle)]/50 group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        <span>{row.name}</span>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[var(--text-muted)]">{row.city || 'No City'}</span>
                      </td>
                      <td className="py-4 text-[var(--text-secondary)] font-semibold text-[var(--violet-bright)]">{row.category || 'DJ'}</td>
                      <td className="py-4 font-semibold">
                        {isEdit ? (
                          <span className="bg-violet-500/10 text-[var(--violet-bright)] border border-violet-500/20 px-2 py-0.5 rounded-full text-xs">Portfolio Updates</span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs">Initial Verification</span>
                        )}
                      </td>
                      <td className="py-4 text-[var(--text-secondary)]">₹{(row.booking_price || 0).toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedCompany(row)}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review Portfolio
                          </button>
                          <button 
                            onClick={() => handleReject(row.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Reject/Discard"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleApprove(row.id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                            title="Approve/Merge"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--text-muted)] font-medium">No pending artist requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Charts & Distribution */}
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
                    <span className="text-sm text-[var(--text-muted)] ml-auto">{d.value} ({d.percentage || 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

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
                className="relative w-full max-w-3xl z-10"
              >
                <GlassCard className="p-8 border-[var(--violet-primary)]/40 shadow-glow max-h-[85vh] overflow-y-auto">
                  <header className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-display font-bold">{selectedCompany.name}</h2>
                        <span className="bg-[var(--violet-primary)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{selectedCompany.category || 'Artist'}</span>
                      </div>
                      <p className="text-[var(--text-muted)] font-medium">
                        {selectedCompany.pending_changes ? 'Side-by-Side Portfolio Updates Comparison' : 'Initial Portfolio Verification Request'}
                      </p>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-white/5 rounded-lg text-white font-bold text-lg">
                      X
                    </button>
                  </header>

                  {/* Edit Diff Side-by-Side Review */}
                  {selectedCompany.pending_changes ? (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-white/5 rounded-xl overflow-hidden">
                          <thead>
                            <tr className="bg-white/5 text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/10">
                              <th className="py-3 px-4 font-bold">Field</th>
                              <th className="py-3 px-4 font-bold text-red-400">Current Live Profile</th>
                              <th className="py-3 px-4 font-bold text-green-400">Proposed New Profile</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {renderCompareRow('Stage Name', selectedCompany.name, selectedCompany.pending_changes.name)}
                            {renderCompareRow('Category', selectedCompany.category, selectedCompany.pending_changes.category)}
                            {renderCompareRow('Genres', selectedCompany.genres, selectedCompany.pending_changes.genres)}
                            {renderCompareRow('Bio / Pitch', selectedCompany.description, selectedCompany.pending_changes.description)}
                            {renderCompareRow('Booking Price', selectedCompany.booking_price, selectedCompany.pending_changes.booking_price)}
                            {renderCompareRow('Phone', selectedCompany.phone, selectedCompany.pending_changes.phone)}
                            {renderCompareRow('Website', selectedCompany.website, selectedCompany.pending_changes.website)}
                            {renderCompareRow('UPI Payout', selectedCompany.payout_upi, selectedCompany.pending_changes.payout_upi)}
                            {renderCompareRow('Video Reel', selectedCompany.video_url, selectedCompany.pending_changes.video_url)}
                            {renderCompareRow('Manager Name', selectedCompany.manager_name, selectedCompany.pending_changes.manager_name)}
                            {renderCompareRow('Manager Phone', selectedCompany.manager_phone, selectedCompany.pending_changes.manager_phone)}
                            {renderCompareRow('Manager Email', selectedCompany.manager_email, selectedCompany.pending_changes.manager_email)}
                            {renderSocialCompare()}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Show list of proposed gallery urls if any */}
                      {selectedCompany.pending_changes.gallery_images && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">New Proposed Gallery Images</label>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedCompany.pending_changes.gallery_images.map((url: string, idx: number) => (
                              <img key={idx} src={getImageUrl(url)} alt="New Gallery Item" className="w-full aspect-square object-cover rounded-lg border border-white/10" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Initial verification modal view
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Hometown / City</label>
                            <p className="text-lg font-medium">{selectedCompany.city || 'Not provided'}</p>
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
                                <a href={selectedCompany.video_url} target="_blank" rel="noreferrer" className="hover:underline">Reel: {selectedCompany.video_url}</a>
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

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Biography & Experience</label>
                        <p className="text-[var(--text-secondary)] mt-2 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                          {selectedCompany.description || 'No description provided.'}
                        </p>
                      </div>

                      {selectedCompany.gallery_images && selectedCompany.gallery_images.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Gallery Images</label>
                          <div className="grid grid-cols-4 gap-2">
                            {selectedCompany.gallery_images.map((url: string, idx: number) => (
                              <img key={idx} src={getImageUrl(url)} alt="Gallery Item" className="w-full aspect-square object-cover rounded-lg border border-white/10" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <button 
                      onClick={() => handleReject(selectedCompany.id)}
                      className="flex-1 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all text-sm uppercase tracking-wider"
                    >
                      Reject / Discard Changes
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedCompany.id)}
                      className="flex-1 py-4 rounded-xl bg-green-500/10 text-green-500 font-bold border border-green-500/20 hover:bg-green-500/20 transition-all text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02]"
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
