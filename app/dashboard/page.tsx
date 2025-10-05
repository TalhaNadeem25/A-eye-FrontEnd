'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CameraFeed from '../components/CameraFeed';
import WebcamFeed from '../components/WebcamFeed';
import DirectVideoStream from '../components/DirectVideoStream';
import MotionDetectionDemo from '../components/MotionDetectionDemo';
import TestTrigger from '../components/TestTrigger';
import AlertPanel from '../components/AlertPanel';
import AudioPlayer from '../components/AudioPlayer';
import SessionManager from '../components/SessionManager';
import LoginInsights from '../components/LoginInsights';
import RoleDebug from '../components/RoleDebug';
import { Activity, Camera, AlertTriangle, Users } from 'lucide-react';
import { useAuth0 } from '../contexts/Auth0Context';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const mockCameras = [
  { id: 'CAM-001', name: 'Main Entrance', isOnline: true, hasAlert: true, alertLevel: 'high' as const },
  { id: 'CAM-002', name: 'Parking Lot', isOnline: true, hasAlert: false, alertLevel: 'low' as const },
  { id: 'CAM-003', name: 'Reception Area', isOnline: true, hasAlert: true, alertLevel: 'medium' as const },
  { id: 'CAM-004', name: 'Back Office', isOnline: false, hasAlert: false, alertLevel: 'low' as const },
];

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

export default function DashboardPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();
  const [webcamAlerts, setWebcamAlerts] = useState<any[]>([]);
  const { hasPermission, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  // Route guard - redirect to login if not authenticated
  useEffect(() => {
    console.log('Dashboard useEffect - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new alerts occasionally
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newAlert = {
          id: `alert-${Date.now()}`,
          cameraId: 'CAM-001',
          cameraName: 'Main Entrance',
          timestamp: new Date(),
          confidence: Math.random() * 40 + 60, // 60-100%
          description: 'Motion detected in monitored area',
          imageUrl: '/api/placeholder/400/300?text=Motion+Detected',
          audioUrl: '/api/audio/motion-alert.mp3',
          status: 'new' as const,
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 5000);

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


  const handleAudioStateChange = (isPlaying: boolean) => {
    setIsPlayingAudio(isPlaying);
    if (!isPlaying) {
      setCurrentAudioUrl(undefined);
    }
  };

  const handleWebcamMotion = () => {
    console.log('Motion detected from webcam!');
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

  const onlineCameras = mockCameras.filter(camera => camera.isOnline).length;
  const newAlertsCount = alerts.filter(alert => alert.status === 'new').length;
  const totalAlerts = alerts.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <a 
            href="/test"
            className="flex items-center space-x-2 px-4 py-2 bg-warning/20 text-warning rounded-md hover:bg-warning/30 transition-colors"
          >
            <AlertTriangle size={16} />
            <span>Test Alerts</span>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Cameras</p>
                <p className="text-2xl font-bold text-foreground">{onlineCameras}/{mockCameras.length}</p>
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

        {/* Test Trigger Section */}
        <div className="mb-6">
          <TestTrigger onAlert={handleWebcamAlert} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Camera Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">Camera Feeds</h2>
              <p className="text-sm text-muted-foreground">Live surveillance feeds from all cameras</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* External Security Camera */}
              <DirectVideoStream
                cameraId="EXT-001"
                cameraName="Sentinel AI Security Camera"
                cameraUrl="https://sentinelai.crisiscopilot.tech/video_feed"
                isOnline={true}
                hasAlert={false}
                alertLevel="low"
                onMotionDetected={handleWebcamMotion}
                onAlert={handleWebcamAlert}
              />
              
              {/* Real Webcam Feed */}
              <WebcamFeed
                cameraId="WEBCAM-001"
                cameraName="Laptop Webcam"
                isOnline={true}
                hasAlert={webcamAlerts.length > 0}
                alertLevel={webcamAlerts.length > 0 ? 'high' : 'low'}
                onMotionDetected={handleWebcamMotion}
                onAlert={handleWebcamAlert}
              />
              
              {/* Motion Detection Demo */}
              <MotionDetectionDemo />
              
              {/* Mock Camera Feeds */}
              {mockCameras.map((camera) => (
                <CameraFeed
                  key={camera.id}
                  cameraId={camera.id}
                  cameraName={camera.name}
                  isOnline={camera.isOnline}
                  hasAlert={camera.hasAlert}
                  alertLevel={camera.alertLevel}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Alerts Panel */}
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledge}
              onDismiss={handleDismiss}
            />
            
            {/* Role Debug - Temporary for debugging */}
            <RoleDebug />
            
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
