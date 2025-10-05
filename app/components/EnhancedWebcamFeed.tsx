'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Video, VideoOff, AlertTriangle, Play, Pause, Volume2, VolumeX, Settings, Activity, Zap } from 'lucide-react';

interface EnhancedWebcamFeedProps {
  cameraId: string;
  cameraName: string;
  isOnline: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

interface MotionData {
  intensity: number;
  timestamp: Date;
  frameDiff: number;
  pixelChanges: number;
}

export default function EnhancedWebcamFeed({ 
  cameraId, 
  cameraName, 
  isOnline, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: EnhancedWebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const motionHistoryRef = useRef<MotionData[]>([]);
  const lastAlertTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [motionThreshold, setMotionThreshold] = useState(25);
  const [motionSensitivity, setMotionSensitivity] = useState(0.7);
  const [motionLevel, setMotionLevel] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [motionStats, setMotionStats] = useState({
    totalDetections: 0,
    averageIntensity: 0,
    lastDetection: null as Date | null
  });

  // Motion detection settings
  const ALERT_COOLDOWN = 3000; // 3 seconds between alerts
  const MOTION_HISTORY_SIZE = 10; // Keep last 10 motion readings
  const DETECTION_INTERVAL = 500; // Check every 500ms

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

  // Enhanced motion detection
  useEffect(() => {
    if (isPlaying && isMonitoring && videoRef.current && canvasRef.current) {
      const interval = setInterval(() => {
        detectMotion();
      }, DETECTION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isPlaying, isMonitoring]);

  const startWebcam = async () => {
    try {
      setError(null);
      
      // Check if camera permissions are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      console.log('📹 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user', // Front camera
          frameRate: { ideal: 30 }
        },
        audio: false // Disable audio to reduce privacy concerns
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsPlaying(true);
        setIsMonitoring(true);
        console.log('📹 Webcam started successfully - Front camera activated for motion detection');
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError('Unable to access webcam. Please check permissions and try again.');
      }
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
    setIsMonitoring(false);
    setMotionDetected(false);
    setMotionLevel(0);
    console.log('📹 Webcam stopped');
  };

  const detectMotion = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isMonitoring) return;

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
      const motionData = calculateAdvancedMotion(lastFrame, currentFrame);
      
      // Update motion level
      setMotionLevel(motionData.intensity);
      
      // Add to motion history
      motionHistoryRef.current.push(motionData);
      if (motionHistoryRef.current.length > MOTION_HISTORY_SIZE) {
        motionHistoryRef.current.shift();
      }
      
      // Update motion stats
      updateMotionStats();
      
      // Check for significant motion
      if (motionData.intensity > motionThreshold) {
        const now = Date.now();
        if (now - lastAlertTimeRef.current > ALERT_COOLDOWN) {
          handleMotionAlert(motionData);
          lastAlertTimeRef.current = now;
        }
      }
    }

    setLastFrame(currentFrame);
  }, [isMonitoring, motionThreshold]);

  const calculateAdvancedMotion = (frame1: ImageData, frame2: ImageData): MotionData => {
    if (frame1.data.length !== frame2.data.length) {
      return { intensity: 0, timestamp: new Date(), frameDiff: 0, pixelChanges: 0 };
    }

    let totalDiff = 0;
    let pixelChanges = 0;
    const length = frame1.data.length;
    const threshold = 30; // Pixel difference threshold

    for (let i = 0; i < length; i += 4) {
      const r1 = frame1.data[i];
      const g1 = frame1.data[i + 1];
      const b1 = frame1.data[i + 2];
      
      const r2 = frame2.data[i];
      const g2 = frame2.data[i + 1];
      const b2 = frame2.data[i + 2];

      const pixelDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      totalDiff += pixelDiff;
      
      if (pixelDiff > threshold) {
        pixelChanges++;
      }
    }

    const averageDiff = totalDiff / (length / 4) / 3;
    const intensity = Math.min(averageDiff * motionSensitivity, 100);

    return {
      intensity,
      timestamp: new Date(),
      frameDiff: averageDiff,
      pixelChanges
    };
  };

  const updateMotionStats = () => {
    const history = motionHistoryRef.current;
    if (history.length === 0) return;

    const totalDetections = history.filter(m => m.intensity > motionThreshold).length;
    const averageIntensity = history.reduce((sum, m) => sum + m.intensity, 0) / history.length;
    const lastDetection = history[history.length - 1]?.timestamp || null;

    setMotionStats({
      totalDetections,
      averageIntensity,
      lastDetection
    });
  };

  const handleMotionAlert = (motionData: MotionData) => {
    setMotionDetected(true);
    onMotionDetected?.();
    
    // Create enhanced alert data
    const alertData = {
      id: `webcam-motion-${Date.now()}`,
      cameraId,
      cameraName,
      timestamp: new Date(),
      type: 'motion',
      severity: motionData.intensity > 70 ? 'high' : motionData.intensity > 40 ? 'medium' : 'low',
      confidence: Math.min(motionData.intensity, 100),
      description: `Motion detected (${motionData.intensity.toFixed(1)}% intensity)`,
      imageData: canvasRef.current?.toDataURL('image/jpeg', 0.8),
      motionData: {
        intensity: motionData.intensity,
        pixelChanges: motionData.pixelChanges,
        frameDiff: motionData.frameDiff
      }
    };
    
    console.log('🚨 Webcam Motion Alert:', alertData);
    onAlert?.(alertData);
    
    // Reset motion detection after 2 seconds
    setTimeout(() => setMotionDetected(false), 2000);
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

  const getMotionColor = () => {
    if (motionLevel > 70) return 'text-destructive';
    if (motionLevel > 40) return 'text-warning';
    if (motionLevel > 20) return 'text-primary';
    return 'text-muted-foreground';
  };

  const getMotionIcon = () => {
    if (motionLevel > 60) return <Zap className="animate-pulse" size={16} />;
    if (motionLevel > 30) return <Activity className="animate-pulse" size={16} />;
    return <Activity size={16} />;
  };

  return (
    <div className={`glassmorphism border rounded-lg p-4 hover-lift transition-all duration-300 ${
      hasAlert ? getAlertColor() : 'border-border'
    } ${motionDetected ? 'animate-pulse border-destructive' : ''}`}>
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
                <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 animate-pulse">
                  <AlertTriangle size={16} />
                  <span>MOTION DETECTED</span>
                </div>
              </div>
            )}

            {/* Motion Level Indicator */}
            {isMonitoring && (
              <div className="absolute top-2 left-2 flex items-center space-x-1">
                {getMotionIcon()}
                <span className={`text-xs font-medium ${getMotionColor()}`}>
                  {Math.round(motionLevel)}%
                </span>
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
          </>
        )}
      </div>

      {/* Motion Detection Status */}
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Resolution: 1280x720</span>
          <span>FPS: 30</span>
        </div>
        
        {isMonitoring && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Motion Level:</span>
              <span className={`font-medium ${getMotionColor()}`}>
                {Math.round(motionLevel)}%
              </span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  motionLevel > 70 ? 'bg-destructive' :
                  motionLevel > 40 ? 'bg-warning' :
                  motionLevel > 20 ? 'bg-primary' : 'bg-muted-foreground'
                }`}
                style={{ width: `${Math.min(motionLevel, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Status: {isPlaying ? 'Recording' : 'Stopped'}</span>
          <span>Audio: {isMuted ? 'Muted' : 'Enabled'}</span>
        </div>

        {motionDetected && (
          <div className="text-xs text-destructive font-medium animate-pulse">
            🚨 Motion detected - Alert level: {alertLevel.toUpperCase()}
          </div>
        )}
      </div>

      {/* Motion Detection Controls */}
      <div className="mt-3 space-y-2">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Motion Threshold: {motionThreshold}%
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
        
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Sensitivity: {Math.round(motionSensitivity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={motionSensitivity}
            onChange={(e) => setMotionSensitivity(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Motion Statistics */}
      {motionStats.totalDetections > 0 && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
          <div className="font-medium text-foreground mb-1">Motion Stats</div>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <div>Detections: {motionStats.totalDetections}</div>
            <div>Avg Intensity: {Math.round(motionStats.averageIntensity)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
