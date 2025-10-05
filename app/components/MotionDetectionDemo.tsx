'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Play, Pause, Settings, Video, VideoOff, Activity, Zap } from 'lucide-react';

interface MotionDetectionDemoProps {
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function MotionDetectionDemo({ onMotionDetected, onAlert }: MotionDetectionDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(30);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [motionHistory, setMotionHistory] = useState<Array<{timestamp: Date, level: number}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);

  const startDetection = async () => {
    try {
      console.log('📹 Starting webcam motion detection...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
        setIsRecording(true);
        console.log('📹 Webcam started - Motion detection active');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopDetection = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsRecording(false);
    setMotionDetected(false);
    setMotionLevel(0);
    console.log('📹 Webcam stopped - Motion detection ended');
  };

  const detectMotion = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastFrame) {
      const motion = calculateMotionDifference(lastFrame, currentFrame);
      setMotionLevel(motion);
      
      // Record motion in history
      const now = new Date();
      setMotionHistory(prev => {
        const newHistory = [...prev, { timestamp: now, level: motion }];
        // Keep only last 50 readings
        return newHistory.slice(-50);
      });
      
      if (motion > sensitivity) {
        setMotionDetected(true);
        setAlertCount(prev => prev + 1);
        setLastAlertTime(now);
        
        // Trigger motion detected callback
        onMotionDetected?.();
        
        // Create alert data
        const alertData = {
          id: `webcam-motion-${Date.now()}`,
          cameraId: 'WEBCAM-001',
          cameraName: 'Webcam',
          timestamp: now,
          type: 'motion',
          severity: motion > 70 ? 'high' : motion > 40 ? 'medium' : 'low',
          confidence: Math.min(motion, 100),
          description: `Motion detected (${motion.toFixed(1)}% intensity)`,
          imageData: canvas.toDataURL('image/jpeg', 0.8),
          motionData: {
            intensity: motion,
            sensitivity: sensitivity,
            alertCount: alertCount + 1
          }
        };
        
        console.log('🚨 Webcam Motion Alert:', alertData);
        onAlert?.(alertData);
        
        setTimeout(() => setMotionDetected(false), 2000);
      }
    }

    setLastFrame(currentFrame);
  };

  const calculateMotionDifference = (frame1: ImageData, frame2: ImageData): number => {
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

    return (diff / (length / 4)) / 3;
  };

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(detectMotion, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, lastFrame, sensitivity, onMotionDetected, onAlert]);

  return (
    <div className="glassmorphism border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Camera size={20} />
          <span>Webcam</span>
          {isRecording && (
            <div className="flex items-center space-x-1 text-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
        </h3>
        <button
          onClick={isActive ? stopDetection : startDetection}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            isActive 
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          <span>{isActive ? 'Stop' : 'Start'} Detection</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Video Feed */}
        <div className="relative aspect-[16/10] bg-muted rounded-md overflow-hidden min-h-[400px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Motion Detection Overlay */}
          {motionDetected && (
            <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
              <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-medium flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>MOTION DETECTED!</span>
              </div>
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute top-2 left-2 flex space-x-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isActive 
                ? 'bg-success text-success-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            {isRecording && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-medium">
                <Video size={12} />
                <span>REC</span>
              </div>
            )}
          </div>

          {/* Motion Level Indicator */}
          {isActive && (
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              {motionLevel > 60 ? (
                <Zap className="animate-pulse text-destructive" size={16} />
              ) : motionLevel > 30 ? (
                <Activity className="animate-pulse text-warning" size={16} />
              ) : (
                <Activity className="text-muted-foreground" size={16} />
              )}
              <span className={`text-xs font-medium ${
                motionLevel > sensitivity ? 'text-destructive' : 'text-foreground'
              }`}>
                {Math.round(motionLevel)}%
              </span>
            </div>
          )}
        </div>

        {/* Motion Level Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Motion Level:</span>
            <span className={`font-medium ${
              motionLevel > sensitivity ? 'text-destructive' : 'text-foreground'
            }`}>
              {motionLevel.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-200 ${
                motionLevel > sensitivity ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(motionLevel, 100)}%` }}
            />
          </div>
        </div>

        {/* Sensitivity Control */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Sensitivity: {sensitivity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Privacy Notice */}
        {isActive && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Camera Active</p>
                <p className="text-muted-foreground">
                  Your front camera is now active for motion detection. 
                  All processing happens locally on your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Stats */}
        {isActive && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{alertCount}</div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{motionHistory.length}</div>
              <div className="text-xs text-muted-foreground">Readings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {lastAlertTime ? lastAlertTime.toLocaleTimeString() : 'None'}
              </div>
              <div className="text-xs text-muted-foreground">Last Alert</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {motionHistory.length > 0 ? Math.round(motionHistory.reduce((sum, m) => sum + m.level, 0) / motionHistory.length) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Motion</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground">
          <p>• Click "Start Detection" to begin webcam motion detection</p>
          <p>• Move in front of the camera to trigger motion alerts</p>
          <p>• Adjust sensitivity to fine-tune detection</p>
          <p>• Real-time motion recording and alert generation</p>
        </div>
      </div>
    </div>
  );
}
