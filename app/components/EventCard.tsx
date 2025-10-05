'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Check, X, Clock, Camera } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface EventCardProps {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  confidence: number;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  status: 'new' | 'acknowledged' | 'dismissed';
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export default function EventCard({
  id,
  cameraId,
  cameraName,
  timestamp,
  confidence,
  description,
  imageUrl,
  audioUrl,
  status,
  onAcknowledge,
  onDismiss
}: EventCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'border-l-destructive bg-destructive/10';
      case 'acknowledged': return 'border-l-warning bg-warning/10';
      case 'dismissed': return 'border-l-muted bg-muted/10';
      default: return 'border-l-border';
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      setIsPlaying(!isPlaying);
      // Here you would integrate with ElevenLabs API
      console.log('Playing audio:', audioUrl);
    }
  };

  return (
    <div className={`border-l-4 glassmorphism border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover-lift ${getStatusColor(status)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{cameraName}</span>
          <span className="text-xs text-muted-foreground">#{cameraId}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {format(timestamp, 'HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Alert Image */}
      <div className="relative mb-3">
        <Image
          src={imageUrl}
          alt="Alert detection"
          width={400}
          height={128}
          className="w-full h-32 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
          ALERT
        </div>
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {confidence.toFixed(1)}% confidence
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        <p className="text-sm text-foreground mb-2">{description}</p>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
            {confidence.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Audio Controls */}
      {audioUrl && (
        <div className="flex items-center space-x-2 mb-3 p-2 bg-muted rounded-md">
          <button
            onClick={handlePlayAudio}
            className="flex items-center space-x-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pause' : 'Play'} Audio</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 hover:bg-muted-foreground/20 rounded"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'new' && (
            <>
              <button
                onClick={() => onAcknowledge?.(id)}
                className="flex items-center space-x-1 px-3 py-1 bg-warning text-warning-foreground rounded text-xs hover:bg-warning/90"
              >
                <Check size={12} />
                <span>Acknowledge</span>
              </button>
              <button
                onClick={() => onDismiss?.(id)}
                className="flex items-center space-x-1 px-3 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/90"
              >
                <X size={12} />
                <span>Dismiss</span>
              </button>
            </>
          )}
          {status === 'acknowledged' && (
            <span className="text-xs text-warning flex items-center space-x-1">
              <Check size={12} />
              <span>Acknowledged</span>
            </span>
          )}
          {status === 'dismissed' && (
            <span className="text-xs text-muted-foreground flex items-center space-x-1">
              <X size={12} />
              <span>Dismissed</span>
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(timestamp, 'MMM dd, yyyy')}
        </span>
      </div>
    </div>
  );
}
