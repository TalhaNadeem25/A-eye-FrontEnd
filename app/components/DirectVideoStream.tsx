'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ExternalLink, Wifi, WifiOff, RefreshCw, Play, Pause, AlertTriangle, Maximize2 } from 'lucide-react';

interface DirectVideoStreamProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function DirectVideoStream({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: DirectVideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const maxRetries = 1; // Quick retry

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
      setShowFallback(false);
      
      const video = videoRef.current;
      
      // Try multiple approaches
      const tryVideoLoad = () => {
        // Method 1: Direct URL
        video.src = cameraUrl;
        video.load();
        
        // Set timeout
        const timeout = setTimeout(() => {
          if (isLoading) {
            // Try iframe fallback
            setShowFallback(true);
            setIsLoading(false);
            setConnectionStatus('disconnected');
          }
        }, 5000);
        
        // Clear timeout on success
        const handleSuccess = () => {
          clearTimeout(timeout);
          setIsLoading(false);
          setHasError(false);
          setConnectionStatus('connected');
          setIsPlaying(true);
          setRetryCount(0);
        };
        
        video.addEventListener('loadeddata', handleSuccess, { once: true });
        video.addEventListener('canplay', handleSuccess, { once: true });
        video.addEventListener('error', () => {
          clearTimeout(timeout);
          setShowFallback(true);
          setIsLoading(false);
          setConnectionStatus('disconnected');
        }, { once: true });
      };
      
      tryVideoLoad();
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
    setShowFallback(false);
    startVideo();
  };

  const openDirect = () => {
    window.open(cameraUrl, '_blank', 'noopener,noreferrer');
  };

  const openFullscreen = () => {
    const newWindow = window.open(
      cameraUrl, 
      '_blank', 
      'width=1200,height=800,scrollbars=yes,resizable=yes,location=no,menubar=no,toolbar=no,status=no'
    );
    if (newWindow) {
      newWindow.focus();
    }
  };

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
        {showFallback ? (
          <iframe
            src={cameraUrl}
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            title={`${cameraName} Camera Feed`}
          />
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

            {/* Fallback Indicator */}
            {showFallback && (
              <div className="absolute top-2 right-2">
                <div className="bg-warning/80 text-warning-foreground px-2 py-1 rounded text-xs">
                  IFRAME FALLBACK
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: {showFallback ? 'Iframe Fallback' : 'Direct Video'}</span>
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
        {showFallback && (
          <div className="text-xs text-warning font-medium">
            ⚠ Using iframe fallback - may be blocked by CORS
          </div>
        )}
        {hasError && (
          <div className="text-xs text-destructive font-medium">
            ⚠ Video stream failed - try "Open in New Tab" button
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={openDirect}
          className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink size={12} />
          <span>Open in New Tab</span>
        </button>
        <button
          onClick={openFullscreen}
          className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <Play size={12} />
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  );
}
