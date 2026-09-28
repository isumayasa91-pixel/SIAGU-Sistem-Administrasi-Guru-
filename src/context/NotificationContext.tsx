import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X, CloudCheck } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (options: { title?: string; message: string; type?: NotificationType; duration?: number }) => void;
  notifySuccess: (message: string, title?: string) => void;
  notifySaved: (entityName: string, detail?: string) => void;
  notifyInfo: (message: string, title?: string) => void;
  notifyWarning: (message: string, title?: string) => void;
  notifyError: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  lastSavedAt: Date | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Gentle, modern audio feedback using Web Audio API
const playSaveChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Pleasant chord progression (F#5 to B5)
    osc1.frequency.setValueAtTime(554.37, now); // C#5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.15); // C#6

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // Ignore autoplay restriction or browser limitations
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    ({
      title = 'Data Berhasil Disimpan',
      message,
      type = 'success',
      duration = 3800,
    }: {
      title?: string;
      message: string;
      type?: NotificationType;
      duration?: number;
    }) => {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newItem: NotificationItem = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
        duration,
      };

      if (type === 'success') {
        setLastSavedAt(new Date());
        playSaveChime();
      }

      setNotifications((prev) => {
        // Keep max 4 toasts at once to prevent screen clutter
        const filtered = prev.slice(-3);
        return [...filtered, newItem];
      });

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const notifySuccess = useCallback(
    (message: string, title: string = 'Data Berhasil Disimpan') => {
      notify({ title, message, type: 'success' });
    },
    [notify]
  );

  const notifySaved = useCallback(
    (entityName: string, detail?: string) => {
      const message = detail || `${entityName} berhasil disimpan ke memori dan database cloud.`;
      notify({
        title: `${entityName} Berhasil Disimpan`,
        message,
        type: 'success',
      });
    },
    [notify]
  );

  const notifyInfo = useCallback(
    (message: string, title: string = 'Informasi') => {
      notify({ title, message, type: 'info' });
    },
    [notify]
  );

  const notifyWarning = useCallback(
    (message: string, title: string = 'Peringatan') => {
      notify({ title, message, type: 'warning' });
    },
    [notify]
  );

  const notifyError = useCallback(
    (message: string, title: string = 'Gagal Menyimpan') => {
      notify({ title, message, type: 'error', duration: 5000 });
    },
    [notify]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notify,
        notifySuccess,
        notifySaved,
        notifyInfo,
        notifyWarning,
        notifyError,
        dismiss,
        lastSavedAt,
      }}
    >
      {children}

      {/* Floating Toast Notification Container (Fixed at top-right) */}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print px-3 sm:px-0"
      >
        {notifications.map((n) => {
          const isSuccess = n.type === 'success';
          const isInfo = n.type === 'info';
          const isWarning = n.type === 'warning';
          const isError = n.type === 'error';

          return (
            <div
              key={n.id}
              role="alert"
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-3 flex items-start gap-3 ${
                isSuccess
                  ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20'
                  : isInfo
                  ? 'bg-slate-900/95 text-white border-blue-500/50 shadow-blue-950/20'
                  : isWarning
                  ? 'bg-amber-900/95 text-white border-amber-500/50 shadow-amber-950/20'
                  : 'bg-rose-900/95 text-white border-rose-500/50 shadow-rose-950/20'
              }`}
            >
              {/* Status Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                {isInfo && (
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                    <Info className="w-5 h-5" />
                  </div>
                )}
                {isWarning && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                {isError && (
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold tracking-tight text-white leading-tight">
                    {n.title}
                  </h4>
                  {isSuccess && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Tersimpan
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {n.message}
                </p>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 pt-1.5 border-t border-white/10">
                  <span>SIAGU Cloud Sync</span>
                  <span>{new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismiss(n.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Notifikasi"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
