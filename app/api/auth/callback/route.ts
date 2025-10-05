import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Auth0 callback received');
    console.log('🔍 Full callback URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('📋 Callback params:', { 
      code: !!code, 
      error, 
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (error) {
      console.error('❌ Auth0 callback error:', error, errorDescription);
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`);
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code: code,
        redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ Token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received:', { access_token: !!tokens.access_token, id_token: !!tokens.id_token });

    // Get user info
    const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('❌ Failed to get user info');
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=user_info_failed`);
    }

    const user = await userResponse.json();
    console.log('👤 User info received:', { sub: user.sub, email: user.email });

    // Create user data object
    const userData = {
      id: user.sub,
      email: user.email,
      name: user.name || user.email,
      role: user['https://surveillance-dashboard.com/roles'] || user.user_metadata?.role || 'operator',
      avatar: user.picture,
      lastLogin: new Date(),
      sessionId: user.sub,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      location: 'Unknown',
      device: request.headers.get('user-agent') || 'Unknown'
    };

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/dashboard`);
    
    // Set user session cookie
    response.cookies.set('auth0_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('✅ Login successful, redirecting to dashboard');
    return response;

  } catch (error) {
    console.error('💥 Callback error:', error);
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login?error=callback_error`);
  }
}