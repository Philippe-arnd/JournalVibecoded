import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

// Password strength calculation
const calculatePasswordStrength = (password) => {
  let score = 0;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (requirements.length) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;

  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Strong', 'Strong'];
  const strengthColors = ['red', 'red', 'amber', 'emerald', 'emerald'];

  return {
    score: Math.min(score, 4),
    percentage: Math.round((score / 5) * 100),
    label: strengthLabels[score],
    color: strengthColors[score],
    requirements,
  };
};

export default function PasswordInput({
  value,
  onChange,
  showStrength = false,
  showRequirements = false,
  placeholder = '••••••••',
  label = 'Password',
  required = true,
  autoComplete = 'password',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = calculatePasswordStrength(value);

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium text-journal-800 ml-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field with Toggle */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full p-3 rounded-lg border border-journal-200 focus:ring-2 focus:ring-journal-accent/20 focus:border-journal-accent outline-none transition-all pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-journal-400 hover:text-journal-600 transition-colors p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff size={20} strokeWidth={1.5} />
          ) : (
            <Eye size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Strength Gauge (only show when typing) */}
      {showStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-journal-600">
              Strength
            </span>
            <span className={`text-xs font-bold ${
              strength.color === 'red' ? 'text-red-500' :
              strength.color === 'amber' ? 'text-amber-500' :
              'text-emerald-500'
            }`}>
              {strength.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-journal-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength.color === 'red' ? 'bg-red-500' :
                strength.color === 'amber' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${strength.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements Checklist (only show when typing) */}
      {showRequirements && value && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {strength.requirements.length ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <X size={16} className="text-journal-300 flex-shrink-0" />
            )}
            <span className={strength.requirements.length ? 'text-journal-700' : 'text-journal-400'}>
              At least 8 characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.requirements.uppercase ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <X size={16} className="text-journal-300 flex-shrink-0" />
            )}
            <span className={strength.requirements.uppercase ? 'text-journal-700' : 'text-journal-400'}>
              Uppercase letter
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.requirements.lowercase ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <X size={16} className="text-journal-300 flex-shrink-0" />
            )}
            <span className={strength.requirements.lowercase ? 'text-journal-700' : 'text-journal-400'}>
              Lowercase letter
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.requirements.number ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <X size={16} className="text-journal-300 flex-shrink-0" />
            )}
            <span className={strength.requirements.number ? 'text-journal-700' : 'text-journal-400'}>
              Number
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.requirements.special ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <X size={16} className="text-journal-300 flex-shrink-0" />
            )}
            <span className={strength.requirements.special ? 'text-journal-700' : 'text-journal-400'}>
              Special character (!@#$%^&*...)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
