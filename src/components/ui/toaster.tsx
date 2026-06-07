"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, Toast } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, message, type, duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/20 dark:border-emerald-500/10",
    error: "border-rose-500/20 dark:border-rose-500/10",
    info: "border-blue-500/20 dark:border-blue-500/10",
    warning: "border-amber-500/20 dark:border-amber-500/10",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      className={cn(
        "pointer-events-auto flex items-center justify-between p-4 rounded-2xl bg-white/95 dark:bg-[#07070b]/95 border shadow-lg backdrop-blur-md w-full text-foreground relative overflow-hidden",
        borders[type] || "border-border"
      )}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-xs font-semibold leading-normal">{message}</span>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
