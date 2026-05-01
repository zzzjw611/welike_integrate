"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICON_MAP: Record<ToastType, ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-brand-500" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  info: <AlertCircle className="h-4 w-4 text-blue-400" />,
};

const BG_MAP: Record<ToastType, string> = {
  success: "border-brand-500/20 bg-brand-500/10",
  error: "border-red-500/20 bg-red-500/10",
  info: "border-blue-500/20 bg-blue-500/10",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border ${BG_MAP[toast.type]} px-4 py-3 text-sm text-surface-200 shadow-xl backdrop-blur-sm animate-[fadeSlideUp_0.3s_ease-out]`}
          >
            {ICON_MAP[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-surface-500 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
