'use client';

import { useState, useEffect } from 'react';

export default function Auth0Debug() {
  const [config, setConfig] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check environment variables
    const auth0Config = {
      AUTH0_SECRET: process.env.NEXT_PUBLIC_AUTH0_SECRET || 'NOT SET',
      AUTH0_BASE_URL: process.env.NEXT_PUBLIC_AUTH0_BASE_URL || 'NOT SET',
      AUTH0_ISSUER_BASE_URL: process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL || 'NOT SET',
      AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'NOT SET',
      AUTH0_CLIENT_SECRET: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    };
    
    setConfig(auth0Config);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-red-800 mb-4">Auth0 Configuration Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>AUTH0_SECRET:</strong>
            <span className={`ml-2 ${config?.AUTH0_SECRET === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
              {config?.AUTH0_SECRET === 'NOT SET' ? '❌ NOT SET' : '✅ SET'}
            </span>
          </div>
          
          <div>
            <strong>AUTH0_BASE_URL:</strong>
            <span className={`ml-2 ${config?.AUTH0_BASE_URL === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
              {config?.AUTH0_BASE_URL === 'NOT SET' ? '❌ NOT SET' : '✅ ' + config?.AUTH0_BASE_URL}
            </span>
          </div>
          
          <div>
            <strong>AUTH0_ISSUER_BASE_URL:</strong>
            <span className={`ml-2 ${config?.AUTH0_ISSUER_BASE_URL === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
              {config?.AUTH0_ISSUER_BASE_URL === 'NOT SET' ? '❌ NOT SET' : '✅ ' + config?.AUTH0_ISSUER_BASE_URL}
            </span>
          </div>
          
          <div>
            <strong>AUTH0_CLIENT_ID:</strong>
            <span className={`ml-2 ${config?.AUTH0_CLIENT_ID === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
              {config?.AUTH0_CLIENT_ID === 'NOT SET' ? '❌ NOT SET' : '✅ SET'}
            </span>
          </div>
          
          <div>
            <strong>AUTH0_CLIENT_SECRET:</strong>
            <span className={`ml-2 ${config?.AUTH0_CLIENT_SECRET === 'NOT SET' ? 'text-red-600' : 'text-green-600'}`}>
              {config?.AUTH0_CLIENT_SECRET === 'NOT SET' ? '❌ NOT SET' : '✅ SET'}
            </span>
          </div>
          
          <div>
            <strong>NODE_ENV:</strong>
            <span className="ml-2 text-blue-600">{config?.NODE_ENV}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800">Common Issues:</h4>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• Environment variables must be set in Vercel dashboard</li>
            <li>• Variables should NOT have NEXT_PUBLIC_ prefix for server-side</li>
            <li>• Redeploy after setting environment variables</li>
            <li>• Check Vercel environment variables are not empty</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
