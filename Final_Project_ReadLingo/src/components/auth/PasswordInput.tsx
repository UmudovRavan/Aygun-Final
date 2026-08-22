import { useState, type InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  touched?: boolean;
}

export default forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, touched, className = '', ...props }, ref) {
    const [show, setShow] = useState(false);
    const showError = touched && error;
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400">
            <Lock className="w-5 h-5" />
          </div>
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={`w-full px-4 py-3 pl-11 pr-11 rounded-xl bg-surface-50 dark:bg-surface-800 border-2 ${showError ? 'border-danger-400' : 'border-surface-200 dark:border-surface-700'} text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
          >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {showError ? (
          <p className="mt-1.5 text-xs text-danger-500 font-medium">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-surface-400 font-medium">{hint}</p>
        ) : null}
      </div>
    );
  }
);
