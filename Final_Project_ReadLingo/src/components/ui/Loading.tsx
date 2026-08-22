import { Loader2 } from 'lucide-react';
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
      <p className="text-surface-400 text-sm">{message}</p>
    </div>
  );
}
