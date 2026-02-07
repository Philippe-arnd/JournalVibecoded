import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { entryService } from './services/entryService';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import EntryCreationView from './views/EntryCreationView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import TermsOfServiceView from './views/TermsOfServiceView';
import UpdatePasswordView from './views/UpdatePasswordView';
import { Loader2 } from 'lucide-react';

// Helper to calculate streak from entries
function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  // Entries are sorted by date desc
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  const latestEntry = entries[0];
  if (!latestEntry) return 0;
  
  const latestDate = latestEntry.entry_date;
  
  // If latest entry is not today or yesterday, streak is broken
  if (latestDate !== today && latestDate !== yesterday) {
      return 0;
  }
  
  let currentStreak = 1;
  let currentDate = new Date(latestDate);
  
  for (let i = 1; i < entries.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedDateStr = currentDate.toISOString().split('T')[0];
      
      if (entries[i].entry_date === expectedDateStr) {
          currentStreak++;
      } else {
          break;
      }
  }
  
  return currentStreak;
}

function App() {
  const { user, loading: authLoading, passwordRecoveryMode } = useAuth();
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // Centralized Data Loading
  const loadData = useCallback(async (background = false) => {
    if (!user) return;
    if (!background && entries.length === 0) setDataLoading(true);

    try {
      // 1. Fetch Entries using entryService (handles decryption)
      const entryData = await entryService.getEntries();
      setEntries(entryData || []);

      // 2. Calculate Streak locally
      setStreak(calculateStreak(entryData));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (!background) setDataLoading(false);
    }
  }, [user, entries.length]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setEntries([]);
      setStreak(0);
    }
  }, [user, loadData]);


  // Render Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-journal-50">
        <Loader2 className="animate-spin text-journal-900" size={40} />
      </div>
    );
  }

  // Force password update if in recovery mode
  if (user && passwordRecoveryMode) {
    return (
      <Routes>
        <Route path="*" element={<UpdatePasswordView />} />
      </Routes>
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
      <Route path="/update-password" element={user ? <UpdatePasswordView /> : <Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          user ? (
            <AuthenticatedHome 
              entries={entries} 
              streak={streak} 
              refreshData={loadData} 
              loading={dataLoading} 
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route 
        path="/create" 
        element={
          user ? (
            <AuthenticatedCreate onDataUpdate={loadData} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

// Component for authenticated home route
function AuthenticatedHome({ entries, streak, refreshData, loading }) {
  const navigate = useNavigate();

  // Refresh data in background on mount
  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

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
        await entryService.deleteEntry(id);
        await refreshData(true);
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete entry: ' + error.message);
      }
    }
  };

  // Only show full screen loader if we have NO data and are loading
  if (loading && entries.length === 0) {
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
function AuthenticatedCreate({ onDataUpdate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedEntry = location.state?.entry;

  const handleEntryFinish = () => {
    onDataUpdate(true); // Refresh data before navigating back
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