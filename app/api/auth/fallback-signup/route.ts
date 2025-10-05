import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get Auth0 credentials
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;

    if (!auth0Domain || !clientId || !baseUrl) {
      return NextResponse.json(
        { error: 'Auth0 configuration missing' },
        { status: 500 }
      );
    }

    // Try direct signup first
    try {
      const signupResponse = await fetch(`${auth0Domain}/dbconnections/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          email: email,
          password: password,
          connection: 'Username-Password-Authentication',
          user_metadata: {
            name: name,
            role: role || 'operator'
          }
        }),
      });

      if (signupResponse.ok) {
        const signupData = await signupResponse.json();
        console.log('Direct signup successful:', signupData);
        
        // Create user data object
        const userData = {
          id: signupData._id,
          email: signupData.email,
          name: name,
          role: role || 'operator',
          email_verified: false
        };

        // Create response with user data
        const response = NextResponse.json({
          success: true,
          user: userData,
          message: 'Account created successfully! You are now logged in.'
        });

        // Set user session cookie
        response.cookies.set('auth0_user', JSON.stringify(userData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
      } else {
        const errorData = await signupResponse.json();
        console.error('Direct signup failed:', errorData);
        
        // If direct signup fails, redirect to Auth0 signup
        const signupUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
          response_type: 'code',
          client_id: clientId,
          redirect_uri: `${baseUrl}/api/auth/callback`,
          scope: 'openid profile email',
          prompt: 'login',
          screen_hint: 'signup',
          login_hint: email
        });
        
        return NextResponse.redirect(signupUrl);
      }
    } catch (error) {
      console.error('Direct signup error:', error);
      
      // If direct signup fails, redirect to Auth0 signup
      const signupUrl = `${auth0Domain}/authorize?` + new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: `${baseUrl}/api/auth/callback`,
        scope: 'openid profile email',
        prompt: 'login',
        screen_hint: 'signup',
        login_hint: email
      });
      
      return NextResponse.redirect(signupUrl);
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
