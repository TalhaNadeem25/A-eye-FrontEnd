'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, MapPin, Clock, RefreshCw, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

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

export default function LoginInsights() {
  const [data, setData] = useState<LoginInsightsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          recentAttempts: [newAttempt, ...prev.recentAttempts.slice(0, 9)]
        };
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [mockData]);

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

  if (isLoading) {
    return (
      <div className="glassmorphism border border-border rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="text-primary" size={20} />
          <h2 className="text-lg font-semibold text-foreground">Security Login Insights</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{data.totalAttempts}</div>
          <div className="text-xs text-muted-foreground">Total Attempts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{data.successfulLogins}</div>
          <div className="text-xs text-muted-foreground">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive">{data.failedLogins}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{data.activeUsers}</div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </div>
      </div>

      {/* Security Alerts */}
      {data.securityAlerts.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Security Alerts</h3>
          <div className="space-y-2">
            {data.securityAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-destructive" size={14} />
                  <span className="text-sm text-foreground">{alert.description}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Recent Login Attempts */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Recent Login Attempts</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {data.recentAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(attempt.status)}
                    <div>
                      <div className="text-sm font-medium text-foreground">{attempt.email}</div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{attempt.location}</span>
                        <span>•</span>
                        <span>{attempt.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(attempt.timestamp, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Top Login Locations</h3>
            <div className="space-y-1">
              {data.topLocations.slice(0, 4).map((location, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{location.location}</span>
                  <span className="text-muted-foreground">{location.count} logins</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suspicious IPs */}
          {data.suspiciousIPs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Suspicious IPs</h3>
              <div className="flex flex-wrap gap-2">
                {data.suspiciousIPs.map((ip, index) => (
                  <span key={index} className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-md">
                    {ip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
          <span>Real-time monitoring active</span>
        </div>
      </div>
    </div>
  );
}
