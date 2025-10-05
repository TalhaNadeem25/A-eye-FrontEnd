import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login-direct API called');
    const { email, password } = await request.json();
    console.log('📧 Email received:', email);
    console.log('🔑 Password length:', password?.length);

    if (!email || !password) {
      console.error('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get Auth0 credentials
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    console.log('🔧 Auth0 Config Check:');
    console.log('  - AUTH0_ISSUER_BASE_URL:', auth0Domain ? 'SET' : 'NOT SET');
    console.log('  - AUTH0_CLIENT_ID:', clientId ? 'SET' : 'NOT SET');
    console.log('  - AUTH0_CLIENT_SECRET:', clientSecret ? 'SET' : 'NOT SET');

    if (!auth0Domain || !clientId || !clientSecret) {
      console.error('❌ Auth0 configuration missing');
      return NextResponse.json(
        { error: 'Auth0 configuration missing' },
        { status: 500 }
      );
    }

    // Authenticate with Auth0 using Resource Owner Password Grant
    console.log('🌐 Making Auth0 token request to:', `${auth0Domain}/oauth/token`);
    console.log('📤 Request body:', {
      grant_type: 'password',
      username: email,
      password: '[HIDDEN]',
      client_id: clientId,
      client_secret: '[HIDDEN]',
      scope: 'openid profile email',
      connection: 'Username-Password-Authentication',
    });

    const tokenResponse = await fetch(`${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'password',
        username: email,
        password: password,
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'openid profile email',
        connection: 'Username-Password-Authentication',
      }),
    });

    console.log('📡 Auth0 token response status:', tokenResponse.status);
    console.log('📡 Auth0 token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('❌ Auth0 token error:', error);
      return NextResponse.json(
        { error: error.error_description || 'Authentication failed' },
        { status: 401 }
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`${auth0Domain}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 401 }
      );
    }

    const user = await userResponse.json();

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user['https://surveillance-dashboard.com/roles'] || 'operator',
      },
      tokens: {
        access_token: tokens.access_token,
        id_token: tokens.id_token,
      },
    });

    // Set user info in cookies
    response.cookies.set('auth0_user', JSON.stringify({
      id: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user['https://surveillance-dashboard.com/roles'] || 'operator',
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
