'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Camera, Activity, Zap } from 'lucide-react';

interface DynamicAlert {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  confidence: number;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  status: 'new' | 'acknowledged' | 'dismissed';
  alertType: 'motion' | 'person' | 'vehicle' | 'suspicious' | 'connection_lost';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DynamicAlertSystemProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline: boolean;
  onAlert: (alert: DynamicAlert) => void;
  onMotionDetected?: () => void;
}

export default function DynamicAlertSystem({ 
  cameraId, 
  cameraName, 
  cameraUrl, 
  isOnline,
  onAlert,
  onMotionDetected 
}: DynamicAlertSystemProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const [lastMotionTime, setLastMotionTime] = useState<Date | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());
  
  const motionThreshold = 0.3; // Sensitivity threshold
  const alertCooldown = 5000; // 5 seconds between alerts
  const lastAlertTime = useRef<number>(0);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Simulate motion detection based on camera status and activity
  const simulateMotionDetection = () => {
    if (!isOnline || !isMonitoring) return;

    // Simulate random motion events
    const motionProbability = 0.02; // 2% chance per check
    const randomValue = Math.random();
    
    if (randomValue < motionProbability) {
      const motionIntensity = Math.random();
      setMotionLevel(motionIntensity);
      setLastMotionTime(new Date());
      
      if (motionIntensity > motionThreshold) {
        generateMotionAlert(motionIntensity);
      }
      
      onMotionDetected?.();
    } else {
      // Gradually decrease motion level
      setMotionLevel(prev => Math.max(0, prev - 0.1));
    }
  };

  const generateMotionAlert = (intensity: number) => {
    const now = Date.now();
    if (now - lastAlertTime.current < alertCooldown) return;
    
    lastAlertTime.current = now;
    
    const alertTypes = ['motion', 'person', 'vehicle', 'suspicious'] as const;
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const severity = intensity > 0.8 ? 'critical' : 
                    intensity > 0.6 ? 'high' : 
                    intensity > 0.4 ? 'medium' : 'low';
    
    const descriptions = {
      motion: 'Motion detected in monitored area',
      person: 'Person detected in restricted area',
      vehicle: 'Vehicle detected in parking area',
      suspicious: 'Suspicious activity detected'
    };
    
    const alert: DynamicAlert = {
      id: `alert-${cameraId}-${Date.now()}`,
      cameraId,
      cameraName,
      timestamp: new Date(),
      confidence: Math.round(intensity * 100),
      description: descriptions[alertType],
      imageUrl: `/api/placeholder/400/300?text=${encodeURIComponent(descriptions[alertType])}&camera=${cameraId}`,
      audioUrl: `/api/audio/alert-${alertType}.mp3`,
      status: 'new',
      alertType,
      severity
    };
    
    console.log('🚨 Dynamic Alert Generated:', alert);
    onAlert(alert);
  };

  const generateConnectionAlert = () => {
    if (connectionLost) return;
    
    setConnectionLost(true);
    const alert: DynamicAlert = {
      id: `alert-${cameraId}-connection-${Date.now()}`,
      cameraId,
      cameraName,
      timestamp: new Date(),
      confidence: 100,
      description: 'Camera connection lost - attempting to reconnect',
      imageUrl: `/api/placeholder/400/300?text=Connection+Lost&camera=${cameraId}`,
      status: 'new',
      alertType: 'connection_lost',
      severity: 'high'
    };
    
    console.log('🔌 Connection Alert Generated:', alert);
    onAlert(alert);
  };

  const startMonitoring = () => {
    if (monitoringInterval.current) return;
    
    setIsMonitoring(true);
    setConnectionLost(false);
    setLastSeen(new Date());
    
    // Start motion detection simulation
    monitoringInterval.current = setInterval(simulateMotionDetection, 1000);
    
    // Monitor connection status
    const connectionInterval = setInterval(() => {
      if (!isOnline) {
        generateConnectionAlert();
      } else {
        setConnectionLost(false);
        setLastSeen(new Date());
      }
    }, 5000);
    
    return () => clearInterval(connectionInterval);
  };

  const stopMonitoring = () => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    setIsMonitoring(false);
  };

  // Auto-start monitoring when camera comes online
  useEffect(() => {
    if (isOnline && !isMonitoring) {
      startMonitoring();
    } else if (!isOnline && isMonitoring) {
      stopMonitoring();
    }
    
    return () => stopMonitoring();
  }, [isOnline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  const getMotionColor = () => {
    if (motionLevel > 0.8) return 'text-destructive';
    if (motionLevel > 0.6) return 'text-warning';
    if (motionLevel > 0.3) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getMotionIcon = () => {
    if (motionLevel > 0.6) return <Zap className="animate-pulse" size={16} />;
    if (motionLevel > 0.3) return <Activity className="animate-pulse" size={16} />;
    return <Activity size={16} />;
  };

  return (
    <div className="glassmorphism border border-border rounded-lg p-3 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Camera size={16} className="text-primary" />
          <span className="text-sm font-medium">{cameraName}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isMonitoring ? (
            <div className="flex items-center space-x-1">
              {getMotionIcon()}
              <span className={`text-xs ${getMotionColor()}`}>
                {Math.round(motionLevel * 100)}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Offline</span>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Status: {isMonitoring ? 'Monitoring' : 'Stopped'}</span>
          <span>Last Motion: {lastMotionTime ? lastMotionTime.toLocaleTimeString() : 'None'}</span>
        </div>
        
        {connectionLost && (
          <div className="flex items-center space-x-1 text-xs text-destructive">
            <AlertTriangle size={12} />
            <span>Connection Lost</span>
          </div>
        )}
        
        {isMonitoring && (
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                motionLevel > 0.8 ? 'bg-destructive' :
                motionLevel > 0.6 ? 'bg-warning' :
                motionLevel > 0.3 ? 'bg-primary' : 'bg-muted-foreground'
              }`}
              style={{ width: `${motionLevel * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
