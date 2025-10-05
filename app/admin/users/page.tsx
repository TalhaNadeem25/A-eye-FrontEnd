'use client';

import { useState, useEffect } from 'react';
import { User, Users, Plus, Search, Filter, MoreVertical, Edit, Trash2, Shield, Mail, Calendar } from 'lucide-react';
import { useAuth0 } from '../../contexts/Auth0Context';
import { auth0Management, Auth0User } from '../../services/Auth0Management';

export default function UserManagementPage() {
  const { user: currentUser, hasPermission } = useAuth0();
  const [users, setUsers] = useState<Auth0User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check permissions
  if (!hasPermission('manage_settings')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="text-destructive mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await auth0Management.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       (user.app_metadata?.roles?.includes(filterRole) ?? false);
    return matchesSearch && matchesRole;
  });

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      await auth0Management.blockUser(userId, blocked);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await auth0Management.deleteUser(userId);
        loadUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (user: Auth0User) => {
    const roles = user.app_metadata?.roles || [];
    if (roles.includes('manager')) {
      return <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">Manager</span>;
    } else if (roles.includes('operator')) {
      return <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">Operator</span>;
    }
    return <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">User</span>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage Auth0 users and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glassmorphism border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <Users className="text-primary" size={24} />
            </div>
          </div>
          <div className="glassmorphism border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.app_metadata?.roles?.includes('manager')).length}
                </p>
              </div>
              <Shield className="text-primary" size={24} />
            </div>
          </div>
          <div className="glassmorphism border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operators</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.app_metadata?.roles?.includes('operator')).length}
                </p>
              </div>
              <User className="text-primary" size={24} />
            </div>
          </div>
          <div className="glassmorphism border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive">
                  {users.filter(u => u.blocked).length}
                </p>
              </div>
              <Shield className="text-destructive" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glassmorphism border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground" size={20} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="manager">Managers</option>
                <option value="operator">Operators</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glassmorphism border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.picture || '/default-avatar.png'}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail size={14} className="mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.blocked 
                            ? 'bg-destructive text-destructive-foreground' 
                            : 'bg-success text-success-foreground'
                        }`}>
                          {user.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleBlockUser(user.user_id, !user.blocked)}
                            className={`px-3 py-1 rounded text-xs ${
                              user.blocked 
                                ? 'bg-success text-success-foreground hover:bg-success/90' 
                                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            }`}
                          >
                            {user.blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
