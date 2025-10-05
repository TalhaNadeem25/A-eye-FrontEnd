'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, Play, Pause, Settings } from 'lucide-react';

export default function MotionDetectionDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [motionLevel, setMotionLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(30);
  const [lastFrame, setLastFrame] = useState<ImageData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startDetection = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
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
    setMotionDetected(false);
    setMotionLevel(0);
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
      
      if (motion > sensitivity) {
        setMotionDetected(true);
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
  }, [isActive, lastFrame, sensitivity]);

  return (
    <div className="glassmorphism border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Camera size={20} />
          <span>Motion Detection Demo</span>
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
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
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
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isActive 
                ? 'bg-success text-success-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>
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

        {/* Instructions */}
        <div className="text-sm text-muted-foreground">
          <p>• Click "Start Detection" to begin motion detection</p>
          <p>• Move in front of the camera to trigger motion alerts</p>
          <p>• Adjust sensitivity to fine-tune detection</p>
        </div>
      </div>
    </div>
  );
}
