import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Auth0 route called');
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'login';
  
  console.log('📋 Request details:', {
    url: request.url,
    action: action,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Handle test-login case
  if (request.url.includes('test-login')) {
    console.log('🧪 Test login request detected, returning test data');
    return NextResponse.json({
      success: true,
      message: 'Auth0 configuration test completed',
      config: {
        auth0Domain: process.env.AUTH0_ISSUER_BASE_URL,
        clientId: process.env.AUTH0_CLIENT_ID,
        baseUrl: process.env.AUTH0_BASE_URL,
        redirectUri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`
      },
      timestamp: new Date().toISOString()
    });
  }

  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const baseUrl = process.env.AUTH0_BASE_URL;

  console.log('🔧 Auth0 environment check:', {
    auth0Domain: auth0Domain ? 'SET' : 'NOT SET',
    clientId: clientId ? 'SET' : 'NOT SET',
    baseUrl: baseUrl ? 'SET' : 'NOT SET'
  });

  if (!auth0Domain || !clientId || !baseUrl) {
    console.error('❌ Auth0 configuration missing:', {
      auth0Domain: !!auth0Domain,
      clientId: !!clientId,
      baseUrl: !!baseUrl
    });
    return NextResponse.json({ error: 'Auth0 configuration missing' }, { status: 500 });
  }

  switch (action) {
    case 'login':
      const connection = searchParams.get('connection');
      const screenHint = searchParams.get('screen_hint');
      const loginParams = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: `${baseUrl}/api/auth/callback`,
        scope: 'openid profile email',
        audience: `${auth0Domain}/api/v2/`
      });
      
      // Only add connection if explicitly provided via URL parameter
      if (connection) {
        loginParams.set('connection', connection);
      }
      
      if (screenHint) {
        loginParams.set('screen_hint', screenHint);
      }
      
      const loginUrl = `${auth0Domain}/authorize?${loginParams}`;
      console.log('🔐 Redirecting to Auth0 login:', loginUrl);
      console.log('📤 Login parameters:', Object.fromEntries(loginParams.entries()));
      
      try {
        const response = NextResponse.redirect(loginUrl);
        console.log('✅ Redirect response created successfully');
        return response;
      } catch (error) {
        console.error('❌ Redirect failed:', error);
        return NextResponse.json({ error: 'Redirect failed' }, { status: 500 });
      }

    case 'logout':
      const logoutUrl = `${auth0Domain}/v2/logout?` + new URLSearchParams({
        client_id: clientId,
        returnTo: baseUrl
      });
      return NextResponse.redirect(logoutUrl);

    case 'callback':
      return NextResponse.json({ message: 'Callback handled' });

    case 'profile':
      return NextResponse.json({ message: 'Profile endpoint' });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
