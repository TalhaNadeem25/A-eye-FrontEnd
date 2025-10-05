'use client';

import { useState } from 'react';
import { Camera, ExternalLink, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SimpleExternalCameraProps {
  cameraId: string;
  cameraName: string;
  cameraUrl: string;
  isOnline?: boolean;
  hasAlert?: boolean;
  alertLevel?: 'low' | 'medium' | 'high';
  onMotionDetected?: () => void;
  onAlert?: (alertData: any) => void;
}

export default function SimpleExternalCamera({ 
  cameraId, 
  cameraName, 
  cameraUrl,
  isOnline = true, 
  hasAlert = false, 
  alertLevel = 'low',
  onMotionDetected,
  onAlert
}: SimpleExternalCameraProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'high': return 'border-destructive bg-destructive/20';
      case 'medium': return 'border-warning bg-warning/20';
      case 'low': return 'border-primary bg-primary/20';
      default: return 'border-border';
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Add timeout to prevent infinite loading
  const handleIframeLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Set a timeout to show error if loading takes too long
    setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000); // 10 second timeout
  };

  const refreshCamera = () => {
    setRefreshKey(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  const openDirect = () => {
    window.open(cameraUrl, '_blank', 'noopener,noreferrer');
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
          {hasError ? (
            <WifiOff size={16} className="text-destructive" />
          ) : isLoading ? (
            <Wifi size={16} className="text-warning animate-pulse" />
          ) : (
            <Wifi size={16} className="text-success" />
          )}
          <span className={`text-xs ${
            hasError ? 'text-destructive' : 
            isLoading ? 'text-warning' : 'text-success'
          }`}>
            {hasError ? 'Error' : isLoading ? 'Loading...' : 'Live'}
          </span>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
        {hasError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Camera className="text-destructive mx-auto mb-2" size={32} />
              <p className="text-sm text-destructive mb-2">Failed to load camera feed</p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={refreshCamera}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 flex items-center space-x-1"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
                <button
                  onClick={openDirect}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 flex items-center space-x-1"
                >
                  <ExternalLink size={12} />
                  <span>Open Direct</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <iframe
              key={refreshKey}
              src={cameraUrl}
              className="w-full h-full border-0"
              allow="camera; microphone; autoplay; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              onLoadStart={handleIframeLoadStart}
              title={`${cameraName} Camera Feed`}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-black/70 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading camera feed...</span>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button
                onClick={refreshCamera}
                className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                title="Refresh Camera"
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

            {/* External Camera Indicator */}
            <div className="absolute top-2 left-2">
              <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                EXTERNAL
              </div>
            </div>
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source: External (Iframe)</span>
          <span>Status: {hasError ? 'Error' : isLoading ? 'Loading' : 'Connected'}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]" title={cameraUrl}>
            URL: {cameraUrl.length > 25 ? `${cameraUrl.substring(0, 25)}...` : cameraUrl}
          </span>
          <span>Type: HTTP Stream</span>
        </div>
        {!hasError && !isLoading && (
          <div className="text-xs text-success font-medium">
            ✓ Camera feed loaded successfully
          </div>
        )}
        {hasError && (
          <div className="text-xs text-destructive font-medium">
            ⚠ Failed to load camera feed - try "Open Direct" button
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={openDirect}
          className="flex-1 px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <ExternalLink size={12} />
          <span>Open Direct</span>
        </button>
        <button
          onClick={refreshCamera}
          className="flex-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center space-x-1"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
