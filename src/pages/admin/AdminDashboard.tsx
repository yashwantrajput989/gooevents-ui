import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { GlassCard } from '../../components/ui/GlassCard';
import { 
  Ticket, IndianRupee, Plus, Pencil, Trash2, 
  ShieldAlert, Calendar, ChevronLeft, ChevronRight, ShieldCheck, X, 
  Bell, Settings, Utensils, Warehouse, MapPin, Sparkles, Sliders,
  Camera, Upload, FileText, Check, ChevronDown, Clock, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlowButton } from '../../components/ui/GlowButton';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL, getImageUrl } from '../../config';
import { AdminLogin } from './AdminLogin';

// Custom inline SVG icons for Categories to look exact and high-fidelity
const SingerIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6 6 0 0 0 6-6v-3.5a6 6 0 1 0-12 0v3.5a6 6 0 0 0 6 6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5v3.5m-3 0h6" />
  </svg>
);

const DJIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const BandIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GuitaristIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0-3 3m10-15 4-4m-6.5 6.5L16 4m-4.5 4.5 2.5-2.5m-6.5 6.5 2-2" />
  </svg>
);

const ProducerIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M4 14h16M7 7v6m5-3v6m5-9v6" />
  </svg>
);

const RapperIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2m7 9v3m-4 0h8" />
  </svg>
);

const HostIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V2m0 20v-4m-8-2v-4m16 4v-4M8 6h8" />
  </svg>
);

const InstrumentalistIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DancerIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c1 0 2-.9 2-2s-1-2-2-2-2 .9-2 2 1 2 2 2Zm-2 16h4M7 9h10m-8 3 3 8m2-8-3 8" />
  </svg>
);

