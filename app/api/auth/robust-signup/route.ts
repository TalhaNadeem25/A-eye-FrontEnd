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
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!auth0Domain || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Auth0 configuration missing' },
        { status: 500 }
      );
    }

    // Try multiple Auth0 signup methods
    let signupSuccess = false;
    let userData = null;
    let errorMessage = '';

    // Method 1: Try Auth0's signup API
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
        userData = {
          id: signupData._id,
          email: signupData.email,
          name: name,
          role: role || 'operator',
          email_verified: false
        };
        signupSuccess = true;
        console.log('Signup successful with Auth0 API');
      } else {
        const errorData = await signupResponse.json();
        console.error('Auth0 signup failed:', errorData);
        errorMessage = errorData.description || errorData.error || 'Signup failed';
      }
    } catch (error) {
      console.error('Auth0 signup error:', error);
      errorMessage = 'Auth0 signup service unavailable';
    }

    // Method 2: If Auth0 signup fails, try using Resource Owner Password Grant
    if (!signupSuccess) {
      try {
        console.log('Trying Resource Owner Password Grant...');
        
        // First, try to authenticate the user (this will create the user if it doesn't exist)
        const authResponse = await fetch(`${auth0Domain}/oauth/token`, {
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

        if (authResponse.ok) {
          const authData = await authResponse.json();
          
          // Get user info
          const userInfoResponse = await fetch(`${auth0Domain}/userinfo`, {
            headers: {
              'Authorization': `Bearer ${authData.access_token}`,
            },
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            userData = {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name || name,
              role: role || 'operator',
              email_verified: userInfo.email_verified || false
            };
            signupSuccess = true;
            console.log('Signup successful with Resource Owner Password Grant');
          }
        } else {
          const authError = await authResponse.json();
          console.error('Resource Owner Password Grant failed:', authError);
          errorMessage = authError.error_description || authError.error || 'Authentication failed';
        }
      } catch (error) {
        console.error('Resource Owner Password Grant error:', error);
        errorMessage = 'Authentication service unavailable';
      }
    }

    if (signupSuccess && userData) {
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
      // Handle specific error cases
      if (errorMessage.includes('user_exists') || errorMessage.includes('already exists')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      if (errorMessage.includes('invalid_password')) {
        return NextResponse.json(
          { error: 'Password does not meet requirements' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: errorMessage || 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
