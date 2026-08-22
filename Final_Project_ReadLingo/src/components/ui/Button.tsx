import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; fullWidth?: boolean;
  leftIcon?: ReactNode; rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft',
  secondary: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700',
  ghost: 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
  gradient: 'bg-gradient-primary text-white hover:opacity-90 shadow-soft',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-soft',
};
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };

export default function Button({ variant = 'primary', size = 'md', fullWidth, leftIcon, rightIcon, children, className = '', ...props }: Props) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {leftIcon}{children}{rightIcon}
    </button>
  );
}