const OtherIcon = () => (
  <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

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

  // Artist Wizard / Dashboard Custom States
  const [artistActiveTab, setArtistActiveTab] = useState<'dashboard' | 'bookings' | 'inbox' | 'profile'>('dashboard');
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [editorStep, setEditorStep] = useState(1);
  
  // Custom Fields for Artist Portfolio Editor
  const [formTagline, setFormTagline] = useState('');
  const [formProfilePhoto, setFormProfilePhoto] = useState('');
  const [formState, setFormState] = useState('Andhra Pradesh');
  const [formCountry, setFormCountry] = useState('India');
  const [formLanguages, setFormLanguages] = useState<string[]>(['English', 'Telugu', 'Hindi']);
  const [formMainCategory, setFormMainCategory] = useState('Guitarist');
  const [formSubcategories, setFormSubcategories] = useState<string[]>(['Indie', 'Acoustic']);
  const [formGenresList, setFormGenresList] = useState<string[]>(['Rock', 'Pop', 'Indie']);
  const [formEventTypes, setFormEventTypes] = useState<string[]>(['Weddings', 'Club Shows', 'Corporate', 'Colleges', 'Private Parties', 'Festivals', 'Birthdays', 'Cafes', 'Live Concerts']);
  const [formPriceLevels, setFormPriceLevels] = useState<{ label: string, price: number }[]>([
    { label: 'Solo Performance', price: 15000 },
    { label: 'Duo Performance', price: 30000 },
    { label: 'Band Performance', price: 60000 },
    { label: 'Corporate Event', price: 120000 },
    { label: 'Wedding Event', price: 90000 }
  ]);
  const [formTravelIncluded, setFormTravelIncluded] = useState(true);
  const [formAccommodationRequired, setFormAccommodationRequired] = useState(true);
  
  // Showcase Gallery
  const [formGalleryMedia, setFormGalleryMedia] = useState<{ type: 'photos' | 'videos' | 'reels', url: string }[]>([
    { type: 'photos', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000' },
    { type: 'photos', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000' },
    { type: 'photos', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000' }
  ]);
  const [formGalleryTab, setFormGalleryTab] = useState<'photos' | 'videos' | 'reels'>('photos');

  // Press Kit Docs
  const [formPressKitDocs, setFormPressKitDocs] = useState<{ name: string, size: string, url: string }[]>([
    { name: 'Artist Bio.pdf', size: '2.4 MB', url: '#' },
    { name: 'Tech Rider.pdf', size: '1.8 MB', url: '#' },
    { name: 'Stage Plot.pdf', size: '1.2 MB', url: '#' },
    { name: 'High Res Photos.zip', size: '10.6 MB', url: '#' },
    { name: 'Logo.png', size: '500 KB', url: '#' }
  ]);

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

            // Load rich social metadata
            const social = prof.social_links || {};
            setFormTagline(social.tagline || '');
            setFormProfilePhoto(social.profile_photo || prof.cover_image || '');
            setFormState(social.state || 'Andhra Pradesh');
            setFormCountry(social.country || 'India');
            if (social.languages) setFormLanguages(social.languages);
            setFormMainCategory(prof.category || 'Guitarist');
            if (social.subcategories) setFormSubcategories(social.subcategories);
            if (prof.genres && prof.genres.length > 0) setFormGenresList(prof.genres);
            if (social.event_types) setFormEventTypes(social.event_types);
            if (social.price_levels) setFormPriceLevels(social.price_levels);
            if (social.travel_included !== undefined) setFormTravelIncluded(social.travel_included);
            if (social.accommodation_required !== undefined) setFormAccommodationRequired(social.accommodation_required);
            if (social.gallery_media) setFormGalleryMedia(social.gallery_media);
            if (social.press_kit_docs) setFormPressKitDocs(social.press_kit_docs);
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

  // Submit rich Artist Portfolio edits (from onboarding wizard)
  const handleSaveArtistPortfolio = async () => {
    if (!profile) return;
    setIsSavingSettings(true);

    const payload = {
      name: formName || profile.name,
      description: formDescription || profile.description,
      cover_image: formCoverImage || profile.cover_image,
      city: formCity || profile.city,
      contact_email: formContactEmail || profile.contact_email,
      phone: formPhone || profile.phone,
      website: formWebsite || profile.website,
      genres: formGenresList,
      gallery_images: formGalleryMedia.filter(m => m.type === 'photos').map(m => m.url),
      video_url: formVideoUrl || profile.video_url,
      booking_price: parseFloat(formPrice) || parseFloat(profile.booking_price) || 0,
      social_links: {
        instagram: formWebsite,
        youtube: formVideoUrl,
        spotify: formWebsite,
        tagline: formTagline,
        profile_photo: formProfilePhoto,
        state: formState,
        country: formCountry,
        languages: formLanguages,
        subcategories: formSubcategories,
        event_types: formEventTypes,
        price_levels: formPriceLevels,
        travel_included: formTravelIncluded,
        accommodation_required: formAccommodationRequired,
        gallery_media: formGalleryMedia,
        press_kit_docs: formPressKitDocs
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/artist/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Portfolio saved successfully!');
        setIsEditingPortfolio(false);
        fetchDashboardData();
      } else {
        alert('Failed to save portfolio.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Submit verification request for artist approval
  const handleSubmitForApproval = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/artist/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verified: false // Set to false to trigger Super Admin review queue
        })
      });
      if (response.ok) {
        alert('Portfolio submitted for Superadmin verification review. This typically takes up to 24 hours.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7a00]"></div>
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

  // ----------------------------------------------------
  // BESPOKE ARTIST VIEW (EXACTLY MATCHING THE MOCKUPS)
  // ----------------------------------------------------
  if (adminType === 'artist') {
    
    // Calculates profile completion percentage based on fields filled
    const calculateCompletion = () => {
      let score = 0;
      if (formName) score += 15;
      if (formTagline) score += 15;
      if (formDescription) score += 15;
      if (formProfilePhoto) score += 15;
      if (formCoverImage) score += 10;
      if (formGenresList.length > 0) score += 10;
      if (formEventTypes.length > 0) score += 10;
      if (formGalleryMedia.length > 0) score += 5;
      if (formPressKitDocs.length > 0) score += 5;
      return Math.min(100, score);
    };

    const completionPercent = calculateCompletion();

    return (
      <PageWrapper className="pb-24">
        {/* Verification banner if needed */}
        {!isEmailVerified && (
          <div className="p-4 mx-4 md:mx-auto max-w-6xl rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-bold text-xs">Verify Email Address</h4>
                <p className="text-[10px] text-red-200/80 mt-0.5">
                  Verify your email <span className="font-bold text-white">{user.email}</span> to secure operations.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setIsVerifyingEmail(true); handleSendOtp(); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-bold"
            >
              Verify Now
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: MAIN DASHBOARD CARD & QUICK ACTIONS (Screen 1 Layout) */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 border-white/5 bg-[#121214] rounded-[2rem] hover:scale-100 hover:translate-y-0">
              {/* Profile Block */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff7a00] shrink-0 bg-black">
                  <img 
                    src={getImageUrl(formProfilePhoto || formCoverImage)} 
                    alt={formName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Welcome back,</p>
                  <h2 className="text-xl font-display font-black text-white leading-tight">{formName || 'Artist Partner'}</h2>
                  {isVerified ? (
                    <div className="flex items-center gap-1 text-[#ff7a00] text-[10px] font-extrabold mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#ff7a00] flex items-center justify-center text-black">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>Verified Artist</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] font-extrabold mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending Verification</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Completion Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Profile Completion</span>
                  <span className="text-[#ff7a00]">{completionPercent}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff7a00]" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => { setIsEditingPortfolio(true); setEditorStep(1); }}
                  className="w-full py-3 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,122,0,0.2)] cursor-pointer"
                >
                  Edit Portfolio
                </button>
                <button 
                  onClick={() => profile && window.open(`/artists/${profile.id}`, '_blank')}
                  className="w-full py-3 bg-transparent hover:bg-white/5 border border-zinc-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Preview Public Profile
                </button>
                <button 
                  onClick={handleSubmitForApproval}
                  disabled={isVerified}
                  className="w-full py-3 bg-transparent hover:bg-white/5 border border-zinc-800 text-zinc-400 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isVerified ? 'Approved Profile' : 'Submit for Approval'}
                </button>
              </div>

              {/* Portfolio Status */}
              <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#ff7a00]/10 text-[#ff7a00] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#ff7a00]">
                    {isVerified ? 'Profile Live' : 'Under Review'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {isVerified 
                      ? 'Your artist profile is currently verified and live in public listings.' 
                      : "We'll notify you once your profile is approved."}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions Card */}
            <GlassCard className="p-6 border-white/5 bg-[#121214] rounded-[2rem] hover:scale-100 hover:translate-y-0">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Update Availability', action: () => { setIsEditingPortfolio(false); setArtistActiveTab('profile'); } },
                  { label: 'Add New Media', action: () => { setIsEditingPortfolio(true); setEditorStep(5); } },
                  { label: 'Update Pricing', action: () => { setIsEditingPortfolio(true); setEditorStep(4); } },
                  { label: 'View Analytics', action: () => { setIsEditingPortfolio(false); setArtistActiveTab('dashboard'); } }
                ].map((act, i) => (
                  <button 
                    key={i} 
                    onClick={act.action}
                    className="w-full p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 text-left flex justify-between items-center transition-colors cursor-pointer text-xs font-semibold text-white"
                  >
                    <span>{act.label}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* RIGHT PANEL: MAIN VIEW / ACTIVE SUB-VIEW / PORTFOLIO WIZARD */}
          <div className="lg:col-span-8">
            
            {/* PORTFOLIO EDITOR WIZARD IF ACTIVE */}
            {isEditingPortfolio ? (
              <GlassCard className="p-8 border-white/5 bg-[#121214] rounded-[2rem] hover:scale-100 hover:translate-y-0 space-y-6">
                
                {/* Wizard Header */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsEditingPortfolio(false)} 
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-display font-black text-white">
                      {editorStep === 1 && 'Basic Information'}
                      {editorStep === 2 && 'Select Genres'}
                      {editorStep === 3 && 'Event Types'}
                      {editorStep === 4 && 'Pricing & Budget'}
                      {editorStep === 5 && 'Media Gallery'}
                      {editorStep === 6 && 'Press Kit'}
                    </h3>
                  </div>
                  <span className="text-[#ff7a00] font-bold text-xs">
                    {editorStep === 1 && '1 of 9'}
                    {editorStep === 2 && '2 of 9'}
                    {editorStep === 3 && '3 of 9'}
                    {editorStep === 4 && '4 of 9'}
                    {editorStep === 5 && '6 of 9'}
                    {editorStep === 6 && '7 of 9'}
                  </span>
                </div>

                {/* STEP 1: BASIC INFORMATION */}
                {editorStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Photos upload area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Profile Photo</label>
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
                          <img 
                            src={formProfilePhoto || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute bottom-2 right-2 p-1.5 bg-[#ff7a00] text-black rounded-lg cursor-pointer">
                            <Camera className="w-3.5 h-3.5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('image', file);
                                try {
                                  const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd });
                                  const d = await res.json();
                                  if (d.url) setFormProfilePhoto(d.url);
                                } catch (err) { console.error(err); }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Cover Photo</label>
                        <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
                          <img 
                            src={formCoverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute bottom-2 right-2 p-1.5 bg-[#ff7a00] text-black rounded-lg cursor-pointer">
                            <Camera className="w-3.5 h-3.5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const fd = new FormData();
                                fd.append('image', file);
                                try {
                                  const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd });
                                  const d = await res.json();
                                  if (d.url) setFormCoverImage(d.url);
                                } catch (err) { console.error(err); }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Artist / Stage Name</label>
                      <input 
                        type="text" 
                        value={formName} 
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff7a00] transition-colors"
                        placeholder="e.g. Viizoo"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Tagline</label>
                      <input 
                        type="text" 
                        value={formTagline} 
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff7a00] transition-colors"
                        placeholder="e.g. Indie Guitarist | Music Producer | Live Performer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase">
                        <span>Bio</span>
                        <span className={formDescription.length > 300 ? 'text-red-500' : 'text-zinc-500'}>
                          {formDescription.length}/300
                        </span>
                      </div>
                      <textarea 
                        rows={4}
                        maxLength={300}
                        value={formDescription} 
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff7a00] transition-colors resize-none"
                        placeholder="Describe your performance styles and milestones..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Location City & State</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={formCity} 
                            onChange={(e) => setFormCity(e.target.value)}
                            className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#ff7a00]"
                            placeholder="e.g. Visakhapatnam"
                          />
                          <input 
                            type="text" 
                            value={formState} 
                            onChange={(e) => setFormState(e.target.value)}
                            className="w-1/2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#ff7a00]"
                            placeholder="e.g. Andhra Pradesh"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Country</label>
                        <select 
                          value={formCountry} 
                          onChange={(e) => setFormCountry(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-[#ff7a00]"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    {/* Languages Checklist */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Languages</label>
                      <div className="flex flex-wrap gap-3">
                        {['English', 'Telugu', 'Hindi'].map((lang) => {
                          const hasLang = formLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                if (hasLang) setFormLanguages(formLanguages.filter(l => l !== lang));
                                else setFormLanguages([...formLanguages, lang]);
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                                hasLang 
                                  ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' 
                                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                              }`}
                            >
                              <span>{lang}</span>
                              {hasLang && <Check className="w-3.5 h-3.5 text-[#ff7a00]" />}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const customLang = prompt('Enter language:');
                            if (customLang && !formLanguages.includes(customLang)) {
                              setFormLanguages([...formLanguages, customLang]);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400 text-xs font-bold"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(2)}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT GENRES */}
                {editorStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Main Categories grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Main Category</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                          { id: 'Singer', label: 'Singer', icon: SingerIcon },
                          { id: 'DJ', label: 'DJ', icon: DJIcon },
                          { id: 'Band', label: 'Band', icon: BandIcon },
                          { id: 'Guitarist', label: 'Guitarist', icon: GuitaristIcon },
                          { id: 'Producer', label: 'Producer', icon: ProducerIcon },
                          { id: 'Rapper', label: 'Rapper', icon: RapperIcon },
                          { id: 'Host', label: 'Host', icon: HostIcon },
                          { id: 'Instrumentalist', label: 'Instrumentalist', icon: InstrumentalistIcon },
                          { id: 'Dancer', label: 'Dancer', icon: DancerIcon },
                          { id: 'Other', label: 'Other', icon: OtherIcon },
                        ].map((cat) => {
                          const isActive = formMainCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormMainCategory(cat.id)}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all ${
                                isActive 
                                  ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white shadow-glow' 
                                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <cat.icon />
                              <span className="text-[10px] font-bold">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subcategories tags list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sub Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Indie', 'Acoustic', 'Rock', 'Pop', 'Folk', 'Fusion', 'Retro', 'Alternative', 'Bollywood'].map((sub) => {
                          const isSel = formSubcategories.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => {
                                if (isSel) setFormSubcategories(formSubcategories.filter(s => s !== sub));
                                else setFormSubcategories([...formSubcategories, sub]);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isSel 
                                  ? 'bg-[#ff7a00] border-[#ff7a00] text-white shadow-glow' 
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const val = prompt('Add sub-category:');
                            if (val && !formSubcategories.includes(val)) setFormSubcategories([...formSubcategories, val]);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-transparent border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        >
                          + More
                        </button>
                      </div>
                    </div>

                    {/* Genres (Select all that apply) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Genres (Select all that apply)</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Rock', 'Pop', 'Indie', 'EDM', 'Techno', 'Hip-Hop', 'Folk', 'Sufi', 'Jazz', 'Classical', 'Carnatic', 'Commercial', 'Fusion'].map((gen) => {
                          const isSel = formGenresList.includes(gen);
                          return (
                            <button
                              key={gen}
                              type="button"
                              onClick={() => {
                                if (isSel) setFormGenresList(formGenresList.filter(g => g !== gen));
                                else setFormGenresList([...formGenresList, gen]);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isSel 
                                  ? 'bg-[#ff7a00] border-[#ff7a00] text-white shadow-glow' 
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              {gen}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const val = prompt('Add genre:');
                            if (val && !formGenresList.includes(val)) setFormGenresList([...formGenresList, val]);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-transparent border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        >
                          + More
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(1)}
                        className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setEditorStep(3)}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: EVENT TYPES */}
                {editorStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <p className="text-xs text-zinc-400">Select all the events you perform at</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        'Weddings', 'Club Shows', 'Corporate', 'Colleges', 'Private Parties',
                        'Festivals', 'Birthdays', 'Cafes', 'Resorts', 'Luxury Events',
                        'Brand Launches', 'Mall Events', 'Live Concerts', 'Others'
                      ].map((evt) => {
                        const isSel = formEventTypes.includes(evt);
                        return (
                          <button
                            key={evt}
                            type="button"
                            onClick={() => {
                              if (isSel) setFormEventTypes(formEventTypes.filter(e => e !== evt));
                              else setFormEventTypes([...formEventTypes, evt]);
                            }}
                            className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                              isSel 
                                ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' 
                                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-bold">{evt}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isSel ? 'border-[#ff7a00] bg-[#ff7a00] text-black' : 'border-zinc-700 bg-transparent'
                            }`}>
                              {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(2)}
                        className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setEditorStep(4)}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PRICING & BUDGET */}
                {editorStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Starting Price (INR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                        <input 
                          type="text" 
                          value={formPrice} 
                          onChange={(e) => setFormPrice(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-[#ff7a00]"
                          placeholder="e.g. 15,000"
                        />
                      </div>
                    </div>

                    {/* Price Levels list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Price Levels</h4>
                      <div className="space-y-3">
                        {formPriceLevels.map((lvl, index) => (
                          <div key={index} className="flex justify-between items-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <span className="text-xs font-semibold text-zinc-300">{lvl.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#ff7a00]">₹ {lvl.price.toLocaleString()}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  const np = prompt(`Enter price for ${lvl.label}:`, String(lvl.price));
                                  if (np !== null) {
                                    const p = parseFloat(np);
                                    if (!isNaN(p)) handlePriceLevelChange(index, p);
                                  }
                                }}
                                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const label = prompt('Enter Package Label:');
                          const priceStr = prompt('Enter Package Price (INR):');
                          if (label && priceStr) {
                            const price = parseFloat(priceStr);
                            if (!isNaN(price)) setFormPriceLevels([...formPriceLevels, { label, price }]);
                          }
                        }}
                        className="text-xs font-bold text-[#ff7a00] flex items-center gap-1 hover:underline pt-1"
                      >
                        + Add Another
                      </button>
                    </div>

                    {/* Travel checkboxes */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800/40">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Travel</label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setFormTravelIncluded(true)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex justify-center items-center gap-2 ${
                              formTravelIncluded ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' : 'border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              formTravelIncluded ? 'border-[#ff7a00] bg-[#ff7a00]' : 'border-zinc-700'
                            }`}>
                              {formTravelIncluded && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            <span>Included</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormTravelIncluded(false)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex justify-center items-center gap-2 ${
                              !formTravelIncluded ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' : 'border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              !formTravelIncluded ? 'border-[#ff7a00] bg-[#ff7a00]' : 'border-zinc-700'
                            }`}>
                              {!formTravelIncluded && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            <span>Extra</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Accommodation Required?</label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setFormAccommodationRequired(true)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex justify-center items-center gap-2 ${
                              formAccommodationRequired ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' : 'border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              formAccommodationRequired ? 'border-[#ff7a00] bg-[#ff7a00]' : 'border-zinc-700'
                            }`}>
                              {formAccommodationRequired && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            <span>Yes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormAccommodationRequired(false)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex justify-center items-center gap-2 ${
                              !formAccommodationRequired ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white' : 'border-zinc-800 text-zinc-500'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              !formAccommodationRequired ? 'border-[#ff7a00] bg-[#ff7a00]' : 'border-zinc-700'
                            }`}>
                              {!formAccommodationRequired && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                            </div>
                            <span>No</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(3)}
                        className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setEditorStep(5)}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: MEDIA GALLERY */}
                {editorStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Upload Photos & Videos</h4>
                      
                      {/* Filter pills */}
                      <div className="flex gap-2">
                        {['photos', 'videos', 'reels'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormGalleryTab(t as any)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-colors capitalize ${
                              formGalleryTab === t
                                ? 'bg-[#ff7a00] border-[#ff7a00] text-white'
                                : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Filtered Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {formGalleryMedia.filter(m => m.type === formGalleryTab).map((m, idx) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
                            <img src={getImageUrl(m.url)} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setFormGalleryMedia(formGalleryMedia.filter(item => item.url !== m.url))}
                                className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add showcase photo card */}
                        <div className="relative aspect-[3/4] border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center p-4 bg-zinc-900/20 group cursor-pointer transition-colors">
                          <input 
                            type="file" 
                            accept="image/*,video/*"
                            multiple
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files) return;
                              for (let i = 0; i < files.length; i++) {
                                const fd = new FormData();
                                fd.append('image', files[i]);
                                try {
                                  const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd });
                                  const d = await res.json();
                                  if (d.url) {
                                    setFormGalleryMedia(prev => [...prev, { type: formGalleryTab, url: d.url }]);
                                  }
                                } catch (err) { console.error(err); }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Plus className="w-8 h-8 text-zinc-500 group-hover:text-white mb-2 transition-colors" />
                          <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">Add to {formGalleryTab}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Featured Video (YouTube / Drive Link)</label>
                      <input 
                        type="url" 
                        value={formVideoUrl} 
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff7a00]"
                        placeholder="https://youtube.com/watch?v=xxxxx"
                      />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(4)}
                        className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setEditorStep(6)}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: PRESS KIT */}
                {editorStep === 6 && (
                  <div className="space-y-6 animate-fadeIn relative">
                    <p className="text-xs text-zinc-400">Upload Press Kit Documents</p>

                    <div className="space-y-3">
                      {formPressKitDocs.map((doc, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#ff7a00] shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-white">{doc.name}</p>
                              <span className="text-[10px] text-zinc-500 font-semibold">{doc.size}</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setFormPressKitDocs(formPressKitDocs.filter((_, i) => i !== idx))}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload More Files button */}
                    <div className="relative inline-block mt-2">
                      <button 
                        type="button" 
                        className="text-xs font-bold text-[#ff7a00] flex items-center gap-1.5 hover:underline"
                      >
                        + Upload More Files
                      </button>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const sz = file.size > 1024 * 1024 
                            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                            : `${(file.size / 1024).toFixed(0)} KB`;
                          setFormPressKitDocs([...formPressKitDocs, { name: file.name, size: sz, url: '#' }]);
                        }}
                      />
                    </div>

                    {/* Floating Upload button at bottom-right */}
                    <div className="absolute right-0 bottom-16">
                      <div className="relative">
                        <button 
                          type="button"
                          className="w-14 h-14 rounded-full bg-zinc-850 hover:bg-zinc-800 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-zinc-300" />
                        </button>
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 rounded-full cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const sz = file.size > 1024 * 1024 
                              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                              : `${(file.size / 1024).toFixed(0)} KB`;
                            setFormPressKitDocs([...formPressKitDocs, { name: file.name, size: sz, url: '#' }]);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-12 border-t border-zinc-800/60">
                      <button 
                        onClick={() => setEditorStep(5)}
                        className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSaveArtistPortfolio}
                        disabled={isSavingSettings}
                        className="px-8 py-3.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
                      >
                        {isSavingSettings ? 'Saving...' : 'Finish & Save'}
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            ) : (
              
              /* TABBED SUB-VIEWS OF DASHBOARD */
              <div>
                
                {/* SUB-VIEW 1: DASHBOARD METRICS & LOCAL STAGE SHOWS */}
                {artistActiveTab === 'dashboard' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <GlassCard className="p-5 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0">
                        <div className="p-3 w-fit rounded-xl bg-zinc-900 text-[#ff7a00] mb-4">
                          <IndianRupee className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Starting Booking Rate</p>
                        <h3 className="text-2xl font-display font-black mt-1 text-white">
                          ₹{parseFloat(formPrice || '0').toLocaleString()}
                        </h3>
                      </GlassCard>

                      <GlassCard className="p-5 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0">
                        <div className="p-3 w-fit rounded-xl bg-zinc-900 text-[#ff7a00] mb-4">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Bookings Received</p>
                        <h3 className="text-2xl font-display font-black mt-1 text-white">{bookings.length}</h3>
                      </GlassCard>

                      <GlassCard className="p-5 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0">
                        <div className="p-3 w-fit rounded-xl bg-zinc-900 text-[#ff7a00] mb-4">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Shows Scheduled</p>
                        <h3 className="text-2xl font-display font-black mt-1 text-white">{events.length}</h3>
                      </GlassCard>
                    </div>

                    {/* Shows block */}
                    <GlassCard className="p-6 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Local Stage Shows</h3>
                        <GlowButton onClick={() => navigate('/admin/create-event')} className="py-2.5 px-4 text-[10px] gap-1">
                          <Plus className="w-3.5 h-3.5" /> Create New Show
                        </GlowButton>
                      </div>

                      <div className="space-y-3">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center gap-4 group p-3 bg-zinc-900/40 rounded-xl border border-zinc-800">
                            <img src={getImageUrl(event.cover_image)} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{event.title}</p>
                              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">{event.tickets_sold || 0} tickets sold</p>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                                className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 rounded bg-zinc-850 hover:bg-red-950/20 text-zinc-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {events.length === 0 && (
                          <p className="text-xs text-zinc-500 text-center py-6">No shows scheduled.</p>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                )}

                {/* SUB-VIEW 2: BOOKINGS LIST */}
                {artistActiveTab === 'bookings' && (
                  <GlassCard className="p-6 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0 space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bookings Queue</h3>
                    <div className="space-y-3">
                      {bookings.length > 0 ? bookings.map((b) => (
                        <div key={b.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {b.event_type || b.package_tier ? `Wedding Booking (${b.package_tier || 'Custom'})` : 'Concert Ticket Sales'}
                              </span>
                              <span className="text-[9px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400">
                                ID: {b.id.toUpperCase().slice(0, 10)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-[10px] text-zinc-400 font-semibold pt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#ff7a00]" /> {b.booking_date || b.event_date}</span>
                              <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-[#ff7a00]" /> Budget: ₹{(b.total_price || b.budget || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase">
                              {b.status || 'confirmed'}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-zinc-500 text-center py-12">No bookings received yet.</p>
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* SUB-VIEW 3: INBOX / NOTIFICATIONS */}
                {artistActiveTab === 'inbox' && (
                  <GlassCard className="p-6 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inbox Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllNotificationsRead}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-white font-bold"
                        >
                          Mark All Read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {notifications.length > 0 ? notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 rounded-xl border flex justify-between gap-4 transition-all ${
                            n.read 
                              ? 'bg-zinc-900/20 border-zinc-900 opacity-60' 
                              : 'bg-[#ff7a00]/5 border-[#ff7a00]/20'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold ${n.read ? 'text-zinc-400' : 'text-white'}`}>
                              {n.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-zinc-500 block pt-0.5">
                              {new Date(n.created_at).toLocaleString()}
                            </span>
                          </div>
                          {!n.read && (
                            <button 
                              onClick={() => handleMarkNotificationRead(n.id)}
                              className="px-2.5 py-1 rounded bg-[#ff7a00]/15 hover:bg-[#ff7a00]/25 text-[10px] font-bold text-[#ff7a00] h-fit"
                            >
                              Read
                            </button>
                          )}
                        </div>
                      )) : (
                        <p className="text-xs text-zinc-500 text-center py-12">No notifications yet.</p>
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* SUB-VIEW 4: CALENDAR / PORTAL SETTINGS */}
                {artistActiveTab === 'profile' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Calendar manager */}
                    <GlassCard className="p-6 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0 space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Availability Calendar</h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Toggle date slots to block/unblock bookings.</p>
                        </div>
                        <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
                          <button onClick={handlePrevMonth} className="p-0.5 hover:text-[#ff7a00]">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-white min-w-[80px] text-center">
                            {MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}
                          </span>
                          <button onClick={handleNextMonth} className="p-0.5 hover:text-[#ff7a00]">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Calendar grid */}
                      <div>
                        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-bold text-zinc-500 uppercase pb-1">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {calendarDays.map((day, idx) => {
                            const isBlocked = blockedDates.includes(day.dateStr);
                            const bookingMatch = bookings.find(b => (b.booking_date === day.dateStr || b.event_date === day.dateStr));
                            const isBooked = !!bookingMatch;
                            return (
                              <button
                                key={idx}
                                disabled={!day.isCurrentMonth}
                                onClick={() => !isBooked && handleToggleBlockDate(day.dateStr)}
                                className={`h-10 rounded-lg border flex flex-col justify-between p-1 transition-all cursor-pointer ${
                                  !day.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''
                                } ${
                                  isBooked 
                                    ? 'bg-[#ff7a00] border-[#ff7a00] text-black shadow-glow'
                                    : isBlocked
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                                }`}
                              >
                                <span className="text-[10px] font-bold">{day.dayNum}</span>
                                {isBooked && <span className="text-[7px] font-black uppercase text-black">GIG</span>}
                                {isBlocked && <span className="text-[7px] font-bold uppercase text-red-500">BLOCKED</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </GlassCard>

                    {/* Quick Settings Form */}
                    <GlassCard className="p-6 border-white/5 bg-[#121214] hover:scale-100 hover:translate-y-0 space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Settings</h3>
                      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-zinc-500 uppercase tracking-wider font-semibold">Contact Email</label>
                            <input 
                              type="email" 
                              value={formContactEmail} 
                              onChange={(e) => setFormContactEmail(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-zinc-500 uppercase tracking-wider font-semibold">Contact Phone</label>
                            <input 
                              type="text" 
                              value={formPhone} 
                              onChange={(e) => setFormPhone(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white" 
                            />
                          </div>
                        </div>
                        <button type="submit" className="px-5 py-2.5 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-bold rounded-lg transition-colors cursor-pointer">
                          Save Settings
                        </button>
                      </form>
                    </GlassCard>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PREMIUM RESPONSIVE BOTTOM NAVIGATION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 py-2.5 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
          <div className="max-w-md mx-auto flex justify-between items-center relative">
            
            {/* Dashboard Tab */}
            <button 
              onClick={() => { setIsEditingPortfolio(false); setArtistActiveTab('dashboard'); }}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                artistActiveTab === 'dashboard' && !isEditingPortfolio ? 'text-[#ff7a00]' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Dashboard</span>
            </button>

            {/* Bookings Tab */}
            <button 
              onClick={() => { setIsEditingPortfolio(false); setArtistActiveTab('bookings'); }}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                artistActiveTab === 'bookings' ? 'text-[#ff7a00]' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Bookings</span>
            </button>

            {/* Orange floating "+" button */}
            <button 
              onClick={() => navigate('/admin/create-event')}
              className="w-12 h-12 rounded-full bg-[#ff7a00] hover:bg-[#e06c00] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(255,122,0,0.4)] hover:scale-105 transition-all -translate-y-4 cursor-pointer border-4 border-black"
              title="Create New Show"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Inbox Tab */}
            <button 
              onClick={() => { setIsEditingPortfolio(false); setArtistActiveTab('inbox'); }}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative ${
                artistActiveTab === 'inbox' ? 'text-[#ff7a00]' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded-full font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span className="text-[9px] font-bold uppercase tracking-wider">Inbox</span>
            </button>

            {/* Profile Tab */}
            <button 
              onClick={() => { setIsEditingPortfolio(false); setArtistActiveTab('profile'); }}
              className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                artistActiveTab === 'profile' ? 'text-[#ff7a00]' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
            </button>
          </div>
        </div>

        {/* Email verification OTP Modal */}
        {isVerifyingEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md">
              <GlassCard className="p-8 border-[#ff7a00]/30 space-y-6">
                <button 
                  onClick={() => {
                    setIsVerifyingEmail(false);
                    setOtpSent(false);
                    setOtpCode('');
                    setOtpError('');
                    setOtpSuccess('');
                  }}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-[#ff7a00]" />
                  </div>
                  <h3 className="text-xl font-display font-extrabold text-white">Email Verification</h3>
                  <p className="text-xs text-zinc-400 mt-2">
                    Verify your account email to secure operations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center text-xs font-semibold text-white">
                    {user.email}
                  </div>

                  {!otpSent ? (
                    <button 
                      onClick={handleSendOtp} 
                      className="w-full py-3 bg-[#ff7a00] text-black font-bold uppercase tracking-wider rounded-xl text-xs"
                    >
                      Send OTP Verification Code
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block text-left">
                          Enter 6-Digit Code
                        </label>
                        <input 
                          type="text" 
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-xl font-bold tracking-widest focus:border-[#ff7a00] outline-none transition-all text-white"
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
                        <button 
                          onClick={handleVerifyOtp} 
                          disabled={otpCode.length !== 6} 
                          className="flex-1 py-2.5 bg-[#ff7a00] text-black font-bold uppercase tracking-wider rounded-xl text-[10px]"
                        >
                          Verify
                        </button>
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
  }

  // ----------------------------------------------------
  // ORIGINAL DASHBOARD (FOR VENUE & CATERER PARTNERS)
  // ----------------------------------------------------
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
              <span className="bg-[#ff7a00] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
                  ? 'bg-[#ff7a00] text-white shadow-glow' 
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
                  <div className="p-3 w-fit rounded-xl bg-white/5 text-[#ff7a00] mb-4">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Bookings Received</p>
                  <h3 className="text-3xl font-display font-black mt-1 text-white">{bookings.length}</h3>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="p-3 w-fit rounded-xl bg-white/5 text-yellow-400 mb-4">
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
                          <span className="text-white font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-yellow-400" /> {formCity}</span>
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
                  <button onClick={handlePrevMonth} className="p-1 hover:text-[#ff7a00]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold min-w-[100px] text-center text-white">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  <button onClick={handleNextMonth} className="p-1 hover:text-[#ff7a00]">
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
                  <div className="w-3.5 h-3.5 rounded bg-[#ff7a00] text-white" />
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
                            ? 'bg-[#ff7a00] border-[#ff7a00] text-white shadow-glow'
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">City Location</label>
                    <select 
                      value={formCity} onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                    />
                  </div>

                  {adminType === 'venue' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Maximum Capacity (Pax)</label>
                      <input 
                        type="number" required value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                      />
                    </div>
                  ) : adminType === 'artist' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Genres (comma-separated)</label>
                      <input 
                        type="text" value={formGenres}
                        onChange={(e) => setFormGenres(e.target.value)}
                        placeholder="Electronic, Pop, Bollywood"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dinner Menu (comma-separated)</label>
                        <textarea 
                          rows={3} value={formDinnerMenu}
                          onChange={(e) => setFormDinnerMenu(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Snacks Menu (comma-separated)</label>
                        <textarea 
                          rows={3} value={formSnacksMenu}
                          onChange={(e) => setFormSnacksMenu(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white resize-none"
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
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contact Phone</label>
                        <input 
                          type="text" value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Website URL</label>
                        <input 
                          type="url" value={formWebsite}
                          onChange={(e) => setFormWebsite(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video Reel URL</label>
                        <input 
                          type="url" value={formVideoUrl}
                          onChange={(e) => setFormVideoUrl(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-bold">Cover Image / Media URL</label>
                  <input 
                    type="url" required value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff7a00] text-xs text-white"
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
