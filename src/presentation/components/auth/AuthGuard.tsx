'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { checkSession, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Check session on mount and sync with server
  React.useEffect(() => {
    checkSession().finally(() => setIsHydrated(true));
  }, [checkSession]);

  // Show loading state while checking session
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Middleware handles actual protection - this just syncs client state
  // If we reach here without authentication, middleware allowed it (public route)
  // or we have a valid session
  return <>{children}</>;
}
