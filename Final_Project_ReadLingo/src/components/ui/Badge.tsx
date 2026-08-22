import { ReactNode } from 'react';
type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'surface';
const colors: Record<Color, string> = {
  primary: 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300',
  secondary: 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300',
  success: 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300',
  warning: 'bg-warning-100 dark:bg-warning-500/20 text-warning-700 dark:text-warning-300',
  danger: 'bg-danger-100 dark:bg-danger-500/20 text-danger-700 dark:text-danger-300',
  surface: 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200',
};
export default function Badge({ children, color = 'primary', className = '' }: { children: ReactNode; color?: Color; className?: string }) {
  return <span className={`badge ${colors[color]} ${className}`}>{children}</span>;
}
