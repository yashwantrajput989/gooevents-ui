import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/ui/AuthModal';
import { Events } from './pages/user/Events';
import { Activity } from './pages/user/Activity';
import { Profile } from './pages/user/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CreateEvent } from './pages/admin/CreateEvent';
import { SuperDashboard } from './pages/superadmin/SuperDashboard';
import { AdminSettings } from './pages/admin/AdminSettings';
import { GuestList } from './pages/admin/GuestList';
import { AdminLogin } from './pages/admin/AdminLogin';

import { EventDetails } from './pages/user/EventDetails';
import { Dashboard } from './pages/user/Dashboard';
import { Artists } from './pages/user/Artists';
import { ArtistDetails } from './pages/user/ArtistDetails';
import { Organize } from './pages/user/Organize';
import { ArtistOnboarding } from './pages/user/ArtistOnboarding';
import { OpenMics } from './pages/user/OpenMics';

import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import ScrollToTop from './components/utils/ScrollToTop';

function App() {
  const location = useLocation();
  const { initialize, user } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    initialize();
    // Force scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, [initialize]);

  // Global redirect when user logs in
  useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const isAdminPath = location.pathname.startsWith('/admin');
  const isSuperAdminPath = location.pathname.startsWith('/superadmin');

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
      {/* Loading screen removed for faster transitions */}

      <ScrollToTop />
      {/* Sidebar for desktop - only show for non-admin or verified admin paths */}
      {!isAdminPath && !isSuperAdminPath && <Sidebar isAdmin={false} />}
      { (isAdminPath || isSuperAdminPath) && user?.role === 'admin' && location.pathname !== '/admin/login' && <Sidebar isAdmin={true} />}
      
      {/* Navbar for mobile and top-level desktop - HIDE for admin */}
      {!isAdminPath && !isSuperAdminPath && <Navbar />}

      <main className={`flex-1 relative ${isAdminPath || isSuperAdminPath ? 'w-full' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* User Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/organize" element={<Organize />} />
            <Route path="/artist-onboarding" element={<ArtistOnboarding />} />
            <Route path="/openmics" element={<OpenMics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistDetails />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/admin/edit-event/:id" element={<CreateEvent />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/guests" element={<GuestList />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Super Admin Routes */}
            <Route path="/superadmin" element={<SuperDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <AuthModal />
    </div>
  );
}

export default App;
