"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICON_MAP: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

const COLOR_MAP: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    text: "text-secondary",
    icon: "text-secondary",
  },
  error: {
    bg: "bg-error/10",
    border: "border-error/30",
    text: "text-error",
    icon: "text-error",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    icon: "text-primary",
  },
  warning: {
    bg: "bg-tertiary/10",
    border: "border-tertiary/30",
    text: "text-tertiary",
    icon: "text-tertiary",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-[400px]">
        {toasts.map((toast) => {
          const colors = COLOR_MAP[toast.type];
          return (
            <div
              key={toast.id}
              className={`${colors.bg} ${colors.border} border backdrop-blur-md rounded-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-start gap-3 animate-[slideInRight_0.3s_ease-out]`}
              role="alert"
            >
              <span
                className={`material-symbols-outlined ${colors.icon} text-[20px] mt-0.5 flex-shrink-0`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {ICON_MAP[toast.type]}
              </span>
              <p className={`font-body-md text-sm ${colors.text} flex-1`}>{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-outline hover:text-on-surface transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
