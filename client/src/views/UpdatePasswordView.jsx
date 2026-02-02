import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import PasswordConfirmation from '../components/PasswordConfirmation';

export default function UpdatePasswordView() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();

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
  const isFormValid = passwordsMatch && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isFormValid) {
        setError('Please check password requirements.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await updateUserPassword(password);
      
      if (updateError) {
        setError(updateError.message);
      } else {
        // Success - navigate to home
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-journal-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-journal-200">
        <div className="flex justify-center mb-6">
          <div className="bg-journal-50 p-4 rounded-2xl border border-journal-100 shadow-sm">
            <Logo size={48} />
          </div>
        </div>

        <h1 className="text-2xl font-serif font-bold text-center text-journal-900 mb-2">
          Set New Password
        </h1>
        <p className="text-journal-800/60 text-center mb-8">
          Please create a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordConfirmation
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            showStrength={true}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            disabled={loading || !isFormValid}
            className="w-full bg-journal-900 text-white p-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}