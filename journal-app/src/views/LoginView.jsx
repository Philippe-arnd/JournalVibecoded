import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';
import PasswordConfirmation from '../components/PasswordConfirmation';

export default function LoginView({ mode = 'login' }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isSignUp = mode === 'signup';
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

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

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isPasswordValid = passwordStrength >= 2; // Fair or Strong
  const isSignUpValid = email && passwordsMatch && isPasswordValid;
  const isSignInValid = email && password;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate before submission
        if (!passwordsMatch) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (passwordStrength < 2) {
          setError('Password is not strong enough');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setError('');
          // Clear form on success
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { error: signInError } = await signIn({ email, password });
        if (signInError) {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');

    try {
      const { error: resetError } = await resetPassword(resetEmail);
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
    setResetLoading(false);
  };

  const handleResetClose = () => {
    setShowPasswordReset(false);
    setResetEmail('');
    setResetSent(false);
    setError('');
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-journal-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-journal-200">
          <button
            onClick={handleResetClose}
            className="flex items-center gap-2 text-journal-500 hover:text-journal-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span className="text-sm font-medium">Back to Sign In</span>
          </button>

          <h1 className="text-2xl font-serif font-bold text-journal-900 mb-2">
            Reset Password
          </h1>
          <p className="text-journal-800/60 mb-8">
            {resetSent
              ? 'Check your email for a password reset link.'
              : 'Enter your email to receive a password reset link.'}
          </p>

          {!resetSent ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-journal-800 ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg border border-journal-200 focus:ring-2 focus:ring-journal-accent/20 focus:border-journal-accent outline-none transition-all"
                  placeholder="phil@example.com"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                disabled={resetLoading}
                className="w-full bg-journal-900 text-white p-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                ✓ Reset link sent to {resetEmail}
              </div>
              <p className="text-sm text-journal-600">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setResetSent(false)}
                className="w-full text-journal-900 hover:bg-journal-50 p-3 rounded-lg font-medium transition-colors"
              >
                Send Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-journal-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-journal-200">
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

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-journal-800 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border border-journal-200 focus:ring-2 focus:ring-journal-accent/20 focus:border-journal-accent outline-none transition-all"
              placeholder="phil@example.com"
            />
          </div>

          {/* Password Input */}
          {isSignUp ? (
            <PasswordConfirmation
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              showStrength={true}
            />
          ) : (
            <PasswordInput
              value={password}
              onChange={setPassword}
              showStrength={false}
              showRequirements={false}
            />
          )}

          {/* Forgot Password Link (Sign In only) */}
          {!isSignUp && (
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-sm text-journal-600 hover:text-journal-900 transition-colors font-medium -mt-2"
            >
              Forgot password?
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={loading || (isSignUp ? !isSignUpValid : !isSignInValid)}
            className="w-full bg-journal-900 text-white p-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <Link
          to={isSignUp ? '/login' : '/signup'}
          className="block w-full mt-6 text-sm text-center text-journal-800/60 hover:text-journal-800 transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an account'}
        </Link>
      </div>
    </div>
  );
}