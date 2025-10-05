'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ExternalLink, Wifi, WifiOff, RefreshCw, Play, Pause, AlertTriangle, Maximize2, Settings } from 'lucide-react';

interface ImprovedCameraFeedProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function ImprovedCameraFeed({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: ImprovedCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [currentMethod, setCurrentMethod] = useState<'video' | 'iframe' | 'fallback'>('video');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const maxRetries = 3;

  // Fallback video URLs for demo purposes
  const fallbackUrls = [
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
  ];

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive bg-destructive/20';
      case 'medium': return 'border-warning bg-warning/20';
      case 'low': return 'border-primary bg-primary/20';
      default: return 'border-border';
    }
  };

  const tryVideoLoad = async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setHasError(false);
    setConnectionStatus('connecting');
    setErrorMessage('');

    const video = videoRef.current;
    
    try {
      // Try the original URL first
      video.src = cameraUrl;
      video.load();

      const timeout = setTimeout(() => {
        if (isLoading) {
          setErrorMessage('Video load timeout - trying fallback');
          tryFallbackVideo();
        }
      }, 5000);

      const handleSuccess = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(false);
        setConnectionStatus('connected');
        setIsPlaying(true);
        setRetryCount(0);
        setCurrentMethod('video');
      };

      const handleError = () => {
        clearTimeout(timeout);
        setErrorMessage('Video element failed - trying iframe');
        tryIframeLoad();
      };

      video.addEventListener('loadeddata', handleSuccess, { once: true });
      video.addEventListener('canplay', handleSuccess, { once: true });
      video.addEventListener('error', handleError, { once: true });
    } catch (error) {
      setErrorMessage('Video load error - trying iframe');
      tryIframeLoad();
    }
  };

  const tryIframeLoad = () => {
    setCurrentMethod('iframe');
    setConnectionStatus('connecting');
    
    // Iframe will handle its own loading
    setTimeout(() => {
      if (connectionStatus === 'connecting') {
        setErrorMessage('Iframe failed - trying fallback video');
        tryFallbackVideo();
      }
    }, 3000);
  };

  const tryFallbackVideo = () => {
    setCurrentMethod('fallback');
    setConnectionStatus('connecting');
    
    const fallbackUrl = fallbackUrls[retryCount % fallbackUrls.length];
    
    if (videoRef.current) {
      videoRef.current.src = fallbackUrl;
      videoRef.current.load();
      
      setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setHasError(true);
          setConnectionStatus('disconnected');
          setErrorMessage('All connection methods failed');
        }
      }, 5000);
    }
  };

  const startVideo = () => {
    if (isOnline) {
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
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setErrorMessage('');
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
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden min-h-[400px]">
        {currentMethod === 'iframe' ? (
          <iframe
            ref={iframeRef}
            src={cameraUrl}
            className="w-full h-full border-0 object-cover"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              transform: 'scale(1)',
              transformOrigin: 'center',
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: '16/9'
            }}
            allow="camera; microphone; autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            title={`${cameraName} Camera Feed`}
            onLoad={() => {
              setConnectionStatus('connected');
              setIsPlaying(true);
              setRetryCount(0);
            }}
            onError={() => {
              setErrorMessage('Iframe failed - trying fallback');
              tryFallbackVideo();
            }}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                transform: 'scale(1)',
                transformOrigin: 'center',
                maxWidth: '100%',
                maxHeight: '100%',
                aspectRatio: '16/9'
              }}
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

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <AlertTriangle size={48} className="mx-auto mb-2 text-destructive" />
                  <h3 className="text-lg font-semibold mb-2">Camera Feed Unavailable</h3>
                  <p className="text-sm mb-4">{errorMessage || 'Unable to connect to camera'}</p>
                  <div className="space-y-2">
                    <button
                      onClick={refreshCamera}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={openDirect}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors ml-2"
                    >
                      Open Direct
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            {!hasError && (
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
            )}

          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: {currentMethod === 'video' ? 'Direct Video' : 
                        currentMethod === 'iframe' ? 'Iframe Fallback' : 'Demo Video'}</span>
          <span>Status: {connectionStatus}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]" title={cameraUrl}>
            URL: {cameraUrl.length > 25 ? `${cameraUrl.substring(0, 25)}...` : cameraUrl}
          </span>
          <span>Resolution: 1280x720</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Type: MJPEG/HTTP</span>
          <span>Aspect: 16:9</span>
        </div>
        {!hasError && !isLoading && connectionStatus === 'connected' && (
          <div className="text-xs text-success font-medium">
            ✓ Video stream connected
          </div>
        )}
        {currentMethod === 'iframe' && (
          <div className="text-xs text-warning font-medium">
            ⚠ Using iframe fallback - may be blocked by CORS
          </div>
        )}
        {currentMethod === 'fallback' && (
          <div className="text-xs text-info font-medium">
            ℹ Using demo video - original camera unavailable
          </div>
        )}
        {hasError && (
          <div className="text-xs text-destructive font-medium">
            ⚠ {errorMessage || 'Video stream failed - try "Open in New Tab" button'}
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
