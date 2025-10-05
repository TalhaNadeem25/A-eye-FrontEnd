'use client';

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Camera, Plus, Edit, Trash2, Eye, EyeOff,
  Search, Download,
  Wifi, WifiOff, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { exportCamerasToCSV, exportCamerasToPDF } from '../utils/exportUtils';

interface CameraData {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  isOnline: boolean;
  hasAlert: boolean;
  alertLevel: 'low' | 'medium' | 'high';
  lastSeen: Date;
  status: 'active' | 'inactive' | 'maintenance';
  resolution: string;
  fps: number;
  recording: boolean;
  motionDetection: boolean;
  nightVision: boolean;
  audioEnabled: boolean;
}

export default function CamerasPage() {
  const { hasPermission } = useAuth();
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'alert'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamera, setNewCamera] = useState({
    name: '',
    location: '',
    ipAddress: '',
    port: 8080,
    resolution: '1920x1080',
    fps: 30
  });

  // Mock data for demonstration
  const mockCameras: CameraData[] = [
    {
      id: 'WEBCAM-001',
      name: 'Laptop Webcam',
      location: 'Development Station',
      ipAddress: 'localhost',
      port: 0,
      isOnline: true,
      hasAlert: false,
      alertLevel: 'low',
      lastSeen: new Date(),
      status: 'active',
      resolution: '1280x720',
      fps: 30,
      recording: true,
      motionDetection: true,
      nightVision: false,
      audioEnabled: true
    },
    {
      id: 'CAM-001',
      name: 'Main Entrance',
      location: 'Building A - Front Door',
      ipAddress: '192.168.1.101',
      port: 8080,
      isOnline: true,
      hasAlert: true,
      alertLevel: 'high',
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      status: 'active',
      resolution: '1920x1080',
      fps: 30,
      recording: true,
      motionDetection: true,
      nightVision: true,
      audioEnabled: true
    },
    {
      id: 'CAM-002',
      name: 'Parking Lot',
      location: 'Building A - Parking Area',
      ipAddress: '192.168.1.102',
      port: 8080,
      isOnline: true,
      hasAlert: false,
      alertLevel: 'low',
      lastSeen: new Date(Date.now() - 30 * 1000),
      status: 'active',
      resolution: '1280x720',
      fps: 25,
      recording: true,
      motionDetection: true,
      nightVision: false,
      audioEnabled: false
    },
    {
      id: 'CAM-003',
      name: 'Reception Area',
      location: 'Building A - Lobby',
      ipAddress: '192.168.1.103',
      port: 8080,
      isOnline: true,
      hasAlert: true,
      alertLevel: 'medium',
      lastSeen: new Date(Date.now() - 1 * 60 * 1000),
      status: 'active',
      resolution: '1920x1080',
      fps: 30,
      recording: true,
      motionDetection: true,
      nightVision: true,
      audioEnabled: true
    },
    {
      id: 'CAM-004',
      name: 'Back Office',
      location: 'Building A - Office Area',
      ipAddress: '192.168.1.104',
      port: 8080,
      isOnline: false,
      hasAlert: false,
      alertLevel: 'low',
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      status: 'maintenance',
      resolution: '1280x720',
      fps: 25,
      recording: false,
      motionDetection: false,
      nightVision: false,
      audioEnabled: false
    },
    {
      id: 'CAM-005',
      name: 'Storage Room',
      location: 'Building B - Storage',
      ipAddress: '192.168.1.105',
      port: 8080,
      isOnline: true,
      hasAlert: false,
      alertLevel: 'low',
      lastSeen: new Date(Date.now() - 45 * 1000),
      status: 'active',
      resolution: '1280x720',
      fps: 20,
      recording: true,
      motionDetection: true,
      nightVision: true,
      audioEnabled: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadCameras = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCameras(mockCameras);
      setIsLoading(false);
    };

    loadCameras();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCameras(prev => prev.map(camera => ({
        ...camera,
        lastSeen: new Date(),
        isOnline: Math.random() > 0.1, // 90% chance to stay online
        hasAlert: Math.random() > 0.8 // 20% chance of alert
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Route guard - only managers can access cameras page
  if (!hasPermission('manage_cameras')) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Camera className="text-destructive mx-auto mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to manage cameras.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    const camera: CameraData = {
      id: `CAM-${Date.now()}`,
      name: newCamera.name,
      location: newCamera.location,
      ipAddress: newCamera.ipAddress,
      port: newCamera.port,
      isOnline: true,
      hasAlert: false,
      alertLevel: 'low',
      lastSeen: new Date(),
      status: 'active',
      resolution: newCamera.resolution,
      fps: newCamera.fps,
      recording: true,
      motionDetection: true,
      nightVision: false,
      audioEnabled: false
    };

    setCameras(prev => [...prev, camera]);
    setNewCamera({ name: '', location: '', ipAddress: '', port: 8080, resolution: '1920x1080', fps: 30 });
    setShowAddModal(false);
  };

  const handleEditCamera = (camera: CameraData) => {
    setEditingCamera(camera);
  };

  const handleDeleteCamera = (id: string) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      setCameras(prev => prev.filter(camera => camera.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setCameras(prev => prev.map(camera => 
      camera.id === id 
        ? { ...camera, status: camera.status === 'active' ? 'inactive' : 'active' }
        : camera
    ));
  };

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = searchTerm === '' || 
      camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.ipAddress.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'online' && camera.isOnline) ||
      (filterStatus === 'offline' && !camera.isOnline) ||
      (filterStatus === 'alert' && camera.hasAlert);
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (camera: CameraData) => {
    if (!camera.isOnline) return <WifiOff className="text-destructive" size={16} />;
    if (camera.hasAlert) return <AlertTriangle className="text-warning" size={16} />;
    return <Wifi className="text-success" size={16} />;
  };

  const getStatusColor = (camera: CameraData) => {
    if (!camera.isOnline) return 'text-destructive';
    if (camera.hasAlert) return 'text-warning';
    return 'text-success';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Camera Management</h1>
                <p className="text-muted-foreground">
                  Monitor and manage all surveillance cameras
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Camera</span>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => exportCamerasToCSV(cameras)}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => exportCamerasToPDF(cameras)}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cameras</p>
                  <p className="text-2xl font-bold text-foreground">{cameras.length}</p>
                </div>
                <Camera className="text-primary" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-success">{cameras.filter(c => c.isOnline).length}</p>
                </div>
                <Wifi className="text-success" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-destructive">{cameras.filter(c => !c.isOnline).length}</p>
                </div>
                <WifiOff className="text-destructive" size={24} />
              </div>
            </div>
            <div className="glassmorphism border border-border rounded-lg p-4 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold text-warning">{cameras.filter(c => c.hasAlert).length}</p>
                </div>
                <AlertTriangle className="text-warning" size={24} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="glassmorphism border border-border rounded-lg p-6 mb-6 hover-lift transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search cameras by name, location, or IP..."
                  className="w-full pl-10 pr-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'online' | 'offline' | 'alert')}
                className="px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Cameras</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="alert">With Alerts</option>
              </select>
            </div>
          </div>

          {/* Cameras Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCameras.map(camera => (
              <div key={camera.id} className="glassmorphism border border-border rounded-lg p-6 hover-lift transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Camera className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{camera.name}</h3>
                      <p className="text-sm text-muted-foreground">{camera.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(camera)}
                    <span className={`text-sm font-medium ${getStatusColor(camera)}`}>
                      {camera.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="text-foreground">{camera.ipAddress}:{camera.port}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span className="text-foreground">{camera.resolution}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">FPS:</span>
                    <span className="text-foreground">{camera.fps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Seen:</span>
                    <span className="text-foreground">{format(camera.lastSeen, 'HH:mm:ss')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(camera.id)}
                      className={`p-2 rounded-md transition-colors ${
                        camera.status === 'active' 
                          ? 'bg-warning/20 text-warning hover:bg-warning/30' 
                          : 'bg-success/20 text-success hover:bg-success/30'
                      }`}
                      title={camera.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {camera.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleEditCamera(camera)}
                      className="p-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
                      title="Edit Camera"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCamera(camera.id)}
                      className="p-2 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors"
                      title="Delete Camera"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    {camera.recording && <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />}
                    {camera.motionDetection && <div className="w-2 h-2 bg-warning rounded-full" />}
                    {camera.nightVision && <div className="w-2 h-2 bg-primary rounded-full" />}
                    {camera.audioEnabled && <div className="w-2 h-2 bg-success rounded-full" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Camera Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="glassmorphism border border-border rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Add New Camera</h2>
                <form onSubmit={handleAddCamera} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Camera Name</label>
                    <input
                      type="text"
                      value={newCamera.name}
                      onChange={(e) => setNewCamera(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter camera name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                    <input
                      type="text"
                      value={newCamera.location}
                      onChange={(e) => setNewCamera(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter camera location"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">IP Address</label>
                    <input
                      type="text"
                      value={newCamera.ipAddress}
                      onChange={(e) => setNewCamera(prev => ({ ...prev, ipAddress: e.target.value }))}
                      className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="192.168.1.100"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Port</label>
                      <input
                        type="number"
                        value={newCamera.port}
                        onChange={(e) => setNewCamera(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Resolution</label>
                      <select
                        value={newCamera.resolution}
                        onChange={(e) => setNewCamera(prev => ({ ...prev, resolution: e.target.value }))}
                        className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="1280x720">720p</option>
                        <option value="1920x1080">1080p</option>
                        <option value="2560x1440">1440p</option>
                        <option value="3840x2160">4K</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Add Camera
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
