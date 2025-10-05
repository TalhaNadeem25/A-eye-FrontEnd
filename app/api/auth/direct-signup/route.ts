import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Direct signup API called');
    const { name, email, password, role } = await request.json();
    console.log('📝 Signup data:', { name, email, passwordLength: password?.length, role });

    if (!name || !email || !password) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      console.log('❌ Password too short:', password.length);
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get Auth0 credentials
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;

    console.log('🔧 Auth0 Config:', {
      domain: auth0Domain ? 'SET' : 'NOT SET',
      clientId: clientId ? 'SET' : 'NOT SET'
    });

    if (!auth0Domain || !clientId) {
      console.log('❌ Auth0 configuration missing');
      return NextResponse.json(
        { error: 'Auth0 configuration missing' },
        { status: 500 }
      );
    }

    // Use Auth0's signup API (no special grants required)
    try {
      const signupPayload = {
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
      };

      console.log('🌐 Making Auth0 signup request to:', `${auth0Domain}/dbconnections/signup`);
      console.log('📤 Signup payload:', {
        ...signupPayload,
        password: '[HIDDEN]'
      });

      const signupResponse = await fetch(`${auth0Domain}/dbconnections/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload),
      });

      console.log('📡 Auth0 signup response status:', signupResponse.status);
      console.log('📡 Auth0 signup response headers:', Object.fromEntries(signupResponse.headers.entries()));

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
        console.error('❌ Auth0 signup failed:', errorData);
        console.error('❌ Error details:', {
          code: errorData.code,
          error: errorData.error,
          description: errorData.description,
          statusCode: errorData.statusCode,
          name: errorData.name
        });
        
        // Handle specific Auth0 error codes
        if (errorData.code === 'user_exists' || errorData.error === 'user_exists') {
          console.log('🔄 User already exists error');
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
        
        if (errorData.error === 'invalid_password' || errorData.error === 'password_too_weak') {
          console.log('🔄 Password too weak error');
          return NextResponse.json(
            { error: 'Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and special characters.' },
            { status: 400 }
          );
        }
        
        if (errorData.error === 'invalid_signup') {
          console.log('🔄 Invalid signup error');
          return NextResponse.json(
            { error: 'Invalid signup data provided. Please check your information and try again.' },
            { status: 400 }
          );
        }
        
        // Return a more user-friendly error message
        const errorMessage = errorData.description || errorData.error || 'Failed to create account';
        console.log('🔄 Generic error:', errorMessage);
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
