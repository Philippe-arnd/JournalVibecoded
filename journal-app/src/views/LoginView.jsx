import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Book, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginView() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp 
      ? await signUp({ email, password }) 
      : await signIn({ email, password });
    
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-journal-50 flex flex-col items-center justify-center p-6">
      <div 
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-journal-200"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-journal-50 p-4 rounded-2xl border border-journal-100 shadow-sm">
            <Logo size={48} />
          </div>
        </div>
        
        <h1 className="text-2xl font-serif font-bold text-center text-journal-900 mb-2">
          {isSignUp ? 'Create your journal' : 'Welcome back'}
        </h1>
        <p className="text-journal-800/60 text-center mb-8">
          A space for your morning reflection.
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-journal-800 ml-1">Email</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border border-journal-200 focus:ring-2 focus:ring-journal-accent/20 focus:border-journal-accent outline-none transition-all"
              placeholder="phil@avisto.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-journal-800 ml-1">Password</label>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border border-journal-200 focus:ring-2 focus:ring-journal-accent/20 focus:border-journal-accent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-journal-900 text-white p-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-sm text-journal-800/60 hover:text-journal-800 transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
}