'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'manager' | 'operator';
export type SessionStatus = 'active' | 'expired' | 'revoked';

export interface User {
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

export interface SessionInfo {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  location: string;
  device: string;
  status: SessionStatus;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessions: SessionInfo[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  revokeSession: (sessionId: string) => void;
  revokeAllSessions: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'manager@demo.com',
    name: 'John Manager',
    role: 'manager',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sessionId: 'sess_001',
    ipAddress: '192.168.1.100',
    location: 'Austin, TX',
    device: 'Chrome on Windows'
  },
  {
    id: '2',
    email: 'operator@demo.com',
    name: 'Sarah Operator',
    role: 'operator',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    sessionId: 'sess_002',
    ipAddress: '192.168.1.101',
    location: 'Austin, TX',
    device: 'Firefox on macOS'
  }
];

const mockSessions: SessionInfo[] = [
  {
    sessionId: 'sess_001',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    ipAddress: '192.168.1.100',
    location: 'Austin, TX',
    device: 'Chrome on Windows',
    status: 'active'
  },
  {
    sessionId: 'sess_002',
    startTime: new Date(Date.now() - 30 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 60 * 1000),
    ipAddress: '192.168.1.101',
    location: 'Austin, TX',
    device: 'Firefox on macOS',
    status: 'active'
  },
  {
    sessionId: 'sess_003',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
    ipAddress: '192.168.1.102',
    location: 'Dallas, TX',
    device: 'Safari on iOS',
    status: 'expired'
  }
];

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
    'system_settings'
  ],
  operator: [
    'view_dashboard',
    'view_cameras',
    'forward_alerts'
  ]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>(mockSessions);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('surveillance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foundUser = mockUsers.find(u => u.email === email && password === 'demo123');
    
    if (foundUser) {
      const userWithSession = {
        ...foundUser,
        lastLogin: new Date(),
        sessionId: `sess_${Date.now()}`,
        ipAddress: '192.168.1.100',
        location: 'Austin, TX',
        device: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other Browser'
      };
      
      setUser(userWithSession);
      localStorage.setItem('surveillance_user', JSON.stringify(userWithSession));
      
      // Add new session to sessions list
      const newSession: SessionInfo = {
        sessionId: userWithSession.sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        ipAddress: userWithSession.ipAddress,
        location: userWithSession.location,
        device: userWithSession.device,
        status: 'active'
      };
      
      setSessions(prev => [newSession, ...prev]);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('surveillance_user');
    // Clear any other stored data
    localStorage.clear();
    // Reset sessions to empty
    setSessions([]);
  };

  const revokeSession = (sessionId: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, status: 'revoked' as SessionStatus }
          : session
      )
    );
    
    // If current user's session is revoked, log them out
    if (user?.sessionId === sessionId) {
      logout();
    }
  };

  const revokeAllSessions = () => {
    setSessions(prev => 
      prev.map(session => ({ ...session, status: 'revoked' as SessionStatus }))
    );
    logout();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return permissions[user.role].includes(permission);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sessions,
    login,
    logout,
    revokeSession,
    revokeAllSessions,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
