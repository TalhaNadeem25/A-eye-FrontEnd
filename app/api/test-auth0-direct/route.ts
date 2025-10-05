import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing direct Auth0 access...');
    
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;

    // Test the exact URL that's causing issues
    const testUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback`,
      scope: 'openid profile email',
      prompt: 'login'
    });

    console.log('🔗 Testing URL:', testUrl);

    // Try to fetch the URL and see what happens
    try {
      const response = await fetch(testUrl, { 
        method: 'GET',
        redirect: 'manual' // Don't follow redirects
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        console.log('🔄 Redirect location:', location);
        
        return NextResponse.json({
          success: true,
          message: 'Auth0 redirect detected',
          status: response.status,
          redirectLocation: location,
          testUrl: testUrl
        });
      } else {
        const text = await response.text();
        console.log('📄 Response body:', text.substring(0, 500));
        
        return NextResponse.json({
          success: true,
          message: 'Auth0 response received',
          status: response.status,
          body: text.substring(0, 500),
          testUrl: testUrl
        });
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Auth0',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        testUrl: testUrl
      });
    }

  } catch (error) {
    console.error('💥 Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
