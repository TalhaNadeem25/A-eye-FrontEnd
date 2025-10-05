'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, Search, RefreshCw, Download, 
  CheckCircle, Clock, Camera, MapPin, 
  Volume2, Eye, TrendingUp, Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { exportAlertsToCSV, exportAlertsToPDF } from '../utils/exportUtils';

interface AlertData {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  type: 'motion' | 'intrusion' | 'fire' | 'person' | 'vehicle' | 'object';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  status: 'new' | 'acknowledged' | 'dismissed' | 'investigating';
  location: string;
  duration: number; // in seconds
  tags: string[];
  assignedTo?: string;
  notes?: string;
}

export default function AlertsPage() {
  const { hasPermission } = useAuth();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'acknowledged' | 'dismissed' | 'investigating'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterType, setFilterType] = useState<'all' | 'motion' | 'intrusion' | 'fire' | 'person' | 'vehicle' | 'object'>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  // Mock data for demonstration
  const mockAlerts: AlertData[] = [
    {
      id: 'alert-001',
      cameraId: 'CAM-001',
      cameraName: 'Main Entrance',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'motion',
      severity: 'high',
      confidence: 92.5,
      description: 'Motion detected in restricted area',
      imageUrl: '/api/placeholder/400/300?text=Motion+Detected',
      audioUrl: '/api/audio/motion-alert.mp3',
      status: 'new',
      location: 'Building A - Front Door',
      duration: 15,
      tags: ['motion', 'entrance', 'security'],
      assignedTo: 'Security Team'
    },
    {
      id: 'alert-002',
      cameraId: 'CAM-002',
      cameraName: 'Parking Lot',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'vehicle',
      severity: 'medium',
      confidence: 87.3,
      description: 'Unauthorized vehicle detected',
      imageUrl: '/api/placeholder/400/300?text=Vehicle+Detected',
      status: 'acknowledged',
      location: 'Building A - Parking Area',
      duration: 45,
      tags: ['vehicle', 'parking', 'unauthorized'],
      assignedTo: 'Security Team',
      notes: 'Vehicle appears to be abandoned'
    },
    {
      id: 'alert-003',
      cameraId: 'CAM-003',
      cameraName: 'Reception Area',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'person',
      severity: 'low',
      confidence: 78.9,
      description: 'Person detected after hours',
      imageUrl: '/api/placeholder/400/300?text=Person+Detected',
      status: 'investigating',
      location: 'Building A - Lobby',
      duration: 120,
      tags: ['person', 'after-hours', 'lobby'],
      assignedTo: 'Night Security',
      notes: 'Cleaning staff - verified'
    },
    {
      id: 'alert-004',
      cameraId: 'CAM-001',
      cameraName: 'Main Entrance',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'intrusion',
      severity: 'critical',
      confidence: 95.1,
      description: 'Potential security breach detected',
      imageUrl: '/api/placeholder/400/300?text=Intrusion+Detected',
      audioUrl: '/api/audio/intrusion-alert.mp3',
      status: 'dismissed',
      location: 'Building A - Front Door',
      duration: 30,
      tags: ['intrusion', 'security', 'breach'],
      assignedTo: 'Security Team',
      notes: 'False alarm - maintenance worker'
    },
    {
      id: 'alert-005',
      cameraId: 'CAM-005',
      cameraName: 'Storage Room',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'object',
      severity: 'medium',
      confidence: 82.4,
      description: 'Object left unattended',
      imageUrl: '/api/placeholder/400/300?text=Object+Detected',
      status: 'acknowledged',
      location: 'Building B - Storage',
      duration: 60,
      tags: ['object', 'storage', 'unattended'],
      assignedTo: 'Facilities Team'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadAlerts = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
      setIsLoading(false);
    };

    loadAlerts();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate new alerts occasionally
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newAlert: AlertData = {
          id: `alert-${Date.now()}`,
          cameraId: `CAM-${Math.floor(Math.random() * 5) + 1}`,
          cameraName: `Camera ${Math.floor(Math.random() * 5) + 1}`,
          timestamp: new Date(),
          type: ['motion', 'person', 'vehicle'][Math.floor(Math.random() * 3)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          confidence: Math.random() * 40 + 60,
          description: 'New alert detected',
          imageUrl: '/api/placeholder/400/300?text=New+Alert',
          status: 'new',
          location: 'Unknown Location',
          duration: Math.floor(Math.random() * 60) + 10,
          tags: ['new', 'detected']
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    if (!hasPermission('acknowledge_alerts')) return;
    
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
  };

  const handleDismiss = (alertId: string) => {
    if (!hasPermission('dismiss_alerts')) return;
    
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'dismissed' as const }
        : alert
    ));
  };

  const handleInvestigate = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'investigating' as const }
        : alert
    ));
  };

  const handleBulkAction = (action: 'acknowledge' | 'dismiss' | 'investigate') => {
    selectedAlerts.forEach(alertId => {
      if (action === 'acknowledge') handleAcknowledge(alertId);
      if (action === 'dismiss') handleDismiss(alertId);
      if (action === 'investigate') handleInvestigate(alertId);
    });
    setSelectedAlerts([]);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.type === filterType;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-400 bg-blue-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-primary bg-primary/20';
      case 'acknowledged': return 'text-success bg-success/20';
      case 'dismissed': return 'text-muted-foreground bg-muted/20';
      case 'investigating': return 'text-warning bg-warning/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'motion': return <TrendingUp size={16} />;
      case 'intrusion': return <Shield size={16} />;
      case 'fire': return <AlertTriangle size={16} />;
      case 'person': return <Eye size={16} />;
      case 'vehicle': return <Camera size={16} />;
      case 'object': return <AlertTriangle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Alert Management</h1>
                <p className="text-muted-foreground">
                  Monitor and manage security alerts in real-time
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => exportAlertsToCSV(alerts)}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => exportAlertsToPDF(alerts)}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                </div>
                <AlertTriangle className="text-primary" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Alerts</p>
                  <p className="text-2xl font-bold text-warning">{alerts.filter(a => a.status === 'new').length}</p>
                </div>
                <Clock className="text-warning" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Acknowledged</p>
                  <p className="text-2xl font-bold text-success">{alerts.filter(a => a.status === 'acknowledged').length}</p>
                </div>
                <CheckCircle className="text-success" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{alerts.filter(a => a.severity === 'critical').length}</p>
                </div>
                <Shield className="text-destructive" size={24} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="glassmorphism border border-border rounded-lg p-6 mb-6 hover-lift transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search alerts by description, camera, or location..."
                  className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'new' | 'acknowledged' | 'dismissed' | 'investigating')}
                  className="px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="investigating">Investigating</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'critical')}
                  className="px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'motion' | 'intrusion' | 'fire' | 'person' | 'vehicle' | 'object')}
                  className="px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  <option value="motion">Motion</option>
                  <option value="intrusion">Intrusion</option>
                  <option value="fire">Fire</option>
                  <option value="person">Person</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="object">Object</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAlerts.length > 0 && (
            <div className="glassmorphism border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedAlerts.length} alert(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('acknowledge')}
                    className="px-3 py-1 bg-success/20 text-success rounded-md hover:bg-success/30 transition-colors text-sm"
                  >
                    Acknowledge All
                  </button>
                  <button
                    onClick={() => handleBulkAction('investigate')}
                    className="px-3 py-1 bg-warning/20 text-warning rounded-md hover:bg-warning/30 transition-colors text-sm"
                  >
                    Investigate All
                  </button>
                  <button
                    onClick={() => handleBulkAction('dismiss')}
                    className="px-3 py-1 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors text-sm"
                  >
                    Dismiss All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="glassmorphism border border-border rounded-lg p-8 text-center">
                <AlertTriangle className="text-muted-foreground mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Alerts Found</h3>
                <p className="text-muted-foreground">No alerts match your current filters.</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div key={alert.id} className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlerts(prev => [...prev, alert.id]);
                          } else {
                            setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(alert.type)}
                            <span className="font-semibold text-foreground">{alert.cameraName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{alert.location}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp size={14} />
                            <span>{alert.confidence.toFixed(1)}% confidence</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{alert.duration}s duration</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.audioUrl && (
                        <button className="p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors">
                          <Volume2 size={16} />
                        </button>
                      )}
                      <button className="p-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Alert Image */}
                  <div className="mb-4">
                    <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground">Alert Image</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {alert.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {alert.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-3 py-1 bg-success/20 text-success rounded-md hover:bg-success/30 transition-colors text-sm"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleInvestigate(alert.id)}
                            className="px-3 py-1 bg-warning/20 text-warning rounded-md hover:bg-warning/30 transition-colors text-sm"
                          >
                            Investigate
                          </button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button
                          onClick={() => handleInvestigate(alert.id)}
                          className="px-3 py-1 bg-warning/20 text-warning rounded-md hover:bg-warning/30 transition-colors text-sm"
                        >
                          Investigate
                        </button>
                      )}
                      {alert.status === 'investigating' && (
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="px-3 py-1 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors text-sm"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.assignedTo && `Assigned to: ${alert.assignedTo}`}
                    </div>
                  </div>

                  {/* Notes */}
                  {alert.notes && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {alert.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
