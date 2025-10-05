'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Play, Pause, Volume2, VolumeX, Wifi, WifiOff, ExternalLink } from 'lucide-react';

interface ExternalCameraFeedProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
  streamType?: 'http' | 'rtsp' | 'webrtc' | 'auto';
}

export default function ExternalCameraFeed({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert,
  streamType = 'auto'
}: ExternalCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [streamInfo, setStreamInfo] = useState<{width?: number, height?: number, duration?: number}>({});
  const maxRetries = 3;

  // Initialize external camera
  useEffect(() => {
    if (isOnline) {
      startExternalCamera();
    } else {
      stopExternalCamera();
    }

    return () => {
      stopExternalCamera();
    };
  }, [isOnline, cameraUrl]);

  const detectStreamType = (url: string): string => {
    if (url.includes('rtsp://')) return 'rtsp';
    if (url.includes('webrtc://') || url.includes('ws://') || url.includes('wss://')) return 'webrtc';
    if (url.includes('http://') || url.includes('https://')) return 'http';
    return 'http'; // default
  };

  const getStreamUrl = (url: string): string => {
    const detectedType = detectStreamType(url);
    
    // Handle different stream types
    switch (detectedType) {
      case 'rtsp':
        // For RTSP streams, we might need to use a proxy or convert to HLS
        // This is a simplified approach - in production you'd want proper RTSP handling
        return url;
      case 'webrtc':
        // WebRTC streams need special handling
        return url;
      case 'http':
      default:
        return url;
    }
  };

  const startExternalCamera = async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');
      
      if (videoRef.current) {
        const streamUrl = getStreamUrl(cameraUrl);
        
        // Set video attributes for better compatibility
        videoRef.current.setAttribute('crossorigin', 'anonymous');
        videoRef.current.setAttribute('preload', 'auto');
        
        // Set the video source to the external camera URL
        videoRef.current.src = streamUrl;
        videoRef.current.load();
        
        // Handle successful load
        const handleLoadedData = () => {
          setConnectionStatus('connected');
          setIsPlaying(true);
          setRetryCount(0);
          
          // Get stream information
          if (videoRef.current) {
            setStreamInfo({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
              duration: videoRef.current.duration
            });
          }
        };

        // Handle errors
        const handleError = (e: any) => {
          console.error('Video error:', e);
          setConnectionStatus('disconnected');
          setIsPlaying(false);
          
          // More specific error messages
          let errorMessage = 'Failed to load camera feed';
          if (e.target?.error) {
            switch (e.target.error.code) {
              case 1: errorMessage = 'Video loading aborted'; break;
              case 2: errorMessage = 'Network error - check camera URL'; break;
              case 3: errorMessage = 'Video format not supported'; break;
              case 4: errorMessage = 'Video codec not supported'; break;
              default: errorMessage = `Video error: ${e.target.error.message}`;
            }
          }
          
          setError(errorMessage);
          
          // Retry logic
          if (retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              startExternalCamera();
            }, 2000 * (retryCount + 1)); // Exponential backoff
          }
        };

        // Handle load events
        videoRef.current.addEventListener('loadeddata', handleLoadedData);
        videoRef.current.addEventListener('error', handleError);
        videoRef.current.addEventListener('canplay', handleLoadedData);
        videoRef.current.addEventListener('loadstart', () => setConnectionStatus('connecting'));
        videoRef.current.addEventListener('stalled', () => {
          console.log('Video stalled, attempting to resume...');
          if (videoRef.current) {
            videoRef.current.load();
          }
        });

        // Clean up event listeners
        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('loadeddata', handleLoadedData);
            videoRef.current.removeEventListener('error', handleError);
            videoRef.current.removeEventListener('canplay', handleLoadedData);
            videoRef.current.removeEventListener('loadstart', () => setConnectionStatus('connecting'));
            videoRef.current.removeEventListener('stalled', () => {
              console.log('Video stalled, attempting to resume...');
              if (videoRef.current) {
                videoRef.current.load();
              }
            });
          }
        };
      }
    } catch (err) {
      console.error('Error accessing external camera:', err);
      setError('Unable to access external camera feed');
      setConnectionStatus('disconnected');
    }
  };

  const stopExternalCamera = () => {
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.load();
    }
    setIsPlaying(false);
    setConnectionStatus('disconnected');
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopExternalCamera();
    } else {
      startExternalCamera();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive bg-destructive/20';
      case 'medium': return 'border-warning bg-warning/20';
      case 'low': return 'border-primary bg-primary/20';
      default: return 'border-border';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'connecting': return 'text-warning';
      case 'disconnected': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi size={16} className="text-success" />;
      case 'connecting': return <Wifi size={16} className="text-warning animate-pulse" />;
      case 'disconnected': return <WifiOff size={16} className="text-destructive" />;
      default: return <WifiOff size={16} />;
    }
  };

  const getStreamTypeInfo = () => {
    const detectedType = detectStreamType(cameraUrl);
    switch (detectedType) {
      case 'rtsp': return { type: 'RTSP', color: 'text-orange-500' };
      case 'webrtc': return { type: 'WebRTC', color: 'text-blue-500' };
      case 'http': return { type: 'HTTP', color: 'text-green-500' };
      default: return { type: 'Unknown', color: 'text-gray-500' };
    }
  };

  const streamTypeInfo = getStreamTypeInfo();

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
          {getConnectionStatusIcon()}
          <span className={`text-xs ${getConnectionStatusColor()}`}>
            {connectionStatus === 'connecting' ? 'Connecting...' : 
             connectionStatus === 'connected' ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* External Camera Feed */}
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
        {error && retryCount >= maxRetries ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Camera className="text-destructive mx-auto mb-2" size={32} />
              <p className="text-sm text-destructive mb-2">{error}</p>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    setRetryCount(0);
                    setError(null);
                    startExternalCamera();
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 mr-2"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.open(cameraUrl, '_blank')}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90"
                >
                  <ExternalLink size={12} className="inline mr-1" />
                  Open Direct
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                If the camera works in a new tab, try the "Open Direct" button above.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Try iframe approach first for better compatibility */}
            {connectionStatus === 'connecting' && (
              <iframe
                src={cameraUrl}
                className="w-full h-full border-0"
                allow="camera; microphone; autoplay; fullscreen"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => {
                  setConnectionStatus('connected');
                  setIsPlaying(true);
                  setRetryCount(0);
                }}
                onError={() => {
                  setConnectionStatus('disconnected');
                  setError('Iframe failed to load - trying video element');
                  // Fallback to video element
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.src = cameraUrl;
                      videoRef.current.load();
                    }
                  }, 1000);
                }}
              />
            )}
            
            {/* Fallback video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              controls={false}
              style={{ display: connectionStatus === 'connected' ? 'block' : 'none' }}
            />
            
            {/* Connection Status Overlay */}
            {connectionStatus === 'connecting' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-black/70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connecting to camera...</span>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button
                onClick={togglePlayPause}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title={isPlaying ? 'Stop Camera' : 'Start Camera'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            {/* Stream Type Indicator */}
            <div className="absolute top-2 left-2">
              <div className={`bg-black/70 text-white px-2 py-1 rounded text-xs font-medium ${streamTypeInfo.color}`}>
                {streamTypeInfo.type}
              </div>
            </div>

            {/* Stream Info Overlay */}
            {connectionStatus === 'connected' && streamInfo.width && (
              <div className="absolute top-2 right-2">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {streamInfo.width}x{streamInfo.height}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: External ({streamTypeInfo.type})</span>
          <span>Status: {connectionStatus}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]" title={cameraUrl}>
            URL: {cameraUrl.length > 25 ? `${cameraUrl.substring(0, 25)}...` : cameraUrl}
          </span>
          <span>Audio: {isMuted ? 'Muted' : 'Enabled'}</span>
        </div>
        {connectionStatus === 'connected' && (
          <div className="text-xs text-success font-medium">
            ✓ Connected to external camera
          </div>
        )}
        {retryCount > 0 && (
          <div className="text-xs text-warning font-medium">
            ⚠ Retry attempt {retryCount}/{maxRetries}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={() => window.open(cameraUrl, '_blank')}
          className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink size={12} />
          <span>Open Direct</span>
        </button>
        <button
          onClick={togglePlayPause}
          className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
}