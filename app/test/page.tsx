'use client';

import Layout from '../components/Layout';
import TestTrigger from '../components/TestTrigger';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [testAlerts, setTestAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTestAlert = (alertData: any) => {
    console.log('Test alert triggered:', alertData);
    setTestAlerts(prev => [alertData, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Alert System</h1>
            <p className="text-muted-foreground">
              Test the surveillance system with realistic warning sounds and alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Trigger */}
            <div>
              <TestTrigger onAlert={handleTestAlert} />
            </div>

            {/* Test Alerts */}
            <div className="glassmorphism border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Test Alerts Generated</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {testAlerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No test alerts yet. Click the buttons above to generate alerts!
                  </p>
                ) : (
                  testAlerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-muted/20 rounded-md border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{alert.type.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' 
                            ? 'bg-destructive/20 text-destructive' 
                            : alert.severity === 'high'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {alert.confidence}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 glassmorphism border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">How to Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Alert Types:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Intrusion:</strong> Heavy, urgent beeping with low rumble (4 seconds)</li>
                  <li>• <strong>Fire:</strong> Deep, continuous alarm tone (6 seconds)</li>
                  <li>• <strong>Motion:</strong> Sharp, quick detection beeps (1.5 seconds)</li>
                  <li>• <strong>System:</strong> Professional startup sequence (3 seconds)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Testing Tips:</h4>
                <ul className="space-y-1">
                  <li>• Use mute button to disable audio</li>
                  <li>• Each alert creates a test alert in the system</li>
                  <li>• Perfect for hackathon demonstrations</li>
                  <li>• Sounds are generated using Web Audio API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
