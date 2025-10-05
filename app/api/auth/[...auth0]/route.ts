import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'login';

  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const baseUrl = process.env.AUTH0_BASE_URL;

  if (!auth0Domain || !clientId || !baseUrl) {
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
        prompt: 'login'
      });
      
      if (connection) {
        loginParams.set('connection', connection);
      }
      
      if (screenHint) {
        loginParams.set('screen_hint', screenHint);
      }
      
      const loginUrl = `${auth0Domain}/authorize?${loginParams}`;
      return NextResponse.redirect(loginUrl);

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
