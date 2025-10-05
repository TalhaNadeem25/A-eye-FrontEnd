'use client';

import { useState } from 'react';
import { User, LogOut, Settings, Users, Shield, Menu, X } from 'lucide-react';
import { useAuth0 } from '../contexts/Auth0Context';
import { useRouter } from 'next/navigation';

export default function Auth0Navigation() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    // logout() already handles the redirect
  };

  const handleLogin = () => {
    router.push('/login/auth0');
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-full">
                <Shield className="text-primary-foreground" size={24} />
              </div>
              <span className="text-xl font-bold text-foreground">Surveillance</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </a>
                {hasPermission('manage_settings') && (
                  <a
                    href="/admin/users"
                    className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
                  >
                    <Users size={16} />
                    <span>Users</span>
                  </a>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.avatar || '/default-avatar.png'}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-foreground">{user?.name}</div>
                      <div className="text-muted-foreground">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated ? (
                <>
                  <a
                    href="/dashboard"
                    className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                  {hasPermission('manage_settings') && (
                    <a
                      href="/admin/users"
                      className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      User Management
                    </a>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <img
                        src={user?.avatar || '/default-avatar.png'}
                        alt={user?.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-foreground">{user?.name}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground">{user?.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}