import { ReactNode } from 'react';
export default function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4 text-surface-400">{icon}</div>
      <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-400">{description}</p>}
    </div>
  );
}
