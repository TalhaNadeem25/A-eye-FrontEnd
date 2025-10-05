'use client';

import { useState, useEffect } from 'react';
import { Fingerprint, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { biometricAuth, BiometricUser } from '../services/BiometricAuth';

interface BiometricLoginProps {
  onSuccess: (user: BiometricUser) => void;
  onError: (error: string) => void;
  onFallback: () => void;
}

export default function BiometricLogin({ onSuccess, onError, onFallback }: BiometricLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = biometricAuth.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        const available = await biometricAuth.isAvailable();
        setIsAvailable(available);
      }
    };

    checkSupport();
  }, []);

  const handleBiometricLogin = async () => {
    if (!isSupported) {
      onError('Biometric authentication not supported on this device');
      return;
    }

    setIsLoading(true);
    setStatus('authenticating');
    setErrorMessage('');

    try {
      const user = await biometricAuth.authenticate();
      
      if (user) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(user);
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage('Biometric authentication failed. Please try again or use password login.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Biometric authentication error. Please use password login.');
      console.error('Biometric login error:', error);
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
        return <Fingerprint className="text-primary" size={24} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking biometric support...';
      case 'authenticating':
        return 'Please use your fingerprint or face ID...';
      case 'success':
        return 'Authentication successful!';
      case 'error':
        return errorMessage;
      default:
        return 'Use biometric authentication';
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

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <AlertCircle className="text-muted-foreground mx-auto mb-2" size={32} />
        <p className="text-sm text-muted-foreground mb-4">
          Biometric authentication is not supported on this device
        </p>
        <button
          onClick={onFallback}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Use Password Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Biometric Login Button */}
      <button
        onClick={handleBiometricLogin}
        disabled={isLoading || !isAvailable}
        className={getButtonClass()}
      >
        {getStatusIcon()}
        <div className="text-left">
          <div className="font-medium">
            {isLoading ? 'Authenticating...' : 'Biometric Login'}
          </div>
          <div className="text-sm opacity-75">
            {getStatusText()}
          </div>
        </div>
      </button>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-success' : 'bg-destructive'}`} />
          <span>WebAuthn Supported</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-success' : 'bg-warning'}`} />
          <span>Biometric Available</span>
        </div>
      </div>

      {/* Fallback Option */}
      <div className="text-center">
        <button
          onClick={onFallback}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Use password login instead
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
        <div className="flex items-start space-x-2">
          <Shield size={14} className="mt-0.5 text-primary" />
          <div>
            <p className="font-medium text-foreground mb-1">Secure Biometric Authentication</p>
            <p>Your biometric data never leaves your device. We use WebAuthn standards for maximum security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
