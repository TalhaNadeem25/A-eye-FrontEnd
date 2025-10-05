'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Video, VideoOff, AlertTriangle, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface WebcamFeedProps {
  cameraId: string;
  cameraName: string;
  isOnline: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function WebcamFeed({ 
  cameraId, 
  cameraName, 
  isOnline, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [motionThreshold, setMotionThreshold] = useState(30); // Adjustable sensitivity

  // Initialize webcam
  useEffect(() => {
    if (isOnline) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isOnline]);

  // Motion detection
  useEffect(() => {
    if (isPlaying && videoRef.current && canvasRef.current) {
      const interval = setInterval(() => {
        detectMotion();
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const startWebcam = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPlaying(false);
  };

  const detectMotion = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastFrame) {
      const motion = calculateMotion(lastFrame, currentFrame);
      
      if (motion > motionThreshold) {
        setMotionDetected(true);
        onMotionDetected?.();
        
        // Create alert data
        const alertData = {
          id: `motion-${Date.now()}`,
          cameraId,
          cameraName,
          timestamp: new Date(),
          type: 'motion',
          severity: motion > 50 ? 'high' : 'medium',
          confidence: Math.min(motion, 100),
          description: `Motion detected (${motion.toFixed(1)}% change)`,
          imageData: canvas.toDataURL('image/jpeg', 0.8)
        };
        
        onAlert?.(alertData);
        
        // Reset motion detection after 3 seconds
        setTimeout(() => setMotionDetected(false), 3000);
      }
    }

    setLastFrame(currentFrame);
  };

  const calculateMotion = (frame1: ImageData, frame2: ImageData): number => {
    if (frame1.data.length !== frame2.data.length) return 0;

    let diff = 0;
    const length = frame1.data.length;

    for (let i = 0; i < length; i += 4) {
      const r1 = frame1.data[i];
      const g1 = frame1.data[i + 1];
      const b1 = frame1.data[i + 2];
      
      const r2 = frame2.data[i];
      const g2 = frame2.data[i + 1];
      const b2 = frame2.data[i + 2];

      const pixelDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      diff += pixelDiff;
    }

    return (diff / (length / 4)) / 3; // Average difference per pixel
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
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

  return (
    <div className={`glassmorphism border rounded-lg p-4 hover-lift transition-all duration-300 ${
      hasAlert ? getAlertColor() : 'border-border'
    } ${motionDetected ? 'animate-pulse' : ''}`}>
      {/* Camera Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera size={20} className="text-primary" />
          <span className="font-semibold text-foreground">{cameraName}</span>
          <span className="text-xs text-muted-foreground">({cameraId})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-success' : 'bg-destructive'
          }`}></div>
          <span className="text-xs text-muted-foreground">
            {isOnline ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Webcam Feed */}
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <VideoOff className="text-destructive mx-auto mb-2" size={32} />
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={startWebcam}
                className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Motion Detection Overlay */}
            {motionDetected && (
              <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <AlertTriangle size={16} />
                  <span>MOTION DETECTED</span>
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

            {/* Motion Detection Indicator */}
            {motionDetected && (
              <div className="absolute top-2 left-2">
                <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium animate-pulse">
                  MOTION
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Resolution: 1280x720</span>
          <span>FPS: 30</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Status: {isPlaying ? 'Recording' : 'Stopped'}</span>
          <span>Audio: {isMuted ? 'Muted' : 'Enabled'}</span>
        </div>
        {motionDetected && (
          <div className="text-xs text-destructive font-medium">
            Motion detected - Alert level: {alertLevel.toUpperCase()}
          </div>
        )}
      </div>

      {/* Motion Sensitivity Control */}
      <div className="mt-3">
        <label className="text-xs text-muted-foreground block mb-1">
          Motion Sensitivity: {motionThreshold}%
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={motionThreshold}
          onChange={(e) => setMotionThreshold(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
