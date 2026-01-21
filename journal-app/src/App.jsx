import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import EntryCreationView from './views/EntryCreationView';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  
  // State
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'create'
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data Fetching Logic
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

  // Initial Load
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Handlers
  const handleStartNew = (options = {}) => {
    const { entry_date } = options;

    // If a specific date is provided, check for existing entry on that date
    if (entry_date) {
      const existingEntry = entries.find(e => e.entry_date === entry_date);
      if (existingEntry) {
        setSelectedEntry(existingEntry);
      } else {
        // Create a new entry for the specified date
        setSelectedEntry({ entry_date });
      }
    } else {
      // Default behavior: check for today's entry
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find(e => e.entry_date === today);

      if (todayEntry) {
        setSelectedEntry(todayEntry);
      } else {
        setSelectedEntry(null); // Null means "Create New" for today
      }
    }
    setCurrentView('create');
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setCurrentView('create');
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadData(); // Refresh list
      } catch (error) {
        console.error('Failed to delete:', error);
        alert('Failed to delete entry: ' + error.message);
      }
    }
  };

  const handleEntryFinish = async () => {
    await loadData(); // Refresh data to update streak and timeline
    setCurrentView('home');
    setSelectedEntry(null);
  };

  // Render Loading
  if (authLoading || (user && loading && entries.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-journal-50">
        <Loader2 className="animate-spin text-journal-900" size={40} />
      </div>
    );
  }

  // Render Login
  if (!user) return <LoginView />;

  // Render Main App
  return (
    <div className="min-h-screen bg-journal-50 font-sans text-journal-900">
      {currentView === 'home' ? (
        <HomeView 
          entries={entries} 
          streak={streak} 
          onStartNew={handleStartNew} 
          onEdit={handleEditEntry} 
          onDelete={handleDeleteEntry} 
        />
      ) : (
        <EntryCreationView 
          key={selectedEntry?.id || 'new'} // Force re-render on entry change
          initialEntry={selectedEntry} // Pass this prop if EntryCreationView uses it, otherwise it handles logic internally
          onFinish={handleEntryFinish} 
          onClose={() => setCurrentView('home')}
        />
      )}
    </div>
  );
}

export default App;