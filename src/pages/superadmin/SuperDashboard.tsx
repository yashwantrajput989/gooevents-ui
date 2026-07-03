import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  Users, Sparkles, Calendar, IndianRupee, CheckCircle, XCircle, 
  RefreshCw, Eye, Plus, Edit2, Trash2, Mail, Phone 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { AdminLogin } from '../admin/AdminLogin';
import { GlowButton } from '../../components/ui/GlowButton';
import { API_BASE_URL, getImageUrl } from '../../config';

export const SuperDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'venues' | 'caterers' | 'decors' | 'lights' | 'consultations'>('overview');

  // Overview Stats & Lists
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

  // Create Artist Account fields
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistEmail, setNewArtistEmail] = useState('');
  const [newArtistPassword, setNewArtistPassword] = useState('');
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);

  // Wedding Inventory Database States
  const [weddingVenues, setWeddingVenues] = useState<any[]>([]);
  const [weddingCaterers, setWeddingCaterers] = useState<any[]>([]);
  const [weddingDecors, setWeddingDecors] = useState<any[]>([]);
  const [weddingLights, setWeddingLights] = useState<any[]>([]);
  const [weddingConsultations, setWeddingConsultations] = useState<any[]>([]);

  // Asset Dialog Modal Form Fields
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [modalAssetType, setModalAssetType] = useState<'venues' | 'caterers' | 'decors' | 'lights'>('venues');
  const [editingItem, setEditingItem] = useState<any>(null); // null = Add Mode, object = Edit Mode
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

  // Unified Form state
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('Mumbai');
  const [formCapacity, setFormCapacity] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formTier, setFormTier] = useState('Silver');
  
  // Caterer Specific
  const [formLunchMenu, setFormLunchMenu] = useState('');
  const [formDinnerMenu, setFormDinnerMenu] = useState('');
  const [formSnacksMenu, setFormSnacksMenu] = useState('');

  // Decor Specific
  const [formThemes, setFormThemes] = useState('');

  // Lights Specific
  const [formEquipment, setFormEquipment] = useState('');

  const fetchPlatformStats = async () => {
    setIsLoading(true);
    try {
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

        const categoryMap: Record<string, string> = {
          'DJ': 'DJ/Music',
          'Singer': 'Singers/Bands',
          'Band': 'Singers/Bands',
          'Comedian': 'Comedy'
        };

        const colorsMap: Record<string, string> = {
          'DJ/Music': 'var(--violet-bright)',
          'Comedy': 'var(--accent-pink)',
          'Singers/Bands': 'var(--accent-cyan)',
        };

        const extraColors = ['var(--accent-gold)', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
        const counts: Record<string, number> = { 'DJ/Music': 0, 'Comedy': 0, 'Singers/Bands': 0 };

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
            return { name, value: val, percentage, color };
          });

        setPlatformData(dynamicPlatformData);
      }

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

  const fetchWeddingData = async () => {
    try {
      const [venuesRes, caterersRes, decorsRes, lightsRes, consultationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/wedding/venues`),
        fetch(`${API_BASE_URL}/admin/wedding/caterers`),
        fetch(`${API_BASE_URL}/admin/wedding/decors`),
        fetch(`${API_BASE_URL}/admin/wedding/lights`),
        fetch(`${API_BASE_URL}/admin/wedding/consultations`)
      ]);
      if (venuesRes.ok) setWeddingVenues(await venuesRes.json());
      if (caterersRes.ok) setWeddingCaterers(await caterersRes.json());
      if (decorsRes.ok) setWeddingDecors(await decorsRes.json());
      if (lightsRes.ok) setWeddingLights(await lightsRes.json());
      if (consultationsRes.ok) setWeddingConsultations(await consultationsRes.json());
    } catch (e) {
      console.error("Fetch wedding inventory error:", e);
    }
  };

  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchPlatformStats();
      fetchWeddingData();
    }
  }, [user]);

  const handleRefreshAll = () => {
    fetchPlatformStats();
    fetchWeddingData();
  };

  // Create Artist Account Submit
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
        alert('Artist admin account created successfully!');
        setNewArtistName('');
        setNewArtistEmail('');
        setNewArtistPassword('');
        fetchPlatformStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create artist.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsCreatingArtist(false);
    }
  };

  // Approve/Reject Verifications
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
          alert('Changes discarded.');
          setSelectedCompany(null);
          fetchPlatformStats();
        } else {
          alert('Failed to discard changes.');
        }
      } catch (error) {
        console.error('Error rejecting changes:', error);
      }
    }
  };

  // Open Add/Edit Dialog Asset Modal
  const openAssetModal = (type: 'venues' | 'caterers' | 'decors' | 'lights', item: any = null) => {
    setModalAssetType(type);
    setEditingItem(item);
    
    if (item) {
      setFormName(item.name || '');
      setFormCity(item.city || 'Mumbai');
      setFormCapacity(item.capacity ? String(item.capacity) : '');
      setFormPrice(item.price ? String(item.price) : item.price_per_plate ? String(item.price_per_plate) : '');
      setFormDescription(item.description || '');
      setFormCoverImage(item.cover_image || '');
      setFormTier(item.tier || 'Silver');
      
      // Spec fields
      setFormLunchMenu(item.lunch_menu ? item.lunch_menu.join(', ') : '');
      setFormDinnerMenu(item.dinner_menu ? item.dinner_menu.join(', ') : '');
      setFormSnacksMenu(item.snacks_menu ? item.snacks_menu.join(', ') : '');
      setFormThemes(item.themes ? item.themes.join(', ') : '');
      setFormEquipment(item.equipment ? item.equipment.join(', ') : '');
    } else {
      setFormName('');
      setFormCity('Mumbai');
      setFormCapacity('');
      setFormPrice('');
      setFormDescription('');
      setFormCoverImage('');
      setFormTier('Silver');
      setFormLunchMenu('');
      setFormDinnerMenu('');
      setFormSnacksMenu('');
      setFormThemes('');
      setFormEquipment('');
    }
    
    setIsAssetModalOpen(true);
  };

  // Handle Asset creation or update submission
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAsset(true);

    const isEdit = !!editingItem;
    const urlSuffix = isEdit ? `/${editingItem.id}` : '';
    const method = isEdit ? 'PUT' : 'POST';

    // Parse array specs
    const lunchArr = formLunchMenu.split(',').map(s => s.trim()).filter(Boolean);
    const dinnerArr = formDinnerMenu.split(',').map(s => s.trim()).filter(Boolean);
    const snacksArr = formSnacksMenu.split(',').map(s => s.trim()).filter(Boolean);
    const themesArr = formThemes.split(',').map(s => s.trim()).filter(Boolean);
    const equipmentArr = formEquipment.split(',').map(s => s.trim()).filter(Boolean);

    const payload: any = {
      name: formName,
      tier: formTier,
      description: formDescription,
      cover_image: formCoverImage
    };

    if (modalAssetType === 'venues') {
      payload.city = formCity;
      payload.capacity = parseInt(formCapacity) || 300;
      payload.price = parseFloat(formPrice) || 0;
    } else if (modalAssetType === 'caterers') {
      payload.city = formCity;
      payload.price_per_plate = parseFloat(formPrice) || 500;
      payload.lunch_menu = lunchArr;
      payload.dinner_menu = dinnerArr;
      payload.snacks_menu = snacksArr;
    } else if (modalAssetType === 'decors') {
      payload.price = parseFloat(formPrice) || 10000;
      payload.themes = themesArr;
    } else if (modalAssetType === 'lights') {
      payload.price = parseFloat(formPrice) || 5000;
      payload.equipment = equipmentArr;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/wedding/${modalAssetType}${urlSuffix}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`${modalAssetType.slice(0, -1)} ${isEdit ? 'updated' : 'created'} successfully!`);
        setIsAssetModalOpen(false);
        fetchWeddingData();
      } else {
        alert('Failed to save wedding asset.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  // Delete Wedding Asset
  const handleDeleteAsset = async (type: 'venues' | 'caterers' | 'decors' | 'lights', id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/wedding/${type}/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          alert('Asset deleted successfully.');
          fetchWeddingData();
        } else {
          alert('Failed to delete asset.');
        }
      } catch (err) {
        console.error(err);
        alert('Network error.');
      }
    }
  };

  // Helper comparison diff row for reviews
  const renderCompareRow = (fieldName: string, liveVal: any, pendingVal: any) => {
    const formatValue = (val: any) => {
      if (val === undefined || val === null) return 'N/A';
      if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'None';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };
    const liveStr = formatValue(liveVal);
    const pendingStr = formatValue(pendingVal);
    if (liveStr === pendingStr) return null;
    return (
      <tr key={fieldName} className="border-b border-white/5 hover:bg-white/2 transition-colors">
        <td className="py-3 px-4 font-bold text-xs uppercase text-[var(--text-secondary)]">{fieldName}</td>
        <td className="py-3 px-4 text-xs text-red-400 bg-red-500/5 line-through max-w-[200px] truncate" title={liveStr}>{liveStr}</td>
        <td className="py-3 px-4 text-xs text-green-400 bg-green-500/5 font-semibold max-w-[200px] truncate animate-pulse" title={pendingStr}>{pendingStr}</td>
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

  return (
    <PageWrapper>
      <div className="space-y-8 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-white">Super Admin Dashboard</h1>
            <p className="text-[var(--text-secondary)] font-medium">Control Center • Wedding Planner & Creator Management</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleRefreshAll}
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs flex items-center gap-2 transition-colors uppercase tracking-wider text-white"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Refresh Data
            </button>
          </div>
        </header>

        {/* Dynamic Tab Bar */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full overflow-x-auto scrollbar-none gap-2">
          {[
            { key: 'overview', label: 'Overview Dashboard' },
            { key: 'venues', label: 'Wedding Venues' },
            { key: 'caterers', label: 'Catering Services' },
            { key: 'decors', label: 'Decor Packages' },
            { key: 'lights', label: 'Lights & sound' },
            { key: 'consultations', label: 'Consultation Requests' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === t.key 
                  ? 'bg-[var(--violet-primary)] text-white shadow-glow' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
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
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">{kpi.label}</p>
                    <h3 className="text-3xl font-display font-black mt-1 text-white">{kpi.value}</h3>
                  </GlassCard>
                ))}
              </div>

              {/* Create Artist Form */}
              <GlassCard className="p-8 border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-[var(--violet-bright)]" />
                  <h3 className="text-lg font-bold font-display text-white">Create Artist Admin Account</h3>
                </div>
                <form onSubmit={handleCreateArtist} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Artist/Stage Name</label>
                    <input
                      type="text" required value={newArtistName}
                      onChange={(e) => setNewArtistName(e.target.value)}
                      placeholder="e.g. DJ Shadow"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Login Email</label>
                    <input
                      type="email" required value={newArtistEmail}
                      onChange={(e) => setNewArtistEmail(e.target.value)}
                      placeholder="artist@gooevents.in"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Account Password</label>
                    <input
                      type="password" required value={newArtistPassword}
                      onChange={(e) => setNewArtistPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>
                  <div>
                    <GlowButton type="submit" isLoading={isCreatingArtist} className="w-full py-3 text-xs uppercase tracking-wider font-bold">
                      Create Artist Profile
                    </GlowButton>
                  </div>
                </form>
              </GlassCard>

              {/* Verification Requests */}
              <GlassCard className="p-8 border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold font-display text-white">Artist verifications & Edits</h3>
                  <span className="bg-[var(--violet-primary)] px-3 py-1 rounded-full text-xs font-bold text-white">{pendingCompanies.length} Pending</span>
                </div>
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3 font-bold">Artist Name</th>
                        <th className="pb-3 font-bold">Category</th>
                        <th className="pb-3 font-bold">Type</th>
                        <th className="pb-3 font-bold">Price Quote</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {pendingCompanies.length > 0 ? pendingCompanies.map((row) => {
                        const isEdit = !!row.pending_changes;
                        return (
                          <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 font-bold">
                              {row.name} <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[var(--text-muted)] font-medium ml-2">{row.city}</span>
                            </td>
                            <td className="py-4 font-bold text-[var(--violet-bright)]">{row.category}</td>
                            <td className="py-4 font-bold">
                              {isEdit 
                                ? <span className="bg-violet-500/10 text-[var(--violet-bright)] px-2 py-0.5 rounded border border-violet-500/20">Portfolio Edit</span>
                                : <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">New Profile</span>
                              }
                            </td>
                            <td className="py-4 font-bold text-white">₹{(row.booking_price || 0).toLocaleString()}</td>
                            <td className="py-4">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedCompany(row)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold flex items-center gap-1 text-white">
                                  <Eye className="w-3 h-3" /> Review
                                </button>
                                <button onClick={() => handleApprove(row.id)} className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleReject(row.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">No pending verifications.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Charts & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-6">
                  <h3 className="text-md font-bold font-display text-white mb-6">Performance</h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                        <Tooltip contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-between">
                  <h3 className="text-md font-bold font-display text-white mb-6">Category Ratio</h3>
                  <div className="h-[200px] w-full flex items-center justify-center gap-4">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={platformData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                            {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2.5">
                      {platformData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-[var(--text-secondary)] font-medium truncate max-w-[80px]">{d.name}</span>
                          <span className="text-white font-bold ml-auto">{d.value} ({d.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* TAB 2: WEDDING VENUES */}
          {activeTab === 'venues' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-display text-white">Manage Wedding Venues / Convention Centers</h2>
                <GlowButton onClick={() => openAssetModal('venues')} className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Venue
                </GlowButton>
              </div>

              <GlassCard className="p-6 border-white/5">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3">Venue Name</th>
                        <th className="pb-3">City</th>
                        <th className="pb-3">Capacity</th>
                        <th className="pb-3">Price / Hour</th>
                        <th className="pb-3">Tier</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {weddingVenues.map(v => (
                        <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white">{v.name}</td>
                          <td className="py-3 text-[var(--text-secondary)] font-medium">{v.city}</td>
                          <td className="py-3 text-[var(--text-secondary)] font-medium">{v.capacity} Pax</td>
                          <td className="py-3 text-white font-bold">₹{v.price?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase">{v.tier}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openAssetModal('venues', v)} className="p-1.5 hover:bg-white/5 text-[var(--text-secondary)] hover:text-white rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteAsset('venues', v.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 3: WEDDING CATERERS */}
          {activeTab === 'caterers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-display text-white">Manage Catering & Menus</h2>
                <GlowButton onClick={() => openAssetModal('caterers')} className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Caterer
                </GlowButton>
              </div>

              <GlassCard className="p-6 border-white/5">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3">Caterer Name</th>
                        <th className="pb-3">City</th>
                        <th className="pb-3">Price / Plate</th>
                        <th className="pb-3">Tier</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {weddingCaterers.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white">{c.name}</td>
                          <td className="py-3 text-[var(--text-secondary)] font-medium">{c.city || 'Mumbai'}</td>
                          <td className="py-3 text-white font-bold">₹{c.price_per_plate}/plate</td>
                          <td className="py-3">
                            <span className="text-[9px] bg-violet-500/10 text-[var(--violet-bright)] border border-violet-500/20 px-2 py-0.5 rounded font-bold uppercase">{c.tier}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openAssetModal('caterers', c)} className="p-1.5 hover:bg-white/5 text-[var(--text-secondary)] hover:text-white rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteAsset('caterers', c.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 4: WEDDING DECORS */}
          {activeTab === 'decors' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-display text-white">Manage Decoration & Themes</h2>
                <GlowButton onClick={() => openAssetModal('decors')} className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Decor Package
                </GlowButton>
              </div>

              <GlassCard className="p-6 border-white/5">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3">Theme/Setup Name</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Package Cost</th>
                        <th className="pb-3">Tier</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {weddingDecors.map(d => (
                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white">{d.name}</td>
                          <td className="py-3 text-[var(--text-secondary)] font-medium max-w-xs truncate">{d.description}</td>
                          <td className="py-3 text-white font-bold">₹{d.price?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="text-[9px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-bold uppercase">{d.tier}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openAssetModal('decors', d)} className="p-1.5 hover:bg-white/5 text-[var(--text-secondary)] hover:text-white rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteAsset('decors', d.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 5: LIGHTS & AUDIO */}
          {activeTab === 'lights' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-display text-white">Manage Lights & sound Production</h2>
                <GlowButton onClick={() => openAssetModal('lights')} className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Production Setup
                </GlowButton>
              </div>

              <GlassCard className="p-6 border-white/5">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3">Setup Name</th>
                        <th className="pb-3">Equipment Count</th>
                        <th className="pb-3">Setup Price</th>
                        <th className="pb-3">Tier</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {weddingLights.map(l => (
                        <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold text-white">{l.name}</td>
                          <td className="py-3 text-[var(--text-secondary)] font-medium">{l.equipment?.length || 0} items</td>
                          <td className="py-3 text-white font-bold">₹{l.price?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">{l.tier}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openAssetModal('lights', l)} className="p-1.5 hover:bg-white/5 text-[var(--text-secondary)] hover:text-white rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteAsset('lights', l.id)} className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 6: CONSULTATIONS */}
          {activeTab === 'consultations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold font-display text-white">Personal Wedding Consultant Requests</h2>
              
              <GlassCard className="p-6 border-white/5">
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-white/5">
                        <th className="pb-3">Client details</th>
                        <th className="pb-3">Wedding Date</th>
                        <th className="pb-3">Budget Range</th>
                        <th className="pb-3">Special Notes</th>
                        <th className="pb-3">Booked At</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {weddingConsultations.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 space-y-1">
                            <div className="font-bold text-white text-sm">{c.name}</div>
                            <div className="flex gap-4 text-[10px] text-[var(--text-muted)] font-medium">
                              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-white">{c.wedding_date}</td>
                          <td className="py-4">
                            <span className="text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-bold">{c.estimated_budget}</span>
                          </td>
                          <td className="py-4 text-[var(--text-secondary)] font-medium max-w-xs truncate" title={c.notes}>{c.notes || 'No requests'}</td>
                          <td className="py-4 text-[var(--text-muted)]">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {weddingConsultations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">No wedding consultant requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>

        {/* --- ADD / EDIT ASSET FORM MODAL DIALOG --- */}
        <AnimatePresence>
          {isAssetModalOpen && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAssetModalOpen(false)} />
              
              <GlassCard className="relative z-10 w-full max-w-lg p-6 md:p-8 space-y-6 border-[var(--violet-primary)]/20 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto scrollbar-none">
                <button onClick={() => setIsAssetModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>

                <div className="space-y-1">
                  <h3 className="text-xl font-display font-extrabold text-white">
                    {editingItem ? 'Edit' : 'Add New'} {modalAssetType.slice(0, -1).toUpperCase()}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">Save details to target tier matching catalog directories.</p>
                </div>

                <form onSubmit={handleAssetSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Asset Name</label>
                    <input 
                      type="text" required value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Traditional Banquet, Gourmet Catering"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Tier Tag</label>
                      <select 
                        value={formTier} onChange={(e) => setFormTier(e.target.value)}
                        className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      >
                        <option value="Silver">Silver Plan</option>
                        <option value="Gold">Gold Plan</option>
                        <option value="Platinum">Platinum Plan</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {modalAssetType === 'caterers' ? 'Plate Price (₹)' : 'Booking Cost (₹)'}
                      </label>
                      <input 
                        type="number" required value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      />
                    </div>
                  </div>

                  {modalAssetType === 'venues' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">City</label>
                        <select 
                          value={formCity} onChange={(e) => setFormCity(e.target.value)}
                          className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        >
                          <option value="Mumbai">Mumbai</option>
                          <option value="Visakhapatnam">Visakhapatnam</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Hyderabad">Hyderabad</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Capacity (Pax)</label>
                        <input 
                          type="number" required value={formCapacity}
                          onChange={(e) => setFormCapacity(e.target.value)}
                          placeholder="e.g. 350"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {modalAssetType === 'caterers' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">City Location</label>
                        <select 
                          value={formCity} onChange={(e) => setFormCity(e.target.value)}
                          className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        >
                          <option value="Mumbai">Mumbai</option>
                          <option value="Visakhapatnam">Visakhapatnam</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Hyderabad">Hyderabad</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Lunch Menu (comma-separated)</label>
                        <input 
                          type="text" value={formLunchMenu}
                          onChange={(e) => setFormLunchMenu(e.target.value)}
                          placeholder="Paneer butter masala, Jeera Rice, Dal"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Dinner Menu (comma-separated)</label>
                        <input 
                          type="text" value={formDinnerMenu}
                          onChange={(e) => setFormDinnerMenu(e.target.value)}
                          placeholder="exotic sizzling veg, live counter, ice cream"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Snacks Menu (comma-separated)</label>
                        <input 
                          type="text" value={formSnacksMenu}
                          onChange={(e) => setFormSnacksMenu(e.target.value)}
                          placeholder="Pakora, filter coffee, tea"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                        />
                      </div>
                    </>
                  )}

                  {modalAssetType === 'decors' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Themes (comma-separated)</label>
                      <input 
                        type="text" value={formThemes}
                        onChange={(e) => setFormThemes(e.target.value)}
                        placeholder="Traditional Floral, Chandelier canopy"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      />
                    </div>
                  )}

                  {modalAssetType === 'lights' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Equipment Components (comma-separated)</label>
                      <input 
                        type="text" value={formEquipment}
                        onChange={(e) => setFormEquipment(e.target.value)}
                        placeholder="2x JBL Speakers, Intelligent Light Consoles"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Description</label>
                    <textarea 
                      rows={3} required value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe the asset quality, dimensions, materials, or brands..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Cover Image URL</label>
                    <input 
                      type="url" value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--violet-bright)] text-xs text-white"
                    />
                  </div>

                  <GlowButton type="submit" isLoading={isSubmittingAsset} className="w-full py-3.5 text-xs font-bold uppercase tracking-wider">
                    {editingItem ? 'Save Updates' : 'Publish Asset'}
                  </GlowButton>
                </form>
              </GlassCard>
            </div>
          )}
        </AnimatePresence>

        {/* Portfolio Review Modal */}
        <AnimatePresence>
          {selectedCompany && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedCompany(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-3xl z-10"
              >
                <GlassCard className="p-8 border-[var(--violet-primary)]/40 shadow-glow max-h-[85vh] overflow-y-auto scrollbar-none">
                  <header className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white">{selectedCompany.name}</h2>
                        <span className="bg-[var(--violet-primary)] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{selectedCompany.category || 'Artist'}</span>
                      </div>
                      <p className="text-[var(--text-muted)] font-medium mt-1">
                        {selectedCompany.pending_changes ? 'Side-by-Side Portfolio Updates Comparison' : 'Initial Portfolio Verification Request'}
                      </p>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-white/5 rounded-lg text-white font-bold text-sm">
                      Close
                    </button>
                  </header>

                  {selectedCompany.pending_changes ? (
                    <div className="space-y-6">
                      <div className="overflow-x-auto scrollbar-none">
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Hometown / City</label>
                            <p className="text-sm font-medium text-white">{selectedCompany.city || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Contact Details</label>
                            <p className="text-xs font-medium text-white">{selectedCompany.contact_email}</p>
                            <p className="text-xs text-[var(--text-muted)]">{selectedCompany.phone || 'No phone'}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Starting Quote</label>
                            <p className="text-sm font-bold text-[var(--violet-bright)]">₹{(selectedCompany.booking_price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Genres</label>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {selectedCompany.genres && selectedCompany.genres.map((g: string, i: number) => (
                                <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white font-medium">{g}</span>
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
                        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
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
                      className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all text-xs uppercase tracking-wider"
                    >
                      Reject Changes
                    </button>
                    <button 
                      onClick={() => handleApprove(selectedCompany.id)}
                      className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-500 font-bold border border-green-500/20 hover:bg-green-500/20 transition-all text-xs uppercase tracking-wider"
                    >
                      Approve & Verify
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
