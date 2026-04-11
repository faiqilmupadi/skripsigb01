"use client";

import { useCallback, useState } from "react";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((xs) => xs.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((title: string, message: string, ms = 3500) => {
    const id = uid();
    const toast: ToastItem = { id, title, message };
    setToasts((xs) => [toast, ...xs].slice(0, 5));

    if (ms > 0) {
      window.setTimeout(() => dismiss(id), ms);
    }
    return id;
  }, [dismiss]);

  return { toasts, push, dismiss };
}
