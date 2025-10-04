'use client';

import { useState } from 'react';
import { Menu, X, LogOut, Settings, Camera, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground cyber-grid">
      {/* Navbar */}
      <nav className="glassmorphism border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted hover-lift transition-all duration-300"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <Camera className="text-primary" size={24} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Surveillance Dashboard
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full status-online"></div>
                <span className="text-success font-medium">System Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm">
                  <User size={16} className="text-primary" />
                  <span className="text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground bg-primary/20 px-2 py-1 rounded">
                    {user.role.toUpperCase()}
                  </span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted hover-lift transition-all duration-300 cyber-border"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 glassmorphism border-r border-border transition-transform duration-200 ease-in-out`}>
          <div className="p-4">
            <nav className="space-y-2">
              <a href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-primary text-primary-foreground hover-lift transition-all duration-300">
                <Camera size={20} />
                <span>Dashboard</span>
              </a>
              {hasPermission('manage_cameras') && (
                <a href="/cameras" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted hover-lift transition-all duration-300 cyber-border">
                  <Camera size={20} />
                  <span>Cameras</span>
                </a>
              )}
              <a href="/alerts" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted hover-lift transition-all duration-300 cyber-border">
                <AlertTriangle size={20} />
                <span>Alerts</span>
              </a>
              {hasPermission('system_settings') && (
                <a href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted hover-lift transition-all duration-300 cyber-border">
                  <Settings size={20} />
                  <span>Settings</span>
                </a>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
