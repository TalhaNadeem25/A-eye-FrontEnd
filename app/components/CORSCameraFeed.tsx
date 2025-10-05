'use client';

import { useState } from 'react';
import { Camera, ExternalLink, Wifi, WifiOff, RefreshCw, Maximize2, Play } from 'lucide-react';

interface CORSCameraFeedProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function CORSCameraFeed({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: CORSCameraFeedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasTriedDirect, setHasTriedDirect] = useState(false);

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive bg-destructive/20';
      case 'medium': return 'border-warning bg-warning/20';
      case 'low': return 'border-primary bg-primary/20';
      default: return 'border-border';
    }
  };

  const openDirect = () => {
    setHasTriedDirect(true);
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

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
          <Wifi size={16} className="text-warning" />
          <span className="text-xs text-warning">CORS Blocked</span>
        </div>
      </div>

      {/* Camera Feed Area */}
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
        {isExpanded ? (
          <iframe
            src={cameraUrl}
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            title={`${cameraName} Camera Feed`}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center">
              <Camera className="text-muted-foreground mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold text-foreground mb-2">External Camera Feed</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                This camera feed is blocked by CORS policy and cannot be embedded directly.
              </p>
              <div className="space-y-2">
                <button
                  onClick={openDirect}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Open Camera in New Tab</span>
                </button>
                <button
                  onClick={toggleExpanded}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Maximize2 size={16} />
                  <span>Try Embedded View</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {isExpanded && (
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <button
              onClick={toggleExpanded}
              className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
              title="Collapse View"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={openDirect}
              className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={openFullscreen}
              className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
              title="Open Fullscreen"
            >
              <Play size={16} />
            </button>
          </div>
        )}

        {/* CORS Warning Overlay */}
        {isExpanded && (
          <div className="absolute top-2 left-2">
            <div className="bg-warning/90 text-warning-foreground px-2 py-1 rounded text-xs font-medium">
              CORS BLOCKED
            </div>
          </div>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: External (CORS Blocked)</span>
          <span>Status: {isExpanded ? 'Embedded View' : 'Preview Mode'}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]" title={cameraUrl}>
            URL: {cameraUrl.length > 25 ? `${cameraUrl.substring(0, 25)}...` : cameraUrl}
          </span>
          <span>Type: HTTP Stream</span>
        </div>
        {!isExpanded && (
          <div className="text-xs text-warning font-medium">
            ⚠ CORS policy blocks direct embedding - use "Open Camera in New Tab"
          </div>
        )}
        {isExpanded && (
          <div className="text-xs text-warning font-medium">
            ⚠ Embedded view may not work due to CORS restrictions
          </div>
        )}
        {hasTriedDirect && (
          <div className="text-xs text-success font-medium">
            ✓ Camera opened in new tab - this is the recommended way to view
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
          <span>Open Camera</span>
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
