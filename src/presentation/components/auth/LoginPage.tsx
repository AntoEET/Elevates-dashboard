'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Sparkles, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  // Clear error on input change
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [userId, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(userId, password);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Login Card */}
        <div className="glass border border-glass-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Elevates</h1>
            <p className="text-sm text-muted-foreground mt-1">AI Decision Engine</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* User ID */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium mb-2">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                placeholder="Enter your user ID"
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Secure access to your executive dashboard
          </p>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          v1.0.0
        </p>
      </div>
    </div>
  );
}
