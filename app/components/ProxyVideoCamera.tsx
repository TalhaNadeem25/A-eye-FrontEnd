'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ExternalLink, Wifi, WifiOff, RefreshCw, Play, Pause, AlertTriangle } from 'lucide-react';

interface ProxyVideoCameraProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function ProxyVideoCamera({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: ProxyVideoCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [showDirectLink, setShowDirectLink] = useState(false);
  const maxRetries = 2; // Reduced retries

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive bg-destructive/20';
      case 'medium': return 'border-warning bg-warning/20';
      case 'low': return 'border-primary bg-primary/20';
      default: return 'border-border';
    }
  };

  const startVideo = () => {
    if (videoRef.current) {
      setIsLoading(true);
      setHasError(false);
      setConnectionStatus('connecting');
      
      // Try different approaches for video loading
      const video = videoRef.current;
      
      // Method 1: Direct URL
      video.src = cameraUrl;
      video.load();
      
      // Set a timeout
      const timeout = setTimeout(() => {
        if (isLoading) {
          handleVideoError('Connection timeout');
        }
      }, 8000);
      
      // Clear timeout on success
      const handleSuccess = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(false);
        setConnectionStatus('connected');
        setIsPlaying(true);
        setRetryCount(0);
        setShowDirectLink(false);
      };
      
      video.addEventListener('loadeddata', handleSuccess, { once: true });
      video.addEventListener('canplay', handleSuccess, { once: true });
    }
  };

  const handleVideoError = (errorMessage: string) => {
    console.error('Video error:', errorMessage);
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('disconnected');
    setIsPlaying(false);
    setShowDirectLink(true);
    
    // Retry logic
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        startVideo();
      }, 3000);
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      setIsPlaying(false);
      setConnectionStatus('disconnected');
    }
  };

  const refreshCamera = () => {
    setRetryCount(0);
    setHasError(false);
    setShowDirectLink(false);
    startVideo();
  };

  const openDirect = () => {
    window.open(cameraUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: any) => {
      handleVideoError(`Video error: ${e.target?.error?.message || 'Unknown error'}`);
    };

    const handleStalled = () => {
      console.log('Video stalled, attempting to resume...');
      video.load();
    };

    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
    };
  }, [retryCount]);

  // Auto-start when component mounts
  useEffect(() => {
    if (isOnline) {
      startVideo();
    }
    return () => {
      stopVideo();
    };
  }, [isOnline]);

  return (
    <div className={`glassmorphism border rounded-lg p-4 hover-lift transition-all duration-300 ${
      hasAlert ? getAlertColor() : 'border-border'
    }`}>
      {/* Camera Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera size={20} className="text-primary" />
          <span className="font-semibold text-foreground">{cameraName}</span>
          <span className="text-xs text-muted-foreground">({cameraId})</span>
        </div>
        <div className="flex items-center space-x-2">
          {hasError ? (
            <WifiOff size={16} className="text-destructive" />
          ) : connectionStatus === 'connecting' ? (
            <Wifi size={16} className="text-warning animate-pulse" />
          ) : (
            <Wifi size={16} className="text-success" />
          )}
          <span className={`text-xs ${
            hasError ? 'text-destructive' : 
            connectionStatus === 'connecting' ? 'text-warning' : 'text-success'
          }`}>
            {hasError ? 'Error' : connectionStatus === 'connecting' ? 'Connecting...' : 'Live'}
          </span>
        </div>
      </div>

      {/* Video Feed */}
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
        {hasError && retryCount >= maxRetries ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Camera className="text-destructive mx-auto mb-2" size={32} />
              <p className="text-sm text-destructive mb-2">Video stream unavailable</p>
              <div className="space-y-2">
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={refreshCamera}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 flex items-center space-x-1"
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                  <button
                    onClick={openDirect}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 flex items-center space-x-1"
                  >
                    <ExternalLink size={12} />
                    <span>Open Direct</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The video stream may be blocked by CORS policy or require authentication.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              controls={false}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-black/70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading video stream...</span>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button
                onClick={isPlaying ? stopVideo : startVideo}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title={isPlaying ? 'Stop Video' : 'Start Video'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={refreshCamera}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title="Refresh Stream"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={openDirect}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink size={16} />
              </button>
            </div>

            {/* Stream Type Indicator */}
            <div className="absolute top-2 left-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                VIDEO STREAM
              </div>
            </div>

            {/* Retry Counter */}
            {retryCount > 0 && retryCount < maxRetries && (
              <div className="absolute top-2 right-2">
                <div className="bg-warning/80 text-warning-foreground px-2 py-1 rounded text-xs">
                  Retry {retryCount}/{maxRetries}
                </div>
              </div>
            )}

            {/* CORS Warning */}
            {showDirectLink && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-warning/90 text-warning-foreground px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <AlertTriangle size={16} />
                  <span>CORS blocked - Use "Open Direct"</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: External Video Stream</span>
          <span>Status: {connectionStatus}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]" title={cameraUrl}>
            URL: {cameraUrl.length > 25 ? `${cameraUrl.substring(0, 25)}...` : cameraUrl}
          </span>
          <span>Type: MJPEG/HTTP</span>
        </div>
        {!hasError && !isLoading && connectionStatus === 'connected' && (
          <div className="text-xs text-success font-medium">
            ✓ Video stream connected
          </div>
        )}
        {hasError && retryCount >= maxRetries && (
          <div className="text-xs text-destructive font-medium">
            ⚠ Video stream blocked - try "Open Direct" button
          </div>
        )}
        {retryCount > 0 && retryCount < maxRetries && (
          <div className="text-xs text-warning font-medium">
            ⚠ Retrying connection... ({retryCount}/{maxRetries})
          </div>
        )}
        {showDirectLink && (
          <div className="text-xs text-warning font-medium">
            💡 CORS policy may be blocking the stream - use "Open Direct" to view
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={openDirect}
          className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink size={12} />
          <span>Open Direct</span>
        </button>
        <button
          onClick={refreshCamera}
          className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
