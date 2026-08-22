import { type InputHTMLAttributes, forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  touched?: boolean;
}

export default forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ label, error, icon: Icon, touched, className = '', ...props }, ref) {
    const showError = touched && error;
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border-2 ${showError ? 'border-danger-400' : 'border-surface-200 dark:border-surface-700'} text-surface-900 dark:text-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all ${Icon ? 'pl-11' : ''} ${className}`}
            {...props}
          />
        </div>
        {showError && <p className="mt-1.5 text-xs text-danger-500 font-medium">{error}</p>}
      </div>
    );
  }
);
