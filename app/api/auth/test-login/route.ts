import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Auth0 login configuration...');
    
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;

    console.log('🔧 Environment variables:', {
      auth0Domain,
      clientId,
      baseUrl,
      nodeEnv: process.env.NODE_ENV
    });

    if (!auth0Domain || !clientId || !baseUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing Auth0 configuration',
        details: {
          auth0Domain: !!auth0Domain,
          clientId: !!clientId,
          baseUrl: !!baseUrl
        }
      });
    }

    // Test Auth0 authorize endpoint (without actually calling it)
    const testUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback`,
      scope: 'openid profile email',
      prompt: 'login',
      connection: 'Username-Password-Authentication'
    });

    console.log('🔗 Test Auth0 URL:', testUrl);

    return NextResponse.json({
      success: true,
      message: 'Auth0 configuration test completed',
      testUrl: testUrl,
      config: {
        auth0Domain,
        clientId,
        baseUrl,
        redirectUri: `${baseUrl}/api/auth/callback`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Test login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
