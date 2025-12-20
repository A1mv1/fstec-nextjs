"use client";

import { createToast as createToastInUI } from "@/components/ui/toast";

export function toast({
  title,
  description,
  type = "info",
  duration = 5000,
}: {
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning" | "loading";
  duration?: number;
}) {
  if (typeof window === 'undefined') {
    // Server-side - пропускаем
    return;
  }
  
  try {
    createToastInUI({ title, description, type, duration });
  } catch (error) {
    console.error('Error creating toast:', error);
  }
}

export function toastSuccess(title: string, description?: string) {
  toast({ title, description, type: "success" });
}

export function toastError(title: string, description?: string) {
  toast({ title, description, type: "error" });
}

export function toastInfo(title: string, description?: string) {
  toast({ title, description, type: "info" });
}

export function toastWarning(title: string, description?: string) {
  toast({ title, description, type: "warning" });
}
