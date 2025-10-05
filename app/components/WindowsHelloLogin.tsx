'use client';

import { useState, useEffect } from 'react';
import { Fingerprint, Shield, CheckCircle, AlertCircle, Monitor } from 'lucide-react';
// Fixed: Replaced Windows icon with Monitor icon
import { windowsHelloAuth, WindowsHelloUser } from '../services/WindowsHelloAuth';

interface WindowsHelloLoginProps {
  onSuccess: (user: WindowsHelloUser) => void;
  onError: (error: string) => void;
  onFallback: () => void;
}

export default function WindowsHelloLogin({ onSuccess, onFallback }: WindowsHelloLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isWindowsHello, setIsWindowsHello] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    const checkWindowsHello = async () => {
      // Check if we're on Windows
      const isWindows = navigator.userAgent.includes('Windows');
      setIsWindowsHello(isWindows);
      
      if (isWindows) {
        try {
          const isAvailable = await windowsHelloAuth.isAvailable();
          if (isAvailable) {
            setDeviceInfo('Windows Hello is ready for authentication');
            setStatus('idle');
          } else {
            setDeviceInfo('Windows Hello is not configured on this device');
            setStatus('error');
          }
        } catch {
          setDeviceInfo('Windows Hello is not available');
          setStatus('error');
        }
      } else {
        setDeviceInfo('Windows Hello is only available on Windows devices');
        setStatus('error');
      }
    };

    checkWindowsHello();
  }, []);

  const handleWindowsHelloAuth = async () => {
    setIsLoading(true);
    setStatus('authenticating');
    setErrorMessage('');

    try {
      // Check if Windows Hello is available
      const isAvailable = await windowsHelloAuth.isAvailable();
      if (!isAvailable) {
        throw new Error('Windows Hello is not available on this device');
      }

      // Try real Windows Hello authentication with alternative method
      let user = await windowsHelloAuth.authenticateWithWindowsHello();
      
      // Fallback to original method if needed
      if (!user) {
        user = await windowsHelloAuth.authenticate();
      }
      
      if (user) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(user);
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage('Windows Hello authentication failed. Please try again or use password login.');
      }
    } catch (error) {
      console.error('Windows Hello authentication error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Windows Hello authentication failed. Please try again or use password login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAuth = async () => {
    setIsLoading(true);
    setStatus('authenticating');
    setErrorMessage('');

    try {
      // Simulate Windows Hello authentication for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoUser: WindowsHelloUser = {
        id: 'wh-demo',
        name: 'Demo User',
        email: 'demo@windows.com',
        role: 'manager',
        credentialId: 'demo-credential',
        publicKey: 'demo-key',
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      setStatus('success');
      setTimeout(() => {
        onSuccess(demoUser);
      }, 1000);
    } catch {
      setStatus('error');
      setErrorMessage('Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
      case 'authenticating':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />;
      case 'success':
        return <CheckCircle className="text-success" size={24} />;
      case 'error':
        return <AlertCircle className="text-destructive" size={24} />;
      default:
        return <Monitor className="text-primary" size={24} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking Windows Hello...';
      case 'authenticating':
        return 'Please use your fingerprint or PIN...';
      case 'success':
        return 'Windows Hello authentication successful!';
      case 'error':
        return errorMessage;
      default:
        return 'Use Windows Hello to sign in';
    }
  };

  const getButtonClass = () => {
    const baseClass = "w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg border-2 transition-all duration-300 hover-lift";
    
    switch (status) {
      case 'success':
        return `${baseClass} border-success bg-success/10 text-success`;
      case 'error':
        return `${baseClass} border-destructive bg-destructive/10 text-destructive`;
      case 'authenticating':
        return `${baseClass} border-primary bg-primary/10 text-primary`;
      default:
        return `${baseClass} border-primary hover:border-primary/50 hover:bg-primary/5`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Windows Hello Login Button */}
      <button
        onClick={handleWindowsHelloAuth}
        disabled={isLoading || status === 'error'}
        className={getButtonClass()}
      >
        {getStatusIcon()}
        <div className="text-left">
          <div className="font-medium">
            {isLoading ? 'Authenticating...' : 'Windows Hello Login'}
          </div>
          <div className="text-sm opacity-75">
            {getStatusText()}
          </div>
        </div>
      </button>

      {/* Device Information */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Monitor className="text-primary" size={16} />
          <span className="text-sm font-medium text-foreground">Windows Hello</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>{deviceInfo}</p>
          <p>Supports: Fingerprint, Face recognition, PIN</p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isWindowsHello ? 'bg-success' : 'bg-warning'}`} />
          <span>Windows Hello</span>
        </div>
        <div className="flex items-center space-x-1">
          <Fingerprint size={12} />
          <span>Fingerprint Ready</span>
        </div>
      </div>

      {/* Fallback Options */}
      <div className="space-y-2">
        <div className="text-center">
          <button
            onClick={onFallback}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Use password login instead
          </button>
        </div>
        
        {/* Demo Fallback */}
        {status === 'error' && (
          <div className="text-center">
            <button
              onClick={handleDemoAuth}
              className="text-sm text-primary hover:text-primary/80 transition-colors underline"
            >
              Try demo authentication (for testing)
            </button>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        <div className="flex items-start space-x-2">
          <Shield size={14} className="mt-0.5 text-primary" />
          <div>
            <p className="font-medium text-foreground mb-1">Windows Hello Security</p>
            <p>Your biometric data is encrypted and stored locally on your device. Never transmitted to our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
