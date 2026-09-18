import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function formatErrorMessage(rawMessage: any): string {
  if (!rawMessage) return 'Something went wrong. Please try again.';
  if (typeof rawMessage === 'string') {
    try {
      const parsed = JSON.parse(rawMessage);
      if (parsed.error?.message) return formatErrorMessage(parsed.error.message);
      if (parsed.message) return formatErrorMessage(parsed.message);
    } catch {}

    const lower = rawMessage.toLowerCase();
    if (lower.includes('quota') || lower.includes('429') || lower.includes('rate limit')) {
      return 'AI generation limit reached. Please try again in a few moments.';
    }
    if (lower.includes('network') || lower.includes('failed to fetch')) {
      return 'Unable to reach the server. Please check your connection.';
    }
    if (lower.includes('popup-closed')) {
      return 'Sign-in cancelled. Popup closed.';
    }
    if (lower.includes('popup-blocked')) {
      return 'Popups blocked by browser. Please allow popups to sign in.';
    }
    if (lower.includes('unauthorized') || lower.includes('401')) {
      return 'Session expired. Please sign in to continue.';
    }
    // Trim excessively long technical stack traces
    if (rawMessage.length > 90) {
      return rawMessage.slice(0, 85) + '...';
    }
    return rawMessage;
  }
  if (rawMessage?.message) return formatErrorMessage(rawMessage.message);
  return 'Something went wrong. Please try again.';
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const cleanMessage = type === 'error' ? formatErrorMessage(message) : message;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, type, message: cleanMessage }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showError = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const showSuccess = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const showInfo = useCallback((msg: string) => addToast('info', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      {/* Toast notification container */}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border text-xs shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-[#161b22] border-[#f85149]/40 text-[#f0883e]'
                : toast.type === 'success'
                ? 'bg-[#161b22] border-[#238636]/40 text-[#3fb950]'
                : 'bg-[#161b22] border-[#30363d] text-[#58a6ff]'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-[#f85149]" />}
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3fb950]" />}
              {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-[#58a6ff]" />}
              <span className="truncate font-medium text-[#e6edf3]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#7d8590] hover:text-[#e6edf3] transition-colors rounded hover:bg-[#21262d] shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showError: (m: string) => console.error(m),
      showSuccess: (m: string) => console.log(m),
      showInfo: (m: string) => console.info(m),
    };
  }
  return context;
}
