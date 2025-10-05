'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '../contexts/Auth0Context';
import { Shield, AlertTriangle, Users, MapPin, Clock, RefreshCw, TrendingUp, TrendingDown, Download, Search } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Layout from '../components/Layout';

interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  location: string;
  device: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'blocked';
  userAgent: string;
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type: 'multiple_failures' | 'suspicious_ip' | 'unusual_location' | 'brute_force';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  ipAddress?: string;
  location?: string;
  affectedUsers: number;
}

interface LoginInsightsData {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  blockedAttempts: number;
  activeUsers: number;
  suspiciousIPs: string[];
  recentAttempts: LoginAttempt[];
  securityAlerts: SecurityAlert[];
  topLocations: { location: string; count: number }[];
  hourlyStats: { hour: string; attempts: number; successes: number }[];
}

export default function SecurityPage() {
  const { hasPermission } = useAuth0();
  const router = useRouter();
  const [data, setData] = useState<LoginInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const mockData: LoginInsightsData = useMemo(() => ({
    totalAttempts: 1247,
    successfulLogins: 892,
    failedLogins: 298,
    blockedAttempts: 57,
    activeUsers: 12,
    suspiciousIPs: ['192.168.1.999', '10.0.0.45', '203.45.67.89'],
    recentAttempts: [
      {
        id: '1',
        email: 'manager@demo.com',
        ipAddress: '192.168.1.100',
        location: 'Austin, TX',
        device: 'Chrome on Windows',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        riskScore: 0.1
      },
      {
        id: '2',
        email: 'operator@demo.com',
        ipAddress: '192.168.1.101',
        location: 'Austin, TX',
        device: 'Firefox on macOS',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0)',
        riskScore: 0.2
      },
      {
        id: '3',
        email: 'admin@company.com',
        ipAddress: '203.45.67.89',
        location: 'Unknown',
        device: 'Unknown',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'failed',
        userAgent: 'curl/7.68.0',
        riskScore: 0.9
      },
      {
        id: '4',
        email: 'test@test.com',
        ipAddress: '10.0.0.45',
        location: 'Unknown',
        device: 'Unknown',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'blocked',
        userAgent: 'python-requests/2.25.1',
        riskScore: 0.95
      },
      {
        id: '5',
        email: 'hacker@malicious.com',
        ipAddress: '192.168.1.999',
        location: 'Unknown',
        device: 'Unknown',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: 'blocked',
        userAgent: 'python-requests/2.25.1',
        riskScore: 0.98
      },
      {
        id: '6',
        email: 'user@company.com',
        ipAddress: '192.168.1.102',
        location: 'Dallas, TX',
        device: 'Safari on macOS',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        riskScore: 0.1
      }
    ],
    securityAlerts: [
      {
        id: '1',
        type: 'brute_force',
        severity: 'high',
        description: 'Multiple failed login attempts detected from IP 10.0.0.45',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        ipAddress: '10.0.0.45',
        affectedUsers: 3
      },
      {
        id: '2',
        type: 'suspicious_ip',
        severity: 'medium',
        description: 'Login attempt from suspicious IP address',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '203.45.67.89',
        location: 'Unknown',
        affectedUsers: 1
      },
      {
        id: '3',
        type: 'brute_force',
        severity: 'critical',
        description: 'Brute force attack detected from IP 192.168.1.999',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        ipAddress: '192.168.1.999',
        affectedUsers: 5
      }
    ],
    topLocations: [
      { location: 'Austin, TX', count: 45 },
      { location: 'Dallas, TX', count: 23 },
      { location: 'Houston, TX', count: 18 },
      { location: 'Unknown', count: 12 }
    ],
    hourlyStats: [
      { hour: '00:00', attempts: 5, successes: 4 },
      { hour: '01:00', attempts: 3, successes: 3 },
      { hour: '02:00', attempts: 2, successes: 2 },
      { hour: '03:00', attempts: 1, successes: 1 },
      { hour: '04:00', attempts: 0, successes: 0 },
      { hour: '05:00', attempts: 2, successes: 2 },
      { hour: '06:00', attempts: 8, successes: 7 },
      { hour: '07:00', attempts: 15, successes: 14 },
      { hour: '08:00', attempts: 25, successes: 23 },
      { hour: '09:00', attempts: 35, successes: 32 },
      { hour: '10:00', attempts: 42, successes: 38 },
      { hour: '11:00', attempts: 38, successes: 35 },
      { hour: '12:00', attempts: 28, successes: 26 },
      { hour: '13:00', attempts: 32, successes: 30 },
      { hour: '14:00', attempts: 45, successes: 42 },
      { hour: '15:00', attempts: 52, successes: 48 },
      { hour: '16:00', attempts: 48, successes: 45 },
      { hour: '17:00', attempts: 35, successes: 33 },
      { hour: '18:00', attempts: 25, successes: 23 },
      { hour: '19:00', attempts: 18, successes: 17 },
      { hour: '20:00', attempts: 12, successes: 11 },
      { hour: '21:00', attempts: 8, successes: 7 },
      { hour: '22:00', attempts: 5, successes: 4 },
      { hour: '23:00', attempts: 3, successes: 3 }
    ]
  }), []);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
      setIsLoading(false);
    };

    loadData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev;
        
        // Simulate new login attempts
        const newAttempt: LoginAttempt = {
          id: `attempt-${Date.now()}`,
          email: Math.random() > 0.7 ? 'suspicious@test.com' : 'user@company.com',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          location: Math.random() > 0.8 ? 'Unknown' : 'Austin, TX',
          device: 'Chrome on Windows',
          timestamp: new Date(),
          status: Math.random() > 0.8 ? 'failed' : 'success',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          riskScore: Math.random()
        };

        return {
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          successfulLogins: newAttempt.status === 'success' ? prev.successfulLogins + 1 : prev.successfulLogins,
          failedLogins: newAttempt.status === 'failed' ? prev.failedLogins + 1 : prev.failedLogins,
          recentAttempts: [newAttempt, ...prev.recentAttempts.slice(0, 49)]
        };
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [mockData]);

  // Route guard - only managers can access security page
  if (!hasPermission('view_sessions')) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="text-destructive mx-auto mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access security insights.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <TrendingUp className="text-success" size={16} />;
      case 'failed':
        return <TrendingDown className="text-destructive" size={16} />;
      case 'blocked':
        return <AlertTriangle className="text-destructive" size={16} />;
      default:
        return <Clock className="text-muted-foreground" size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-400 bg-blue-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'high':
        return 'text-orange-400 bg-orange-900/20';
      case 'critical':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-muted-foreground bg-muted/20';
    }
  };

  const filteredAttempts = data?.recentAttempts.filter(attempt => {
    const matchesFilter = filter === 'all' || attempt.status === filter;
    const matchesSearch = searchTerm === '' || 
      attempt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.ipAddress.includes(searchTerm) ||
      attempt.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Security Insights</h1>
                <p className="text-muted-foreground">
                  Monitor login attempts, security alerts, and user activity in real-time
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-3xl font-bold text-foreground">{data.totalAttempts}</p>
                </div>
                <Shield className="text-primary" size={32} />
              </div>
            </div>
            
            <div className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful Logins</p>
                  <p className="text-3xl font-bold text-success">{data.successfulLogins}</p>
                </div>
                <TrendingUp className="text-success" size={32} />
              </div>
            </div>
            
            <div className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Attempts</p>
                  <p className="text-3xl font-bold text-destructive">{data.failedLogins}</p>
                </div>
                <TrendingDown className="text-destructive" size={32} />
              </div>
            </div>
            
            <div className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-primary">{data.activeUsers}</p>
                </div>
                <Users className="text-primary" size={32} />
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          {data.securityAlerts.length > 0 && (
            <div className="glassmorphism border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="text-destructive" size={20} />
                <h2 className="text-xl font-semibold text-foreground">Security Alerts</h2>
              </div>
              <div className="space-y-3">
                {data.securityAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="text-destructive" size={20} />
                      <div>
                        <p className="font-medium text-foreground">{alert.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })} • 
                          {alert.ipAddress && ` IP: ${alert.ipAddress}`} • 
                          {alert.affectedUsers} affected users
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Login Attempts */}
          <div className="glassmorphism border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Login Attempts</h2>
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'failed' | 'blocked')}
                  className="px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Attempts</option>
                  <option value="success">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(attempt.status)}
                    <div>
                      <p className="font-medium text-foreground">{attempt.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{attempt.location}</span>
                        </span>
                        <span>{attempt.ipAddress}</span>
                        <span>{attempt.device}</span>
                        <span>Risk: {(attempt.riskScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(attempt.timestamp, { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(attempt.timestamp, 'MMM dd, HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}