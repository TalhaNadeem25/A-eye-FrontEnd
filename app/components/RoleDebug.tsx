'use client';

import { useAuth0 } from '../contexts/Auth0Context';

export default function RoleDebug() {
  const { user, isAuthenticated, hasPermission } = useAuth0();

  if (!isAuthenticated || !user) {
    return null;
  }

  const managerPermissions = [
    'view_dashboard',
    'manage_cameras',
    'acknowledge_alerts',
    'dismiss_alerts',
    'view_sessions',
    'revoke_sessions',
    'access_logs',
    'system_settings',
    'manage_settings'
  ];

  const operatorPermissions = [
    'view_dashboard',
    'view_cameras',
    'forward_alerts'
  ];

  return (
    <div className="bg-muted p-4 rounded-lg border">
      <h3 className="font-semibold text-foreground mb-2">Role Debug Information</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>User Role:</strong> <span className="text-primary">{user.role}</span>
        </div>
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
        <div>
          <strong>User Email:</strong> {user.email}
        </div>
        <div>
          <strong>User Name:</strong> {user.name}
        </div>
        
        <div className="mt-4">
          <strong>Available Permissions:</strong>
          <div className="mt-2">
            {user.role === 'manager' ? (
              <div>
                <div className="text-green-600 font-medium">Manager Permissions:</div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {managerPermissions.map(permission => (
                    <li key={permission} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <div className="text-blue-600 font-medium">Operator Permissions:</div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {operatorPermissions.map(permission => (
                    <li key={permission} className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <strong>Permission Tests:</strong>
          <div className="mt-2 space-y-1">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              manage_settings: {hasPermission('manage_settings') ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              view_sessions: {hasPermission('view_sessions') ? 'Yes' : 'No'}
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              manage_cameras: {hasPermission('manage_cameras') ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
