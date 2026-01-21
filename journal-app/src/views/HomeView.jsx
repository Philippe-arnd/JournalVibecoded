import { Plus, ChevronDown, Trash2, Edit2, Calendar as CalendarIcon, List, Settings, LogOut, Lock, X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Flame } from 'lucide-react';
import Logo from '../components/Logo';
import DailysInsights from './DailysInsights';
import PasswordInput from '../components/PasswordInput';
import PasswordConfirmation from '../components/PasswordConfirmation';

export default function HomeView({ onStartNew, entries, onEdit, onDelete, streak }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('timeline');
  const [showSettings, setShowSettings] = useState(false);
  const [showDateSelection, setShowDateSelection] = useState(false);

  const calculatedStreak = useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    
    const completedEntries = entries.filter(e => e.completed);
    if (completedEntries.length === 0) return 0;

    const entryDates = new Set(completedEntries.map(e => e.entry_date.split('T')[0]));
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let streakCount = 0;
    let checkDate = new Date(today);

    // Determine start date for check
    if (entryDates.has(todayStr)) {
      // Streak continues from today
    } else if (entryDates.has(yesterdayStr)) {
      // Streak continues from yesterday
      checkDate = yesterday;
    } else {
      return 0;
    }

    // Count backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (entryDates.has(dateStr)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streakCount;
  }, [entries]);

  const handleStartNewClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hasYesterday = entries.some(e => e.entry_date === yesterdayStr);
    
    if (!hasYesterday) {
      setShowDateSelection(true);
    } else {
      onStartNew();
    }
  };

  const handleDateSelect = (date) => {
    setShowDateSelection(false);
    onStartNew({ entry_date: date });
  };
  

  return (
    <div className="min-h-screen bg-journal-50 pb-32 relative font-sans">
      <header className="px-6 pt-12 pb-8 flex justify-between items-start max-w-2xl mx-auto w-full">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h1 className="text-3xl font-serif font-medium text-journal-900">My Journal</h1>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <p className="text-journal-500 text-lg font-light">Consistency is the key.</p>
            
            {/* Streak Badge */}
            {calculatedStreak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-100 text-orange-600 px-3 py-1 rounded-full border border-orange-200 shadow-sm animate-in fade-in slide-in-from-left-4 duration-700">
                <Flame size={16} fill="currentColor" strokeWidth={1} />
                <span className="text-sm font-bold">{calculatedStreak} Day{calculatedStreak > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowSettings(true)} 
          className="text-journal-400 hover:text-journal-600 p-2 rounded-full hover:bg-journal-100 transition-colors"
        >
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </header>

      {/* View Switcher */}
      <div className="px-6 mb-12 flex justify-center sticky top-6 z-30">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-journal-100 flex gap-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
              viewMode === 'timeline' 
                ? 'bg-journal-900 text-white shadow-md' 
                : 'text-journal-500 hover:text-journal-900 hover:bg-journal-50'
            }`}
          >
            <List size={16} strokeWidth={2} /> Timeline
          </button>
          <button
            onClick={() => setViewMode('insights')}
            className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
              viewMode === 'insights' 
                ? 'bg-journal-900 text-white shadow-md' 
                : 'text-journal-500 hover:text-journal-900 hover:bg-journal-50'
            }`}
          >
            <Sparkles size={16} strokeWidth={2} /> Insights
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6">
        {viewMode === 'timeline' ? (
          <TimelineView 
            entries={entries} 
            onStartNew={handleStartNewClick} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ) : (
          <DailysInsights />
        )}
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onSignOut={async () => {
              try {
                await signOut();
              } catch (error) {
                // Ignore errors during sign out (e.g. session already expired)
                console.error('Sign out error:', error);
              }
              // Clear all local storage to ensure session is gone
              localStorage.clear();
              // Force a full page reload to clear all state
              window.location.href = '/login';
            }}
          />
        )}
        {showDateSelection && (
          <DateSelectionModal onClose={() => setShowDateSelection(false)} onSelect={handleDateSelect} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineView({ entries, onStartNew, onEdit, onDelete }) {
  // 1. Grouping Logic
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.entry_date);
    const day = date.getDay();
    // Calculate Monday of the week
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekKey = monday.toISOString().split('T')[0];
    
    // Create label (e.g., "Jan 12 - Jan 18")
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const label = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    if (!groups[weekKey]) {
      groups[weekKey] = { label, entries: [] };
    }
    groups[weekKey].entries.push(entry);
    return groups;
  }, {});

  // Sort weeks descending (newest first)
  const sortedWeeks = Object.keys(groupedEntries).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="max-w-xl mx-auto relative pb-20">
      {/* Continuous Spine Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-journal-200/60 -translate-x-1/2" />

      <div className="space-y-10 relative z-10">
        {/* Add Button */}
        <div className="flex justify-center mb-12">
          <button 
            onClick={onStartNew}
            className="bg-journal-900 text-white w-14 h-14 rounded-full shadow-xl shadow-journal-900/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group border-[6px] border-journal-50 z-20"
          >
            <Plus size={28} strokeWidth={1.5} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Render Week Groups */}
        {sortedWeeks.map((weekKey) => {
          const group = groupedEntries[weekKey];
          return (
            <div key={weekKey} className="w-full">
              {/* Week Header (Sticky visual anchor) */}
              <div className="flex justify-center mb-6">
                <div className="bg-journal-50 border border-journal-200 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm z-20">
                  <span className="text-xs font-bold text-journal-400 uppercase tracking-widest">
                    {group.label}
                  </span>
                  <span className="w-px h-3 bg-journal-200" />
                  <span className="text-[10px] font-bold bg-white text-journal-900 px-2 py-0.5 rounded-full border border-journal-100">
                    {group.entries.length} Entries
                  </span>
                </div>
              </div>

              {/* Stacked Cards for this Week */}
              <div className="space-y-3">
                {group.entries.map((entry) => (
                  <TimelineCard 
                    key={entry.id} 
                    entry={entry} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="text-center py-12 z-20 relative bg-white/50 backdrop-blur-sm rounded-3xl border border-journal-100 mx-4">
            <p className="text-journal-400 font-light">No entries yet.</p>
            <p className="text-journal-300 text-sm mt-1">Tap the + button to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarView({ entries, onStartNew, onEdit, onDelete }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedEntryId(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedEntryId(null);
  };

  const monthEntries = entries.filter(entry => {
    const entryDate = entry.entry_date; // YYYY-MM-DD
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return entryDate.startsWith(currentMonthStr);
  });

  const entriesByDay = monthEntries.reduce((acc, entry) => {
    const day = parseInt(entry.entry_date.split('-')[2], 10);
    acc[day] = entry;
    return acc;
  }, {});

  const selectedEntry = selectedEntryId ? entries.find(e => e.id === selectedEntryId) : null;

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-2xl font-serif font-medium text-journal-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-journal-100 rounded-full text-journal-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-journal-100 rounded-full text-journal-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-journal-100 mb-8">
        <div className="grid grid-cols-7 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-journal-300 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const entry = entriesByDay[day];
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === currentDate.getMonth() && 
                           new Date().getFullYear() === currentDate.getFullYear();
            const isSelected = selectedEntryId === entry?.id;
            
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => entry && setSelectedEntryId(isSelected ? null : entry.id)}
                  disabled={!entry}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                    ${isSelected ? 'bg-journal-900 text-white scale-110 shadow-lg z-10' : isToday ? 'bg-journal-900 text-white shadow-md' : 'text-journal-700 hover:bg-journal-50'}
                    ${entry ? (entry.completed ? 'ring-2 ring-emerald-400/50' : 'ring-2 ring-amber-400/50') : ''}
                    ${!entry && !isToday ? 'opacity-50' : ''}
                  `}
                >
                  {day}
                  {entry && (
                    <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${entry.completed ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-journal-400 uppercase tracking-widest">
            {selectedEntry ? 'Selected Entry' : 'Entries'}
          </h3>
          {selectedEntry && (
            <button onClick={() => setSelectedEntryId(null)} className="text-xs text-journal-500 hover:text-journal-900">View All</button>
          )}
        </div>
        {selectedEntry ? (
          <TimelineCard key={selectedEntry.id} entry={selectedEntry} onEdit={onEdit} onDelete={onDelete} />
        ) : monthEntries.length > 0 ? (
          monthEntries
            .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
            .map(entry => (
              <TimelineCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
            ))
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-3xl border border-journal-100 border-dashed">
            <p className="text-journal-400 font-light">No entries for this month.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ entry, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dateObj = new Date(entry.entry_date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative z-20"
    >
      <motion.div 
        layout
        className={`w-full bg-white rounded-2xl border border-journal-100 shadow-sm hover:shadow-md transition-all overflow-hidden ${
          isExpanded ? 'ring-1 ring-journal-900/5 my-4' : ''
        }`}
      >
        <div 
          className="p-5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Date Block (Replacing generic text) */}
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-journal-50 rounded-xl border border-journal-100 text-journal-900">
                <span className="text-[10px] font-bold uppercase text-journal-400 leading-none mb-0.5">{month}</span>
                <span className="text-lg font-serif font-bold leading-none">{day}</span>
              </div>

              <div>
                <h3 className="font-serif font-medium text-lg text-journal-900">
                   {weekday}
                </h3>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${entry.completed ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                   <span className="text-xs text-journal-400 font-medium">
                     {entry.completed ? "Completed" : "Draft"}
                   </span>
                </div>
              </div>
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-journal-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-journal-900 bg-journal-50' : ''}`}>
              <ChevronDown size={20} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-journal-50"
            >
              <div className="p-6 space-y-8">
                <SectionDetail title="Professional" content={entry.professional_recap} />
                <SectionDetail title="Personal" content={entry.personal_recap} />
                <SectionDetail title="Learning" content={entry.learning_reflections} />
                <SectionDetail title="Gratitude" content={entry.gratitude} />
                
                <div className="flex justify-end gap-2 pt-6 border-t border-journal-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} strokeWidth={1.5} /> Delete
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-journal-500 hover:text-journal-900 hover:bg-journal-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit2 size={16} strokeWidth={1.5} /> Edit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function SettingsModal({ onClose, onSignOut }) {
  const { changePassword } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate password strength for validation
  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmNewPassword && confirmNewPassword.length > 0;
  const isPasswordValid = passwordStrength >= 2; // Fair or Strong
  const isFormValid = currentPassword && passwordsMatch && isPasswordValid;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate before submission
      if (!passwordsMatch) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
      if (passwordStrength < 2) {
        setError('New password is not strong enough');
        setLoading(false);
        return;
      }
      if (newPassword === currentPassword) {
        setError('New password must be different from current password');
        setLoading(false);
        return;
      }

      // Verify current password and update to new password
      const { error: updateError } = await changePassword(currentPassword, newPassword);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Close modal after showing success message
        setTimeout(() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setShowPasswordChange(false);
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }
    setLoading(false);
  };

  const handlePasswordChangeCancel = () => {
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccess(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-journal-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-white/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-journal-50 flex justify-between items-center">
          <h2 className="text-lg font-serif font-medium text-journal-900">
            {showPasswordChange ? 'Change Password' : 'Settings'}
          </h2>
          <button onClick={onClose} className="text-journal-400 hover:text-journal-600">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showPasswordChange ? (
            // Password Change Form
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                showStrength={false}
                showRequirements={false}
                autoComplete="current-password"
              />

              <PasswordConfirmation
                password={newPassword}
                confirmPassword={confirmNewPassword}
                onPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmNewPassword}
                showStrength={true}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600">
                  ✓ Password updated successfully
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex-1 bg-journal-900 text-white p-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePasswordChangeCancel}
                  className="flex-1 bg-journal-50 text-journal-900 p-2 rounded-lg text-sm font-medium hover:bg-journal-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // Settings Menu
            <>
              <div>
                <h3 className="text-xs font-bold text-journal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Lock size={14} /> Security
                </h3>
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full bg-journal-50 hover:bg-journal-100 text-journal-900 p-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-6 border-t border-journal-50">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-lg transition-colors font-medium text-sm"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const SectionDetail = ({ title, content }) => (
  <div>
    <h4 className="text-[10px] font-bold text-journal-400 uppercase mb-1.5 tracking-widest">{title}</h4>
    <p className="text-journal-700 leading-relaxed font-normal text-base">{content || "No entry recorded."}</p>
  </div>
);

function DateSelectionModal({ onClose, onSelect }) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-journal-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-white/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-journal-50 flex justify-between items-center">
          <h2 className="text-lg font-serif font-medium text-journal-900">New Entry</h2>
          <button onClick={onClose} className="text-journal-400 hover:text-journal-600">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-journal-500 mb-6 text-sm leading-relaxed">
            You haven't written for yesterday yet. Which day would you like to journal for?
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => onSelect(yesterdayStr)}
              className="w-full flex items-center justify-between bg-journal-50 hover:bg-journal-100 p-4 rounded-xl transition-colors group border border-journal-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-journal-100 flex items-center justify-center text-journal-400 group-hover:text-journal-900 transition-colors">
                  <CalendarIcon size={20} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-journal-900">Yesterday</div>
                  <div className="text-xs text-journal-400">{yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-journal-300 group-hover:text-journal-900 transition-colors" />
            </button>

            <button 
              onClick={() => onSelect(todayStr)}
              className="w-full flex items-center justify-between bg-journal-900 hover:bg-black p-4 rounded-xl transition-colors group shadow-md shadow-journal-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Flame size={20} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Today</div>
                  <div className="text-xs text-white/60">Continue your streak</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}