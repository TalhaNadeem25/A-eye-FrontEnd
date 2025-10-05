'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, BellOff, Volume2, VolumeX, Settings, Trash2 } from 'lucide-react';
import EventCard from './EventCard';

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

interface RealTimeAlertManagerProps {
  alerts: DynamicAlert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export default function RealTimeAlertManager({ 
  alerts, 
  onAcknowledge, 
  onDismiss, 
  onClearAll 
}: RealTimeAlertManagerProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  const [alertCounts, setAlertCounts] = useState({
    total: 0,
    new: 0,
    acknowledged: 0,
    dismissed: 0
  });

  // Update alert counts when alerts change
  useEffect(() => {
    const counts = {
      total: alerts.length,
      new: alerts.filter(alert => alert.status === 'new').length,
      acknowledged: alerts.filter(alert => alert.status === 'acknowledged').length,
      dismissed: alerts.filter(alert => alert.status === 'dismissed').length
    };
    setAlertCounts(counts);
  }, [alerts]);

  // Play alert sound for new alerts
  const playAlertSound = useCallback((alert: DynamicAlert) => {
    if (!isSoundEnabled || !alert.audioUrl) return;
    
    try {
      const audio = new Audio(alert.audioUrl);
      audio.volume = soundVolume;
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
        // Fallback to system beep
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(soundVolume * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }
      });
    } catch (error) {
      console.log('Alert sound error:', error);
    }
  }, [isSoundEnabled, soundVolume]);

  // Show browser notification for new alerts
  const showNotification = useCallback((alert: DynamicAlert) => {
    if (!isNotificationsEnabled || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(`Security Alert - ${alert.cameraName}`, {
        body: alert.description,
        icon: '/Gemini_Generated_Image_sztu51sztu51sztu.png',
        tag: alert.id,
        requireInteraction: true
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Security Alert - ${alert.cameraName}`, {
            body: alert.description,
            icon: '/Gemini_Generated_Image_sztu51sztu51sztu.png',
            tag: alert.id,
            requireInteraction: true
          });
        }
      });
    }
  }, [isNotificationsEnabled]);

  // Handle new alerts
  useEffect(() => {
    const newAlerts = alerts.filter(alert => 
      alert.status === 'new' && 
      (!lastAlertTime || alert.timestamp > lastAlertTime)
    );
    
    if (newAlerts.length > 0) {
      const latestAlert = newAlerts[newAlerts.length - 1];
      setLastAlertTime(latestAlert.timestamp);
      
      // Play sound and show notification for the latest alert
      playAlertSound(latestAlert);
      showNotification(latestAlert);
    }
  }, [alerts, lastAlertTime, playAlertSound, showNotification]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/20 border-destructive';
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/50';
      case 'medium': return 'text-warning bg-warning/10 border-warning/50';
      case 'low': return 'text-primary bg-primary/10 border-primary/50';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="glassmorphism border border-border rounded-lg h-full flex flex-col hover-lift transition-all duration-300 max-w-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-warning" size={20} />
            <h2 className="text-lg font-semibold bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent">
              Real-Time Alerts
            </h2>
            {alertCounts.new > 0 && (
              <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                {alertCounts.new} New
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-md transition-colors ${
                isSoundEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
              title={isSoundEnabled ? 'Disable Sound' : 'Enable Sound'}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
              className={`p-2 rounded-md transition-colors ${
                isNotificationsEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
              title={isNotificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            >
              {isNotificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            <button
              onClick={onClearAll}
              className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              title="Clear All Alerts"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Sound Volume Control */}
        {isSoundEnabled && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Alert Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Volume: {Math.round(soundVolume * 100)}%
            </div>
          </div>
        )}

        {/* Alert Statistics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-muted/50 rounded p-2">
            <div className="text-lg font-semibold text-foreground">{alertCounts.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="bg-destructive/20 rounded p-2">
            <div className="text-lg font-semibold text-destructive">{alertCounts.new}</div>
            <div className="text-xs text-muted-foreground">New</div>
          </div>
          <div className="bg-warning/20 rounded p-2">
            <div className="text-lg font-semibold text-warning">{alertCounts.acknowledged}</div>
            <div className="text-xs text-muted-foreground">Acknowledged</div>
          </div>
          <div className="bg-muted/50 rounded p-2">
            <div className="text-lg font-semibold text-muted-foreground">{alertCounts.dismissed}</div>
            <div className="text-xs text-muted-foreground">Dismissed</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <AlertTriangle size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No alerts detected</p>
            <p className="text-xs mt-1">Camera monitoring is active</p>
          </div>
        ) : (
          alerts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                  getSeverityColor(alert.severity)
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <div className="font-medium text-sm">{alert.cameraName}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">{alert.confidence}%</div>
                    <div className="text-xs text-muted-foreground capitalize">{alert.alertType}</div>
                  </div>
                </div>
                
                <div className="text-sm mb-3">{alert.description}</div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {alert.status === 'new' && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-3 py-1 bg-warning text-warning-foreground rounded text-xs hover:bg-warning/90 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/90 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {alert.status}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="text-xs text-muted-foreground text-center">
          Real-time monitoring active • {alerts.length} total alerts
        </div>
      </div>
    </div>
  );
}
