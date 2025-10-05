'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type UserRole = 'manager' | 'operator';

export interface Auth0User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  lastLogin: Date;
  sessionId: string;
  ipAddress: string;
  location: string;
  device: string;
}

interface Auth0ContextType {
  user: Auth0User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

// Role-based permissions
const permissions = {
  manager: [
    'view_dashboard',
    'manage_cameras',
    'acknowledge_alerts',
    'dismiss_alerts',
    'view_sessions',
    'revoke_sessions',
    'access_logs',
    'system_settings',
    'manage_settings'
  ],
  operator: [
    'view_dashboard',
    'view_cameras',
    'forward_alerts'
  ]
};

export function Auth0Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Auth0User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for Auth0 user in localStorage or session
    const checkAuth0User = async () => {
      try {
        console.log('🔍 Checking Auth0 user authentication...');
        // Check if user is authenticated with Auth0
        const response = await fetch('/api/auth/me');
        console.log('📡 /api/auth/me response status:', response.status);
        
        if (response.ok) {
          const auth0User = await response.json();
          console.log('✅ Auth0 user found:', auth0User);
          
          // Get role from multiple possible sources
          let userRole: UserRole = 'operator';
          
          // Check Auth0 custom claims first
          if (auth0User['https://surveillance-dashboard.com/roles']) {
            userRole = auth0User['https://surveillance-dashboard.com/roles'] as UserRole;
          }
          // Check user_metadata
          else if (auth0User.user_metadata?.role) {
            userRole = auth0User.user_metadata.role as UserRole;
          }
          // Check app_metadata
          else if (auth0User.app_metadata?.roles && auth0User.app_metadata.roles.length > 0) {
            userRole = auth0User.app_metadata.roles[0] as UserRole;
          }
          // Check direct role property
          else if (auth0User.role) {
            userRole = auth0User.role as UserRole;
          }
          
          console.log('👤 User role determined:', userRole, 'from user data:', auth0User);
          
          const userData: Auth0User = {
            id: auth0User.id || auth0User.sub || '',
            email: auth0User.email || '',
            name: auth0User.name || '',
            role: userRole,
            avatar: auth0User.picture,
            lastLogin: new Date(),
            sessionId: auth0User.id || auth0User.sub || '',
            ipAddress: '192.168.1.100',
            location: 'Austin, TX',
            device: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other Browser'
          };
          setUser(userData);
        } else if (response.status === 401) {
          console.log('🔒 User not authenticated (401) - this is normal for logged out users');
        } else {
          console.log('❌ Unexpected response status:', response.status);
        }
      } catch (error) {
        console.log('💥 Error checking Auth0 user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth0User();
  }, []);

  const login = () => {
    window.location.href = '/api/auth/[...auth0]?action=login';
  };

  const logout = async () => {
    try {
      // Clear local state immediately
      setUser(null);
      setIsLoading(true);
      
      // Call force logout API to clear server-side session
      const response = await fetch('/api/auth/force-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Logout API failed:', response.status);
      }

      // Clear any remaining client-side data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies manually as backup
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name) {
          // Clear with different path and domain combinations
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });

      // Add a small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force reload to ensure clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      setUser(null);
      setIsLoading(true);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return permissions[user.role].includes(permission);
  };

  const value: Auth0ContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission
  };

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth0() {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth0 must be used within an Auth0Provider');
  }
  return context;
}
