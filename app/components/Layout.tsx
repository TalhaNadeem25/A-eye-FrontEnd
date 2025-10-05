'use client';

import { useState } from 'react';
import { Menu, X, LogOut, Settings, Camera, AlertTriangle, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
// import NotificationSystem, { useNotifications } from './NotificationSystem';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // const { notifications, markAsRead, dismiss, clearAll } = useNotifications();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === path;
  };

  // Function to get link classes based on active state
  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-300 hover-lift";
    const activeClasses = "bg-primary text-primary-foreground";
    const inactiveClasses = "hover:bg-muted cyber-border";
    
    return `${baseClasses} ${isActiveLink(path) ? activeClasses : inactiveClasses}`;
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
              {/* <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDismiss={dismiss}
                onClearAll={clearAll}
              /> */}
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
              <a href="/dashboard" className={getLinkClasses('/dashboard')}>
                <Camera size={20} />
                <span>Dashboard</span>
              </a>
              {hasPermission('manage_cameras') && (
                <a href="/cameras" className={getLinkClasses('/cameras')}>
                  <Camera size={20} />
                  <span>Cameras</span>
                </a>
              )}
              <a href="/alerts" className={getLinkClasses('/alerts')}>
                <AlertTriangle size={20} />
                <span>Alerts</span>
              </a>
              {hasPermission('view_sessions') && (
                <a href="/security" className={getLinkClasses('/security')}>
                  <Shield size={20} />
                  <span>Security</span>
                </a>
              )}
                  {hasPermission('system_settings') && (
                    <a href="/settings" className={getLinkClasses('/settings')}>
                      <Settings size={20} />
                      <span>Settings</span>
                    </a>
                  )}
                  <a href="/test" className={getLinkClasses('/test')}>
                    <AlertTriangle size={20} />
                    <span>Test Alerts</span>
                  </a>
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
