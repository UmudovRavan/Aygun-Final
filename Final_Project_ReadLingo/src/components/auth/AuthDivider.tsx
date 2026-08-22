export default function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
      <span className="text-sm text-surface-400 font-medium">or</span>
      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
    </div>
  );
}
