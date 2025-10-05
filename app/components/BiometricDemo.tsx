'use client';

import { useState } from 'react';
import { Fingerprint, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function BiometricDemo() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const simulateBiometricAuth = async () => {
    setIsAuthenticating(true);
    setIsSuccess(false);
    setIsError(false);

    // Simulate biometric authentication process
    setTimeout(() => {
      setIsAuthenticating(false);
      // Simulate 90% success rate for demo
      if (Math.random() > 0.1) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 3000);
      }
    }, 2000);
  };

  return (
    <div className="glassmorphism border border-border rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Biometric Authentication Demo</h3>
        <p className="text-sm text-muted-foreground">
          Experience the future of secure authentication
        </p>
      </div>

      <div className="space-y-4">
        {/* Biometric Options */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Fingerprint className="text-primary" size={20} />
            <span className="text-sm font-medium">Fingerprint</span>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <User className="text-primary" size={20} />
            <span className="text-sm font-medium">Face ID</span>
          </div>
        </div>

        {/* Demo Button */}
        <button
          onClick={simulateBiometricAuth}
          disabled={isAuthenticating}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
            isSuccess
              ? 'border-success bg-success/10 text-success'
              : isError
              ? 'border-destructive bg-destructive/10 text-destructive'
              : isAuthenticating
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-primary hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          {isAuthenticating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              <span>Authenticating...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle size={20} />
              <span>Authentication Successful!</span>
            </>
          ) : isError ? (
            <>
              <AlertCircle size={20} />
              <span>Authentication Failed</span>
            </>
          ) : (
            <>
              <Shield size={20} />
              <span>Try Biometric Authentication</span>
            </>
          )}
        </button>

        {/* Security Features */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Security Features</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              <span>WebAuthn Standard Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              <span>Biometric data never leaves device</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              <span>Phishing-resistant authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              <span>Multi-factor authentication ready</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is a demo simulation. Real biometric authentication requires device support.
          </p>
        </div>
      </div>
    </div>
  );
}
