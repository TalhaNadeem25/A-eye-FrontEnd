'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, UserPlus, AlertCircle, CheckCircle, Fingerprint } from 'lucide-react';

interface CustomSignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CustomSignupForm({ onSuccess, onError }: CustomSignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator' as 'manager' | 'operator',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Check password strength when password changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let feedback = '';

    if (score < 3) {
      feedback = 'Weak password';
    } else if (score < 5) {
      feedback = 'Medium strength';
    } else {
      feedback = 'Strong password';
    }

    setPasswordStrength({
      score,
      feedback,
      requirements
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Try direct signup first
      const response = await fetch('/api/auth/direct-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        } else {
          // Auto-login after successful signup
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      } else {
        // If direct signup fails, redirect to Auth0 signup
        console.log('Direct signup failed, redirecting to Auth0 signup');
        handleAuth0Signup();
      }
    } catch (err) {
      console.log('Direct signup error, redirecting to Auth0 signup:', err);
      // If direct signup fails, redirect to Auth0 signup
      handleAuth0Signup();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth0Signup = () => {
    // Get Auth0 configuration from environment or use defaults
    const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL || 'https://dev-lff8lsy17l7njekf.us.auth0.com';
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'cIABDPcYiagEVK3TD2nP7OBUu8MwhJPx';
    const baseUrl = process.env.NEXT_PUBLIC_AUTH0_BASE_URL || 'http://localhost:3005';

    // Create Auth0 signup URL with pre-filled email
    const signupUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback`,
      scope: 'openid profile email',
      prompt: 'login',
      screen_hint: 'signup',
      login_hint: formData.email
    });

    // Redirect to Auth0 signup
    window.location.href = signupUrl;
  };

  const handleSocialSignup = (provider: string) => {
    setIsLoading(true);
    // Only redirect to Auth0 for social signup, not for email/password
    window.location.href = `/api/auth/[...auth0]?action=login&connection=${provider}`;
  };

  const handleBiometricSignup = () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use Email passwordless connection for signup
      window.location.href = `/api/auth/[...auth0]?action=login&connection=email&screen_hint=signup`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Passwordless signup failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Account Created Successfully!</h3>
          <p className="text-sm text-muted-foreground">
            Your account has been created. You'll be redirected to the dashboard shortly.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-3 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-10 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2 space-y-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.score < 3 ? 'text-destructive' :
                    passwordStrength.score < 5 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength.feedback}
                  </span>
                </div>
                
                {/* Password Strength Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score < 3 ? 'bg-destructive' :
                      passwordStrength.score < 5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${
                  passwordStrength.requirements.length ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    passwordStrength.requirements.length ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center text-xs ${
                  passwordStrength.requirements.uppercase ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    passwordStrength.requirements.uppercase ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  One uppercase letter
                </div>
                <div className={`flex items-center text-xs ${
                  passwordStrength.requirements.lowercase ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    passwordStrength.requirements.lowercase ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  One lowercase letter
                </div>
                <div className={`flex items-center text-xs ${
                  passwordStrength.requirements.number ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    passwordStrength.requirements.number ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  One number
                </div>
                <div className={`flex items-center text-xs ${
                  passwordStrength.requirements.special ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    passwordStrength.requirements.special ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-10 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="block w-full py-3 px-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          >
            <option value="operator">Operator - View and monitor cameras</option>
            <option value="manager">Manager - Full access to all features</option>
          </select>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
            className="mt-1 h-4 w-4 text-primary border-border rounded focus:ring-primary"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
            I agree to the{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </>
          )}
        </button>

        {/* Biometric Signup Button */}
        <button
          type="button"
          onClick={handleBiometricSignup}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-primary rounded-md bg-primary/10 text-primary hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Setting up biometric...
            </>
          ) : (
            <>
              <Fingerprint className="h-4 w-4 mr-2" />
              Passwordless Email Signup
            </>
          )}
        </button>

        {/* Alternative Auth0 Signup Button */}
        <button
          type="button"
          onClick={handleAuth0Signup}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-border rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Shield className="h-4 w-4 mr-2" />
          Create Account with Auth0
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        {/* Social Signup Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialSignup('google-oauth2')}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignup('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
