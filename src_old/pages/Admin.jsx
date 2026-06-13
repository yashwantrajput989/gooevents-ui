import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Ticket, IndianRupee, Film, 
  Plus, Trash2, LayoutDashboard, Settings, 
  BarChart3, PlusCircle, X
} from 'lucide-react';
import API_BASE_URL from '../config';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShow, setNewShow] = useState({
    title: '', description: '', poster: '', backdrop: '',
    category: 'Concert', genre: '', rating: 8.0, language: 'English',
    price: 300, duration: '2h 30m', releaseDate: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, showsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats`),
        axios.get(`${API_BASE_URL}/shows`)
      ]);
      setStats(statsRes.data);
      setShows(showsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewShow(prev => ({ ...prev, [type]: res.data.url }));
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      const genresArray = newShow.genre.split(',').map(g => g.trim());
      await axios.post(`${API_BASE_URL}/shows`, {
        ...newShow,
        genre: genresArray
      });
      setShowAddModal(false);
      fetchAdminData();
      setNewShow({
        title: '', description: '', poster: '', backdrop: '',
        category: 'Movie', genre: '', rating: 8.0, language: 'English',
        price: 300, duration: '2h 30m', releaseDate: ''
      });
    } catch (err) {
      alert('Error adding show');
    }
  };

  if (loading) return <div className="loading">Initializing Dashboard...</div>;

  return (
    <div className="admin-page container">
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar glass card">
          <div className="sidebar-header">
            <LayoutDashboard size={20} />
            <span>Admin Panel</span>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} /> Overview
            </button>
            <button 
              className={activeTab === 'shows' ? 'active' : ''} 
              onClick={() => setActiveTab('shows')}
            >
              <Film size={18} /> Manage Shows
            </button>
            <button>
              <Users size={18} /> Users
            </button>
            <button>
              <Settings size={18} /> Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          {activeTab === 'overview' && (
            <div className="tab-overview fade-in">
              <h1 className="page-title">Dashboard <span className="gradient-text">Overview</span></h1>
              <div className="stats-grid">
                <div className="stat-card card glass">
                  <div className="stat-icon users"><Users /></div>
                  <div className="stat-info">
                    <span>Total Users</span>
                    <h3>{stats.totalUsers}</h3>
                  </div>
                </div>
                <div className="stat-card card glass">
                  <div className="stat-icon bookings"><Ticket /></div>
                  <div className="stat-info">
                    <span>Total Bookings</span>
                    <h3>{stats.totalBookings}</h3>
                  </div>
                </div>
                <div className="stat-card card glass">
                  <div className="stat-icon revenue"><IndianRupee /></div>
                  <div className="stat-info">
                    <span>Total Revenue</span>
                    <h3>₹{stats.totalRevenue}</h3>
                  </div>
                </div>
                <div className="stat-card card glass">
                  <div className="stat-icon shows"><Film /></div>
                  <div className="stat-info">
                    <span>Live Shows</span>
                    <h3>{stats.totalShows}</h3>
                  </div>
                </div>
              </div>
              
              <div className="recent-activity card glass">
                <h3>Recent Bookings</h3>
                <p className="placeholder-text">Detailed booking analytics coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'shows' && (
            <div className="tab-shows fade-in">
              <div className="section-header">
                <h1 className="page-title">Manage <span className="gradient-text">Shows</span></h1>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                  <PlusCircle size={18} /> Add New Show
                </button>
              </div>

              <div className="shows-list-container glass card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Show</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map(show => (
                      <tr key={show._id}>
                        <td>
                          <div className="table-show-info">
                            <img src={show.poster} alt="" />
                            <span>{show.title}</span>
                          </div>
                        </td>
                        <td>{show.category}</td>
                        <td>₹{show.price}</td>
                        <td>⭐ {show.rating}</td>
                        <td>
                          <button className="delete-btn"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Show Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass card fade-in">
            <div className="modal-header">
              <h2>Add New Experience</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddShow} className="add-show-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={newShow.title} onChange={e => setNewShow({...newShow, title: e.target.value})} required placeholder="Interstellar" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newShow.category} onChange={e => setNewShow({...newShow, category: e.target.value})}>
                    <option value="Concert">Concert</option>
                    <option value="Standup">Standup</option>
                    <option value="Open Mic">Open Mic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={newShow.price} onChange={e => setNewShow({...newShow, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input type="text" value={newShow.language} onChange={e => setNewShow({...newShow, language: e.target.value})} required />
                </div>
                <div className="form-group span-2">
                  <label>Description</label>
                  <textarea value={newShow.description} onChange={e => setNewShow({...newShow, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Poster Image</label>
                  <div className="upload-container glass">
                    <input type="file" onChange={e => handleFileUpload(e.target.files[0], 'poster')} accept="image/*" />
                    {newShow.poster && <img src={newShow.poster} className="upload-preview" alt="Poster Preview" />}
                  </div>
                </div>
                <div className="form-group">
                  <label>Backdrop Image</label>
                  <div className="upload-container glass">
                    <input type="file" onChange={e => handleFileUpload(e.target.files[0], 'backdrop')} accept="image/*" />
                    {newShow.backdrop && <img src={newShow.backdrop} className="upload-preview" alt="Backdrop Preview" />}
                  </div>
                </div>
                <div className="form-group">
                  <label>Genres (comma separated)</label>
                  <input type="text" value={newShow.genre} onChange={e => setNewShow({...newShow, genre: e.target.value})} placeholder="Soulful, Bollywood" />
                </div>
                <div className="form-group">
                  <label>Release Date</label>
                  <input type="date" value={newShow.releaseDate} onChange={e => setNewShow({...newShow, releaseDate: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-100 mt-24" disabled={isUploading}>
                {isUploading ? "Uploading Images..." : "Create Show"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
