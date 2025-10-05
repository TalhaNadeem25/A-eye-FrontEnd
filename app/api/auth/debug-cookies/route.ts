import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies from the request
    const allCookies = request.cookies.getAll();
    
    // Check for auth0_user cookie specifically
    const auth0UserCookie = request.cookies.get('auth0_user');
    
    // Get all cookie names
    const cookieNames = allCookies.map(cookie => cookie.name);
    
    // Check for any auth0 related cookies
    const auth0Cookies = allCookies.filter(cookie => 
      cookie.name.includes('auth0') || 
      cookie.name.includes('session') ||
      cookie.name.includes('user')
    );

    return NextResponse.json({
      success: true,
      totalCookies: allCookies.length,
      cookieNames: cookieNames,
      auth0UserCookie: {
        exists: !!auth0UserCookie,
        hasValue: !!auth0UserCookie?.value,
        valueLength: auth0UserCookie?.value?.length || 0,
        valuePreview: auth0UserCookie?.value?.substring(0, 100) + '...' || 'No value'
      },
      auth0RelatedCookies: auth0Cookies.map(cookie => ({
        name: cookie.name,
        hasValue: !!cookie.value,
        valueLength: cookie.value?.length || 0
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check cookies',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
