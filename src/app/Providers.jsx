"use client";

import { AuthProvider } from '../contexts/AuthContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { ToastProvider } from '../components/UI/Toast';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ToastProvider>{children}</ToastProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
