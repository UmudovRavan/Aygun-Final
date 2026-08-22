import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const sampleNotifications: Notification[] = [
  { id: 'n1', type: 'success', title: 'Quiz Completed!', message: 'You earned 50 XP from the Vocabulary quiz.' },
  { id: 'n2', type: 'info', title: 'New Story Available', message: 'A new adventure story has been added to the library.' },
  { id: 'n3', type: 'success', title: 'Streak Achievement!', message: "You've maintained a 12-day learning streak." },
];

const icons = {
  success: <CheckCircle className="w-5 h-5 text-success-500" />,
  error: <AlertCircle className="w-5 h-5 text-danger-500" />,
  info: <Info className="w-5 h-5 text-primary-500" />,
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (notifications.length === 0) setOpen(false);
  }, [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
              <span className="text-xs text-surface-500">{notifications.length} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-surface-400">No new notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">{icons[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{n.message}</p>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
