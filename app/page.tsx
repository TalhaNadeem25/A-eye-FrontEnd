'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Shield, Eye } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary p-3 rounded-full">
            <Camera className="text-primary-foreground" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Surveillance Dashboard
        </h1>
        <p className="text-muted-foreground mb-4">
          Redirecting to login...
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
