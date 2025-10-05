'use client';

import { Camera, Shield, Eye, User, Users, Fingerprint } from 'lucide-react';
import Auth0LoginButton from '../../components/Auth0LoginButton';

export default function Auth0LoginPage() {

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

          {/* Auth0 Login Options */}
          <div className="glassmorphism border border-border rounded-lg p-6 shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Choose Authentication Method
              </h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred login method
              </p>
            </div>

            <Auth0LoginButton />

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Auth0 Features:</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">• Universal Login with multiple providers</p>
                <p className="text-xs text-muted-foreground">• Social login (Google, Facebook, GitHub)</p>
                <p className="text-xs text-muted-foreground">• Email/Password authentication</p>
                <p className="text-xs text-muted-foreground">• Role-based access control</p>
                <p className="text-xs text-muted-foreground">• Management API integration</p>
              </div>
            </div>
          </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Auth0 Security</h3>
            <p className="text-xs text-muted-foreground">Enterprise-grade authentication</p>
          </div>
          <div className="flex flex-col items-center">
            <User className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Social Login</h3>
            <p className="text-xs text-muted-foreground">Google, Facebook, GitHub</p>
          </div>
          <div className="flex flex-col items-center">
            <Eye className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Live Monitoring</h3>
            <p className="text-xs text-muted-foreground">Real-time surveillance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
