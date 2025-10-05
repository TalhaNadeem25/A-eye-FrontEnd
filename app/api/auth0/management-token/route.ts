import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
    const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
    const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE;
    const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;

    if (!clientId || !clientSecret || !audience || !issuerBaseUrl) {
      return NextResponse.json(
        { error: 'Auth0 Management API credentials not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`${issuerBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Auth0 Management API token error:', error);
      return NextResponse.json(
        { error: 'Failed to get management token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting Auth0 management token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
