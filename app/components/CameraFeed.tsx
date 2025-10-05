'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface CameraFeedProps {
  cameraId: string;
  cameraName: string;
  isOnline: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
}

export default function CameraFeed({ 
  cameraId, 
  cameraName, 
  isOnline, 
  hasAlert = false,
  alertLevel = 'low'
}: CameraFeedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulate camera feed with placeholder
  const getCameraImage = () => {
    if (!isOnline) {
      return '/api/placeholder/400/300?text=Offline';
    }
    return `/api/placeholder/400/300?text=Camera+${cameraId}`;
  };

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive';
      case 'medium': return 'border-warning';
      case 'low': return 'border-accent';
      default: return 'border-border';
    }
  };

  return (
    <div className={`relative glassmorphism border-2 rounded-lg overflow-hidden transition-all duration-300 hover-lift ${
      hasAlert ? `${getAlertColor()} alert-pulse` : 'border-border'
    }`}>
      {/* Camera Header */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'status-online' : 'status-offline'}`} />
            <span className="text-sm font-medium">{cameraName}</span>
            {hasAlert && <AlertTriangle className="text-warning" size={16} />}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative aspect-video bg-muted">
        {isOnline ? (
          <div className="relative w-full h-full">
            <Image
              src={getCameraImage()}
              alt={`Camera ${cameraId} feed`}
              fill
              className="object-cover"
            />
            
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>

            {/* Alert Overlay */}
            {hasAlert && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                ALERT
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertTriangle size={48} className="mx-auto mb-2 text-destructive" />
              <p className="text-sm">Camera Offline</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
        <div className="flex items-center justify-between text-xs">
          <span>ID: {cameraId}</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
