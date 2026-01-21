import { Check, X } from 'lucide-react';
import PasswordInput from './PasswordInput';

export default function PasswordConfirmation({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  showStrength = true,
}) {
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <PasswordInput
        value={password}
        onChange={onPasswordChange}
        showStrength={showStrength}
        showRequirements={showStrength}
        label="Password"
        autoComplete="new-password"
      />

      {/* Confirmation Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-journal-800 ml-1">
          Confirm Password
          <span className="text-red-500 ml-1">*</span>
        </label>

        <div className="relative">
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className={`w-full p-3 rounded-lg border outline-none transition-all pr-12 focus:ring-2 focus:ring-journal-accent/20 ${
              passwordsMismatch
                ? 'border-red-300 focus:border-red-500'
                : passwordsMatch
                ? 'border-emerald-300 focus:border-emerald-500'
                : 'border-journal-200 focus:border-journal-accent'
            }`}
          />

          {/* Match Indicator */}
          {confirmPassword.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              {passwordsMatch ? (
                <Check size={20} className="text-emerald-500" strokeWidth={2.5} />
              ) : (
                <X size={20} className="text-red-500" strokeWidth={2.5} />
              )}
            </div>
          )}
        </div>

        {/* Match Feedback */}
        {confirmPassword.length > 0 && (
          <p
            className={`text-xs font-medium ${
              passwordsMatch ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}
      </div>
    </div>
  );
}
