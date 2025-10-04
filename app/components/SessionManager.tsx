'use client';

import { useState } from 'react';
import { Shield, MapPin, Monitor, Clock, AlertTriangle, X, RefreshCw, LogOut } from 'lucide-react';
import { useAuth, SessionInfo } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function SessionManager() {
  const { user, sessions, revokeSession, revokeAllSessions, logout, hasPermission } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!hasPermission('view_sessions')) {
    return null;
  }

  const activeSessions = sessions.filter(s => s.status === 'active');
  const expiredSessions = sessions.filter(s => s.status === 'expired');
  const revokedSessions = sessions.filter(s => s.status === 'revoked');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'expired': return 'text-warning';
      case 'revoked': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-success rounded-full" />;
      case 'expired': return <div className="w-2 h-2 bg-warning rounded-full" />;
      case 'revoked': return <div className="w-2 h-2 bg-destructive rounded-full" />;
      default: return <div className="w-2 h-2 bg-muted rounded-full" />;
    }
  };

  return (
    <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Security Sessions</h3>
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            {activeSessions.length} Active
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            {isExpanded ? <X size={16} /> : <RefreshCw size={16} />}
          </button>
        </div>
      </div>

      {/* Current User Session */}
      {user && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role.toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-xs text-success">Current Session</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <MapPin size={12} />
                <span>{user.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Monitor size={12} />
                <span>{user.device}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Session Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-success">{activeSessions.length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-warning">{expiredSessions.length}</div>
          <div className="text-xs text-muted-foreground">Expired</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-destructive">{revokedSessions.length}</div>
          <div className="text-xs text-muted-foreground">Revoked</div>
        </div>
      </div>

      {/* Session List */}
      {isExpanded && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(session.status)}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.device}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <MapPin size={10} />
                      <span>{session.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{format(session.lastActivity, 'HH:mm')}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${getStatusColor(session.status)}`}>
                  {session.status.toUpperCase()}
                </span>
                {session.status === 'active' && hasPermission('revoke_sessions') && (
                  <button
                    onClick={() => revokeSession(session.sessionId)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive transition-colors"
                    title="Revoke Session"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Actions */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        {hasPermission('revoke_sessions') && activeSessions.length > 1 && (
          <button
            onClick={revokeAllSessions}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
          >
            <AlertTriangle size={16} />
            <span>Revoke All Other Sessions</span>
          </button>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
