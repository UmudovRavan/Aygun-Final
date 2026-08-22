type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
type Size = 'sm' | 'md' | 'lg';
const colors: Record<Color, string> = { primary: 'bg-primary-500', secondary: 'bg-secondary-500', success: 'bg-success-500', warning: 'bg-warning-500', danger: 'bg-danger-500' };
const sizes: Record<Size, string> = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

export default function ProgressBar({ value, max = 100, color = 'primary', size = 'md', showLabel, label }: { value: number; max?: number; color?: Color; size?: Size; showLabel?: boolean; label?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className={`w-full ${sizes[size]} bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden`}>
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <p className="text-xs text-surface-400 mt-1">{label || `${Math.round(pct)}%`}</p>}
    </div>
  );
}
