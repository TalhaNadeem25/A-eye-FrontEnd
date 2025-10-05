import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check all Auth0 environment variables
    const auth0Config = {
      AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET (length: ' + process.env.AUTH0_SECRET.length + ')' : 'NOT SET',
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || 'NOT SET',
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'NOT SET',
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? 'SET' : 'NOT SET',
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    };

    // Check for missing critical variables
    const missingVars = [];
    if (!process.env.AUTH0_SECRET) missingVars.push('AUTH0_SECRET');
    if (!process.env.AUTH0_BASE_URL) missingVars.push('AUTH0_BASE_URL');
    if (!process.env.AUTH0_ISSUER_BASE_URL) missingVars.push('AUTH0_ISSUER_BASE_URL');
    if (!process.env.AUTH0_CLIENT_ID) missingVars.push('AUTH0_CLIENT_ID');
    if (!process.env.AUTH0_CLIENT_SECRET) missingVars.push('AUTH0_CLIENT_SECRET');

    // Check AUTH0_SECRET length
    const secretLength = process.env.AUTH0_SECRET?.length || 0;
    const secretValid = secretLength >= 32;

    return NextResponse.json({
      success: missingVars.length === 0 && secretValid,
      config: auth0Config,
      missingVariables: missingVars,
      secretValid: secretValid,
      secretLength: secretLength,
      message: missingVars.length === 0 
        ? (secretValid ? 'All Auth0 variables are configured correctly' : 'AUTH0_SECRET is too short (need 32+ characters)')
        : `Missing variables: ${missingVars.join(', ')}`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check Auth0 configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
