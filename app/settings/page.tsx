'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '../contexts/Auth0Context';
import { User, Users, Shield, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/Layout';

interface OperatorAccount {
  id: string;
  email: string;
  name: string;
  role: 'operator';
  createdBy: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export default function SettingsPage() {
  const { user, hasPermission, logout } = useAuth0();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOperator, setNewOperator] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [operators, setOperators] = useState<OperatorAccount[]>([
    {
      id: 'op-001',
      email: 'operator@demo.com',
      name: 'Demo Operator',
      role: 'operator',
      createdBy: user?.id || 'manager-001',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-01-20'),
      isActive: true
    }
  ]);

  // Route guard - only managers can access settings
  if (!hasPermission('manage_settings')) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="text-destructive mx-auto mb-4" size={48} />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to access settings.
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

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newOperator.password !== newOperator.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newOperator.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Create new operator account
    const newAccount: OperatorAccount = {
      id: `op-${Date.now()}`,
      email: newOperator.email,
      name: newOperator.name,
      role: 'operator',
      createdBy: user?.id || 'manager-001',
      createdAt: new Date(),
      isActive: true
    };

    setOperators(prev => [...prev, newAccount]);
    setNewOperator({ email: '', name: '', password: '', confirmPassword: '' });
    setShowCreateForm(false);
    
    // In a real app, you'd send this to your backend
    console.log('Created operator account:', newAccount);
  };

  const handleDeleteOperator = (operatorId: string) => {
    if (confirm('Are you sure you want to delete this operator account?')) {
      setOperators(prev => prev.filter(op => op.id !== operatorId));
    }
  };

  const handleToggleOperator = (operatorId: string) => {
    setOperators(prev => 
      prev.map(op => 
        op.id === operatorId 
          ? { ...op, isActive: !op.isActive }
          : op
      )
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
            <p className="text-muted-foreground">
              Manage operator accounts and system configuration
            </p>
          </div>

          {/* Manager Info */}
          <div className="glassmorphism border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="text-primary" size={24} />
              <h2 className="text-xl font-semibold text-foreground">Manager Account</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium text-primary">Manager</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="font-medium text-foreground">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Operator Management */}
          <div className="glassmorphism border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="text-primary" size={24} />
                <h2 className="text-xl font-semibold text-foreground">Operator Accounts</h2>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                <span>Create Operator</span>
              </button>
            </div>

            {/* Create Operator Form */}
            {showCreateForm && (
              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Create New Operator Account</h3>
                <form onSubmit={handleCreateOperator} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newOperator.name}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter operator name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newOperator.email}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="operator@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newOperator.password}
                          onChange={(e) => setNewOperator(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                          placeholder="Enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newOperator.confirmPassword}
                        onChange={(e) => setNewOperator(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Create Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Operators List */}
            <div className="space-y-4">
              {operators.map((operator) => (
                <div key={operator.id} className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <User className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{operator.name}</h3>
                        <p className="text-sm text-muted-foreground">{operator.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {operator.createdAt.toLocaleDateString()}
                          {operator.lastLogin && ` • Last login: ${operator.lastLogin.toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        operator.isActive 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {operator.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleOperator(operator.id)}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title={operator.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {operator.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteOperator(operator.id)}
                        className="p-2 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                        title="Delete Operator"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Actions */}
          <div className="glassmorphism border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">System Actions</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
