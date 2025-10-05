'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WebcamFeed from '../components/WebcamFeed';
import EnhancedWebcamFeed from '../components/EnhancedWebcamFeed';
import DirectVideoStream from '../components/DirectVideoStream';
import ImprovedCameraFeed from '../components/ImprovedCameraFeed';
import MotionDetectionDemo from '../components/MotionDetectionDemo';
import AlertPanel from '../components/AlertPanel';
import RealTimeAlertManager from '../components/RealTimeAlertManager';
import DynamicAlertSystem from '../components/DynamicAlertSystem';
import AudioPlayer from '../components/AudioPlayer';
import SessionManager from '../components/SessionManager';
import LoginInsights from '../components/LoginInsights';
import { Activity, Camera, AlertTriangle, Users } from 'lucide-react';
import { useAuth0 } from '../contexts/Auth0Context';
import { useRouter } from 'next/navigation';


const mockAlerts = [
  {
    id: 'alert-001',
    cameraId: 'CAM-001',
    cameraName: 'Main Entrance',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    confidence: 87.5,
    description: 'Unauthorized person detected at main entrance',
    imageUrl: '/api/placeholder/400/300?text=Person+Detected',
    audioUrl: '/api/audio/alert-001.mp3',
    status: 'new' as const,
  },
  {
    id: 'alert-002',
    cameraId: 'CAM-003',
    cameraName: 'Reception Area',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    confidence: 72.3,
    description: 'Suspicious activity in reception area',
    imageUrl: '/api/placeholder/400/300?text=Suspicious+Activity',
    audioUrl: '/api/audio/alert-002.mp3',
    status: 'acknowledged' as const,
  },
  {
    id: 'alert-003',
    cameraId: 'CAM-002',
    cameraName: 'Parking Lot',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    confidence: 95.1,
    description: 'Vehicle break-in attempt detected',
    imageUrl: '/api/placeholder/400/300?text=Vehicle+Break-in',
    audioUrl: '/api/audio/alert-003.mp3',
    status: 'dismissed' as const,
  },
];

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

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<DynamicAlert[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();
  const [webcamAlerts, setWebcamAlerts] = useState<any[]>([]);
  const [cameraStatus, setCameraStatus] = useState<Record<string, { isOnline: boolean; hasAlert: boolean }>>({
    'EXT-001': { isOnline: true, hasAlert: false },
    'WEBCAM-001': { isOnline: true, hasAlert: false }
  });
  const { hasPermission, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  // Route guard - redirect to login if not authenticated
  useEffect(() => {
    console.log('Dashboard useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle dynamic alerts from cameras
  const handleDynamicAlert = (alert: DynamicAlert) => {
    console.log('🚨 New dynamic alert received:', alert);
    setAlerts(prev => [alert, ...prev]);
    
    // Update camera status
    setCameraStatus(prev => ({
      ...prev,
      [alert.cameraId]: {
        ...(prev[alert.cameraId] || { isOnline: true, hasAlert: false }),
        hasAlert: true
      }
    }));
    
    // Play audio if available
    if (alert.audioUrl) {
      setCurrentAudioUrl(alert.audioUrl);
    }
  };

  // Handle motion detection from cameras
  const handleMotionDetected = (cameraId: string) => {
    console.log('🎯 Motion detected from camera:', cameraId);
    setCameraStatus(prev => ({
      ...prev,
      [cameraId]: {
        ...(prev[cameraId] || { isOnline: true, hasAlert: false }),
        hasAlert: true
      }
    }));
  };

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

  const handleClearAll = () => {
    setAlerts([]);
    setCameraStatus(prev => ({
      'EXT-001': { isOnline: true, hasAlert: false },
      'WEBCAM-001': { isOnline: true, hasAlert: false }
    }));
  };


  const handleAudioStateChange = (isPlaying: boolean) => {
    setIsPlayingAudio(isPlaying);
    if (!isPlaying) {
      setCurrentAudioUrl(undefined);
    }
  };

  const handleWebcamMotion = () => {
    console.log('Motion detected from webcam!');
    handleMotionDetected('WEBCAM-001');
  };

  const handleWebcamAlert = (alertData: any) => {
    console.log('Webcam alert:', alertData);
    setWebcamAlerts(prev => [alertData, ...prev]);
    setAlerts(prev => [alertData, ...prev]);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const onlineCameras = 2; // SentinelAI + Webcam
  const newAlertsCount = alerts.filter(alert => alert.status === 'new').length;
  const totalAlerts = alerts.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Cameras</p>
                <p className="text-2xl font-bold text-foreground">{onlineCameras}/2</p>
              </div>
              <Camera className="text-primary" size={24} />
            </div>
          </div>
          
          <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Alerts</p>
                <p className="text-2xl font-bold text-destructive">{newAlertsCount}</p>
              </div>
              <AlertTriangle className="text-destructive" size={24} />
            </div>
          </div>
          
          <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-foreground">{totalAlerts}</p>
              </div>
              <Activity className="text-warning" size={24} />
            </div>
          </div>
          
          <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-success">Online</p>
              </div>
              <Users className="text-success" size={24} />
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Camera Grid */}
          <div className="lg:col-span-3 max-w-full overflow-hidden">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Camera Feeds</h2>
              <p className="text-sm text-muted-foreground">Live surveillance feeds from all cameras</p>
            </div>
            
            <div className="space-y-6">
              {/* External Security Camera - Top */}
              <div className="space-y-4 min-w-0">
                <div className="min-h-[500px] w-full">
                  <ImprovedCameraFeed
                    cameraId="EXT-001"
                    cameraName="Security Camera"
                    cameraUrl="https://sentinelai.crisiscopilot.tech/video_feed"
                    isOnline={cameraStatus['EXT-001'].isOnline}
                    hasAlert={cameraStatus['EXT-001'].hasAlert}
                    alertLevel={cameraStatus['EXT-001'].hasAlert ? 'high' : 'low'}
                    onMotionDetected={() => handleMotionDetected('EXT-001')}
                    onAlert={handleWebcamAlert}
                  />
                </div>
                <DynamicAlertSystem
                  cameraId="EXT-001"
                  cameraName="Security Camera"
                  cameraUrl="https://sentinelai.crisiscopilot.tech/video_feed"
                  isOnline={cameraStatus['EXT-001'].isOnline}
                  onAlert={handleDynamicAlert}
                  onMotionDetected={() => handleMotionDetected('EXT-001')}
                />
              </div>
              
              {/* Webcam Motion Detection - Bottom */}
              <div className="min-h-[500px] min-w-0">
                <MotionDetectionDemo 
                  onMotionDetected={handleWebcamMotion}
                  onAlert={handleWebcamAlert}
                />
              </div>
              
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6 min-w-0">
            {/* Real-Time Alerts Panel */}
            <RealTimeAlertManager
              alerts={alerts}
              onAcknowledge={handleAcknowledge}
              onDismiss={handleDismiss}
              onClearAll={handleClearAll}
            />
            
            
            {/* Login Insights - Only for Managers */}
            {hasPermission('view_sessions') && (
              <LoginInsights />
            )}
            
            {/* Session Manager - Only for Managers */}
            {hasPermission('view_sessions') && (
              <SessionManager />
            )}
          </div>
        </div>

        {/* Audio Player */}
        {currentAudioUrl && (
          <div className="fixed bottom-4 right-4 z-50">
            <AudioPlayer
              audioUrl={currentAudioUrl}
              isPlaying={isPlayingAudio}
              onPlayStateChange={handleAudioStateChange}
              className="w-80"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
