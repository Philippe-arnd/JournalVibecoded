import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import EntryCreationView from './views/EntryCreationView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsOfServiceView from './views/TermsOfServiceView';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();

  // Render Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-journal-50">
        <Loader2 className="animate-spin text-journal-900" size={40} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <LandingView />} />
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <LoginView mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <LoginView mode="signup" />} />
      <Route path="/privacy" element={<PrivacyPolicyView />} />
      <Route path="/terms" element={<TermsOfServiceView />} />

      {/* Protected Routes */}
      <Route path="/home" element={user ? <AuthenticatedHome /> : <Navigate to="/login" replace />} />
      <Route path="/create" element={user ? <AuthenticatedCreate /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

// Component for authenticated home route
function AuthenticatedHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch Entries
      const { data: entryData, error: entryError } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (entryError) throw entryError;
      setEntries(entryData || []);

      // 2. Fetch Streak from Profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setStreak(profileData.current_streak || 0);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStartNew = (options = {}) => {
    const { entry_date } = options;

    // Store entry data in navigation state
    if (entry_date) {
      const existingEntry = entries.find(e => e.entry_date === entry_date);
      navigate('/create', { state: { entry: existingEntry || { entry_date } } });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(e => e.entry_date === today);
      navigate('/create', { state: { entry: todayEntry || null } });
    }
  };

  const handleEditEntry = (entry) => {
    navigate('/create', { state: { entry } });
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadData();
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete entry: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-journal-50">
        <Loader2 className="animate-spin text-journal-900" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-journal-50 font-sans text-journal-900">
      <HomeView
        entries={entries}
        streak={streak}
        onStartNew={handleStartNew}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}

// Component for authenticated create route
function AuthenticatedCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedEntry = location.state?.entry;

  const handleEntryFinish = () => {
    navigate('/home');
  };

  const handleClose = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-journal-50 font-sans text-journal-900">
      <EntryCreationView
        key={selectedEntry?.id || 'new'}
        initialEntry={selectedEntry}
        onFinish={handleEntryFinish}
        onClose={handleClose}
      />
    </div>
  );
}

export default App;