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

    // Try to get Management API token
    let managementToken = null;
    try {
      const tokenResponse = await fetch(`${auth0Domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID || clientId,
          client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || clientSecret,
          audience: `${auth0Domain}/api/v2/`,
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        managementToken = tokenData.access_token;
      } else {
        console.log('Management API not configured, using fallback method');
      }
    } catch (error) {
      console.log('Management API error:', error);
    }

    // If no management token, use fallback method
    if (!managementToken) {
      // Create a simple user account using Auth0's signup API
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
          return NextResponse.json({
            success: true,
            user: {
              id: signupData._id,
              email: signupData.email,
              name: name,
              role: role || 'operator',
              email_verified: false
            },
            message: 'Account created successfully. Please check your email for verification.'
          });
        } else {
          const errorData = await signupResponse.json();
          if (errorData.code === 'user_exists') {
            return NextResponse.json(
              { error: 'User with this email already exists' },
              { status: 409 }
            );
          }
          throw new Error(errorData.description || 'Signup failed');
        }
      } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
          { error: 'Failed to create account. Please try again.' },
          { status: 500 }
        );
      }
    }

    // If we have management token, use Management API
    if (managementToken) {
      // Create user in Auth0 using Management API
      const createUserResponse = await fetch(`${auth0Domain}/api/v2/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${managementToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection: 'Username-Password-Authentication',
          email: email,
          password: password,
          name: name,
          email_verified: false,
          app_metadata: {
            roles: [role || 'operator']
          },
          user_metadata: {
            full_name: name,
            signup_date: new Date().toISOString()
          }
        }),
      });

      if (!createUserResponse.ok) {
        const error = await createUserResponse.json();
        
        if (error.code === 'user_exists') {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          { error: error.message || 'Failed to create user' },
          { status: createUserResponse.status }
        );
      }

      const user = await createUserResponse.json();

      // Send verification email (optional)
      try {
        await fetch(`${auth0Domain}/api/v2/jobs/verification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.user_id,
            client_id: clientId
          }),
        });
      } catch (emailError) {
        console.log('Email verification not sent:', emailError);
        // Don't fail the signup if email verification fails
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          role: role || 'operator',
          email_verified: user.email_verified
        },
        message: 'Account created successfully. Please check your email for verification.'
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
