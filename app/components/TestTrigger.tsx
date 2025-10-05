'use client';

import { useState, useRef } from 'react';
import { AlertTriangle, Volume2, VolumeX, Play, Square, Zap, Shield } from 'lucide-react';

interface TestTriggerProps {
  onAlert?: (alertData: any) => void;
}

export default function TestTrigger({ onAlert }: TestTriggerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create realistic security warning sounds using Web Audio API
  const createWarningSound = (type: 'intrusion' | 'fire' | 'motion' | 'system') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create multiple oscillators for richer, heavier sounds
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    const filters: BiquadFilterNode[] = [];
    
    let duration = 2000;

    switch (type) {
      case 'intrusion':
        // HEAVY INTRUSION ALERT - Multiple frequencies, urgent pattern
        duration = 4000;
        
        // Primary oscillator - urgent high frequency
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        const filter1 = audioContext.createBiquadFilter();
        
        osc1.type = 'sawtooth'; // More aggressive waveform
        osc1.frequency.setValueAtTime(1400, audioContext.currentTime);
        osc1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.15);
        osc1.frequency.setValueAtTime(1400, audioContext.currentTime + 0.3);
        osc1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.45);
        osc1.frequency.setValueAtTime(1400, audioContext.currentTime + 0.6);
        
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(2000, audioContext.currentTime);
        
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime + 0.1);
        gain1.gain.setValueAtTime(0.1, audioContext.currentTime + 0.15);
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.1, audioContext.currentTime + 0.25);
        gain1.gain.setValueAtTime(0.4, audioContext.currentTime + 0.3);
        
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(audioContext.destination);
        
        oscillators.push(osc1);
        gainNodes.push(gain1);
        filters.push(filter1);
        
        // Secondary oscillator - low rumble for weight
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(200, audioContext.currentTime);
        
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.05, audioContext.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.2);
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        oscillators.push(osc2);
        gainNodes.push(gain2);
        
        break;
        
      case 'fire':
        // HEAVY FIRE ALARM - Deep, continuous, urgent
        duration = 6000;
        
        // Primary fire alarm tone - deep and continuous
        const fireOsc1 = audioContext.createOscillator();
        const fireGain1 = audioContext.createGain();
        const fireFilter1 = audioContext.createBiquadFilter();
        
        fireOsc1.type = 'sawtooth';
        fireOsc1.frequency.setValueAtTime(300, audioContext.currentTime);
        
        fireFilter1.type = 'lowpass';
        fireFilter1.frequency.setValueAtTime(800, audioContext.currentTime);
        fireFilter1.Q.setValueAtTime(5, audioContext.currentTime);
        
        fireGain1.gain.setValueAtTime(0.5, audioContext.currentTime);
        fireGain1.gain.setValueAtTime(0.5, audioContext.currentTime + 0.5);
        fireGain1.gain.setValueAtTime(0.3, audioContext.currentTime + 1.0);
        fireGain1.gain.setValueAtTime(0.5, audioContext.currentTime + 1.5);
        fireGain1.gain.setValueAtTime(0.3, audioContext.currentTime + 2.0);
        
        fireOsc1.connect(fireFilter1);
        fireFilter1.connect(fireGain1);
        fireGain1.connect(audioContext.destination);
        
        oscillators.push(fireOsc1);
        gainNodes.push(fireGain1);
        filters.push(fireFilter1);
        
        // Secondary tone - higher frequency for urgency
        const fireOsc2 = audioContext.createOscillator();
        const fireGain2 = audioContext.createGain();
        
        fireOsc2.type = 'square';
        fireOsc2.frequency.setValueAtTime(600, audioContext.currentTime);
        
        fireGain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        fireGain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.5);
        fireGain2.gain.setValueAtTime(0.1, audioContext.currentTime + 1.0);
        fireGain2.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5);
        fireGain2.gain.setValueAtTime(0.1, audioContext.currentTime + 2.0);
        
        fireOsc2.connect(fireGain2);
        fireGain2.connect(audioContext.destination);
        
        oscillators.push(fireOsc2);
        gainNodes.push(fireGain2);
        
        break;
        
      case 'motion':
        // Quick, sharp motion detection
        duration = 1500;
        
        const motionOsc = audioContext.createOscillator();
        const motionGain = audioContext.createGain();
        const motionFilter = audioContext.createBiquadFilter();
        
        motionOsc.type = 'square';
        motionOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
        motionOsc.frequency.setValueAtTime(0, audioContext.currentTime + 0.1);
        motionOsc.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        motionOsc.frequency.setValueAtTime(0, audioContext.currentTime + 0.3);
        motionOsc.frequency.setValueAtTime(1200, audioContext.currentTime + 0.4);
        
        motionFilter.type = 'highpass';
        motionFilter.frequency.setValueAtTime(800, audioContext.currentTime);
        
        motionGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        motionGain.gain.setValueAtTime(0.4, audioContext.currentTime + 0.1);
        motionGain.gain.setValueAtTime(0.1, audioContext.currentTime + 0.15);
        motionGain.gain.setValueAtTime(0.4, audioContext.currentTime + 0.2);
        motionGain.gain.setValueAtTime(0.1, audioContext.currentTime + 0.25);
        motionGain.gain.setValueAtTime(0.4, audioContext.currentTime + 0.3);
        
        motionOsc.connect(motionFilter);
        motionFilter.connect(motionGain);
        motionGain.connect(audioContext.destination);
        
        oscillators.push(motionOsc);
        gainNodes.push(motionGain);
        filters.push(motionFilter);
        
        break;
        
      case 'system':
        // System startup - professional sequence
        duration = 3000;
        
        const sysOsc1 = audioContext.createOscillator();
        const sysGain1 = audioContext.createGain();
        
        sysOsc1.type = 'sine';
        sysOsc1.frequency.setValueAtTime(400, audioContext.currentTime);
        sysOsc1.frequency.setValueAtTime(600, audioContext.currentTime + 0.5);
        sysOsc1.frequency.setValueAtTime(800, audioContext.currentTime + 1.0);
        sysOsc1.frequency.setValueAtTime(1000, audioContext.currentTime + 1.5);
        
        sysGain1.gain.setValueAtTime(0.3, audioContext.currentTime);
        sysGain1.gain.setValueAtTime(0.3, audioContext.currentTime + 0.5);
        sysGain1.gain.setValueAtTime(0.3, audioContext.currentTime + 1.0);
        sysGain1.gain.setValueAtTime(0.3, audioContext.currentTime + 1.5);
        sysGain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3.0);
        
        sysOsc1.connect(sysGain1);
        sysGain1.connect(audioContext.destination);
        
        oscillators.push(sysOsc1);
        gainNodes.push(sysGain1);
        
        break;
    }

    // Start all oscillators
    oscillators.forEach(osc => {
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration / 1000);
    });

    return audioContext;
  };

  const playWarningSound = (type: 'intrusion' | 'fire' | 'motion' | 'system') => {
    if (isMuted) return;

    try {
      const audioContext = createWarningSound(type);
      setCurrentSound(type);
      setIsPlaying(true);

      // Stop after duration
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentSound(null);
      }, type === 'fire' ? 6000 : type === 'intrusion' ? 4000 : type === 'motion' ? 1500 : 3000);

    } catch (error) {
      console.error('Error playing warning sound:', error);
    }
  };

  const stopSound = () => {
    setIsPlaying(false);
    setCurrentSound(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      stopSound();
    }
  };

  const triggerTestAlert = (type: 'intrusion' | 'fire' | 'motion' | 'system') => {
    // Play warning sound
    playWarningSound(type);

    // Create test alert
    const alertData = {
      id: `test-${type}-${Date.now()}`,
      cameraId: 'TEST-CAM',
      cameraName: 'Test Camera',
      timestamp: new Date(),
      type: type === 'intrusion' ? 'intrusion' : type === 'fire' ? 'fire' : 'motion',
      severity: type === 'intrusion' ? 'critical' : type === 'fire' ? 'critical' : 'high',
      confidence: 100,
      description: `TEST ALERT: ${type.toUpperCase()} detected - This is a test alert`,
      status: 'new',
      imageUrl: '/api/placeholder/400/300?text=TEST+ALERT',
      audioUrl: '#',
      location: 'Test Environment',
      duration: 30,
      tags: ['test', type],
    };

    onAlert?.(alertData);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'intrusion': return <Shield className="text-destructive" size={20} />;
      case 'fire': return <Zap className="text-orange-500" size={20} />;
      case 'motion': return <AlertTriangle className="text-warning" size={20} />;
      case 'system': return <Volume2 className="text-primary" size={20} />;
      default: return <AlertTriangle className="text-foreground" size={20} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'intrusion': return 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30';
      case 'fire': return 'bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30';
      case 'motion': return 'bg-warning/20 border-warning text-warning hover:bg-warning/30';
      case 'system': return 'bg-primary/20 border-primary text-primary hover:bg-primary/30';
      default: return 'bg-muted/20 border-muted text-muted-foreground hover:bg-muted/30';
    }
  };

  return (
    <div className="glassmorphism border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <AlertTriangle size={20} />
          <span>Test Alert System</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-md transition-colors ${
              isMuted 
                ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
                : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          {isPlaying && (
            <button
              onClick={stopSound}
              className="p-2 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors"
              title="Stop Sound"
            >
              <Square size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Test the alert system with realistic warning sounds. Perfect for demonstrations!
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Intrusion Alert */}
          <button
            onClick={() => triggerTestAlert('intrusion')}
            disabled={isPlaying}
            className={`flex items-center justify-center space-x-2 p-3 rounded-md border transition-all duration-200 hover-lift ${
              isPlaying && currentSound !== 'intrusion' 
                ? 'opacity-50 cursor-not-allowed' 
                : getAlertColor('intrusion')
            }`}
          >
            {getAlertIcon('intrusion')}
            <span className="font-medium">Intrusion</span>
          </button>

          {/* Fire Alert */}
          <button
            onClick={() => triggerTestAlert('fire')}
            disabled={isPlaying}
            className={`flex items-center justify-center space-x-2 p-3 rounded-md border transition-all duration-200 hover-lift ${
              isPlaying && currentSound !== 'fire' 
                ? 'opacity-50 cursor-not-allowed' 
                : getAlertColor('fire')
            }`}
          >
            {getAlertIcon('fire')}
            <span className="font-medium">Fire</span>
          </button>

          {/* Motion Alert */}
          <button
            onClick={() => triggerTestAlert('motion')}
            disabled={isPlaying}
            className={`flex items-center justify-center space-x-2 p-3 rounded-md border transition-all duration-200 hover-lift ${
              isPlaying && currentSound !== 'motion' 
                ? 'opacity-50 cursor-not-allowed' 
                : getAlertColor('motion')
            }`}
          >
            {getAlertIcon('motion')}
            <span className="font-medium">Motion</span>
          </button>

          {/* System Alert */}
          <button
            onClick={() => triggerTestAlert('system')}
            disabled={isPlaying}
            className={`flex items-center justify-center space-x-2 p-3 rounded-md border transition-all duration-200 hover-lift ${
              isPlaying && currentSound !== 'system' 
                ? 'opacity-50 cursor-not-allowed' 
                : getAlertColor('system')
            }`}
          >
            {getAlertIcon('system')}
            <span className="font-medium">System</span>
          </button>
        </div>

        {/* Status Indicator */}
        {isPlaying && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-primary font-medium">
                Playing {currentSound?.toUpperCase()} alert sound...
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>• <strong>INTRUSION:</strong> Heavy, urgent beeping with low rumble (4 seconds)</p>
          <p>• <strong>FIRE:</strong> Deep, continuous alarm tone (6 seconds)</p>
          <p>• <strong>MOTION:</strong> Sharp, quick detection beeps (1.5 seconds)</p>
          <p>• <strong>SYSTEM:</strong> Professional startup sequence (3 seconds)</p>
          <p>• Use mute button to disable audio during testing</p>
          <p>• <strong>WARNING:</strong> These are loud, realistic security sounds!</p>
        </div>
      </div>
    </div>
  );
}
