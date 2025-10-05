import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Auth0 connections...');
    
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;

    // Test the minimal possible Auth0 URL
    const minimalUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: `${baseUrl}/api/auth/callback`
    });

    console.log('🔗 Minimal Auth0 URL:', minimalUrl);

    // Test the URL
    try {
      const response = await fetch(minimalUrl, { 
        method: 'GET',
        redirect: 'manual'
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        console.log('🔄 Redirect location:', location);
        
        return NextResponse.json({
          success: true,
          message: 'Auth0 redirect detected',
          status: response.status,
          redirectLocation: location,
          minimalUrl: minimalUrl,
          recommendation: 'Auth0 is working, check redirect location for errors'
        });
      } else if (response.status === 200) {
        const body = await response.text();
        console.log('📄 Response body (first 200 chars):', body.substring(0, 200));
        
        return NextResponse.json({
          success: true,
          message: 'Auth0 page loaded successfully',
          status: response.status,
          bodyPreview: body.substring(0, 200),
          minimalUrl: minimalUrl
        });
      } else {
        const body = await response.text();
        console.log('📄 Error response:', body.substring(0, 500));
        
        return NextResponse.json({
          success: false,
          message: 'Auth0 returned error',
          status: response.status,
          error: body.substring(0, 500),
          minimalUrl: minimalUrl,
          troubleshooting: [
            '1. Check if your Auth0 application has any connections enabled',
            '2. Go to Auth0 Dashboard → Applications → Your App → Connections',
            '3. Make sure at least one database or social connection is enabled',
            '4. Check if the application type is "Regular Web Application"'
          ]
        });
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Auth0',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        minimalUrl: minimalUrl
      });
    }

  } catch (error) {
    console.error('💥 Check connections error:', error);
    return NextResponse.json({
      success: false,
      error: 'Check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
