"use client";

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Suppress Recharts defaultProps warning
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('defaultProps will be removed from function components')) {
        return;
      }
      originalError(...args);
    };
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        themes={['light', 'dark', 'purple', 'system']}
      >
        {children}
        <Toaster />
      </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}