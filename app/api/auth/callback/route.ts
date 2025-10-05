import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login/auth0?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login/auth0?error=no_code`);
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
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login/auth0?error=token_exchange_failed`);
  }

  const tokens = await tokenResponse.json();

  // Get user info
  const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/login/auth0?error=user_info_failed`);
  }

  const user = await userResponse.json();

  // Store user info in session (you can use cookies or session storage)
  const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/dashboard`);
  
  // Set user info in cookies
  response.cookies.set('auth0_user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
