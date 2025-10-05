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

    if (!auth0Domain || !clientId) {
      return NextResponse.json(
        { error: 'Auth0 configuration missing' },
        { status: 500 }
      );
    }

    // Use Auth0's signup API (no special grants required)
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
            role: role || 'operator',
            full_name: name
          },
          app_metadata: {
            roles: [role || 'operator']
          }
        }),
      });

      if (signupResponse.ok) {
        const signupData = await signupResponse.json();
        console.log('Signup successful:', signupData);
        
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
        console.error('Signup failed:', errorData);
        
        // Handle specific Auth0 error codes
        if (errorData.code === 'user_exists' || errorData.error === 'user_exists') {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
        
        if (errorData.error === 'invalid_password' || errorData.error === 'password_too_weak') {
          return NextResponse.json(
            { error: 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and special characters.' },
            { status: 400 }
          );
        }
        
        if (errorData.error === 'invalid_signup') {
          return NextResponse.json(
            { error: 'Invalid signup data provided' },
            { status: 400 }
          );
        }
        
        // Return a more user-friendly error message
        const errorMessage = errorData.description || errorData.error || 'Failed to create account';
        return NextResponse.json(
          { error: errorMessage },
          { status: signupResponse.status }
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
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
