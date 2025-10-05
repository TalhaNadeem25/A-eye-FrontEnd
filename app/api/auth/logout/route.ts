import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Get all existing cookies to clear them
    const existingCookies = request.cookies.getAll();
    
    // Clear all existing cookies
    existingCookies.forEach(cookie => {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    // Also clear cookies with different path and domain settings
    const cookiesToClear = [
      'auth0_user',
      'auth0_session', 
      'auth0_access_token',
      'auth0_id_token',
      'auth0_refresh_token',
      'appSession',
      'session',
      'user',
      'token',
      'auth'
    ];

    cookiesToClear.forEach(cookieName => {
      // Clear with different path and domain combinations
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
