import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response that forces logout
    const response = NextResponse.json({
      success: true,
      message: 'Force logout completed'
    });

    // Clear ALL possible cookies with various combinations
    const allPossibleCookies = [
      'auth0_user',
      'auth0_session',
      'auth0_access_token', 
      'auth0_id_token',
      'auth0_refresh_token',
      'appSession',
      'session',
      'user',
      'token',
      'auth',
      'auth0',
      'next-auth',
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ];

    // Clear cookies with different settings
    allPossibleCookies.forEach(cookieName => {
      // Standard clear
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Clear with httpOnly: false
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Clear with different paths
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'none'
      });
    });

    // Also clear any existing cookies from the request
    const existingCookies = request.cookies.getAll();
    existingCookies.forEach(cookie => {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.json(
      { error: 'Force logout failed' },
      { status: 500 }
    );
  }
}
