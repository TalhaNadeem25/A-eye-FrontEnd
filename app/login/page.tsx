'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Shield } from 'lucide-react';
import { useAuth0 } from '../contexts/Auth0Context';
import CustomLoginForm from '../components/CustomLoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth0();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Camera className="text-primary-foreground" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Surveillance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Secure Authentication Portal
          </p>
        </div>

        {/* Auth0 Login Form */}
        <div className="glassmorphism border border-border rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome Back
            </h3>
            <p className="text-sm text-muted-foreground">
              Please sign in to access your surveillance dashboard
            </p>
          </div>

          <CustomLoginForm />

          {/* Features */}
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Features:</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">• Enterprise-grade security</p>
              <p className="text-xs text-muted-foreground">• Role-based access control</p>
              <p className="text-xs text-muted-foreground">• Social login options</p>
              <p className="text-xs text-muted-foreground">• User management</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Secure</h3>
            <p className="text-xs text-muted-foreground">Enterprise authentication</p>
          </div>
          <div className="flex flex-col items-center">
            <Camera className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Live Monitoring</h3>
            <p className="text-xs text-muted-foreground">Real-time surveillance</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Management</h3>
            <p className="text-xs text-muted-foreground">User & role management</p>
          </div>
        </div>
      </div>
    </div>
  );
}