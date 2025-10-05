'use client';

import { useState } from 'react';
import { Camera, Shield, Eye, User, Users, Fingerprint } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import BiometricLogin from '../components/BiometricLogin';
import WindowsHelloLogin from '../components/WindowsHelloLogin';
import { BiometricUser } from '../services/BiometricAuth';
import { WindowsHelloUser } from '../services/WindowsHelloAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const [selectedRole, setSelectedRole] = useState<'manager' | 'operator'>('manager');
  const [showBiometric, setShowBiometric] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [useWindowsHello, setUseWindowsHello] = useState(true);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleRoleSelect = (role: 'manager' | 'operator') => {
    setSelectedRole(role);
    if (role === 'manager') {
      setEmail('manager@demo.com');
    } else {
      setEmail('operator@demo.com');
    }
    setPassword('demo123');
  };

  const handleBiometricSuccess = async (user: BiometricUser | WindowsHelloUser) => {
    // Convert biometric user to auth user format and login
    setIsLoading(true);
    const success = await auth.login(user.email, 'biometric');
    if (success) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  };

  const handleBiometricError = (error: string) => {
    console.error('Biometric authentication error:', error);
    // Could show a toast notification here
  };

  const handleBiometricFallback = () => {
    setShowBiometric(false);
    setShowPasswordForm(true);
  };


  const handleShowWindowsHello = () => {
    setShowPasswordForm(false);
    setShowBiometric(true);
    setUseWindowsHello(true);
  };

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
            Manager Login Portal
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Select Role</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('manager')}
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                selectedRole === 'manager'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User size={20} />
                <div className="text-left">
                  <div className="font-medium">Manager</div>
                  <div className="text-xs text-muted-foreground">Full Access</div>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('operator')}
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                selectedRole === 'operator'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={20} />
                <div className="text-left">
                  <div className="font-medium">Operator</div>
                  <div className="text-xs text-muted-foreground">Monitor Only</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Login Options */}
        <div className="glassmorphism border border-border rounded-lg p-6 shadow-lg">
          {/* Biometric Login */}
          {showBiometric && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Fingerprint className="text-primary mx-auto mb-2" size={32} />
                <h3 className="text-lg font-semibold text-foreground">
                  {useWindowsHello ? 'Windows Hello Authentication' : 'Biometric Authentication'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {useWindowsHello 
                    ? 'Use your fingerprint, face recognition, or PIN to sign in'
                    : 'Use your fingerprint or face ID to sign in'
                  }
                </p>
              </div>
              
              {useWindowsHello ? (
                <WindowsHelloLogin
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                  onFallback={handleBiometricFallback}
                />
              ) : (
                <BiometricLogin
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                  onFallback={handleBiometricFallback}
                />
              )}
            </div>
          )}

          {/* Password Login */}
          {showPasswordForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Password Login</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleShowWindowsHello}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Fingerprint size={16} />
                    <span>Windows Hello</span>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="manager@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Manager: manager@demo.com</p>
              <p className="text-xs text-muted-foreground">Operator: operator@demo.com</p>
              <p className="text-xs text-muted-foreground">Password: demo123</p>
            </div>
          </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Fingerprint className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Windows Hello</h3>
            <p className="text-xs text-muted-foreground">Fingerprint & Face Recognition</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="text-primary mb-2" size={24} />
            <h3 className="text-sm font-medium text-foreground">Secure Access</h3>
            <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
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
