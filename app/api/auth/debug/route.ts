import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check Auth0 environment variables
    const auth0Config = {
      AUTH0_SECRET: process.env.AUTH0_SECRET ? 'SET' : 'NOT SET',
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

    return NextResponse.json({
      success: missingVars.length === 0,
      config: auth0Config,
      missingVariables: missingVars,
      message: missingVars.length === 0 
        ? 'All Auth0 variables are configured' 
        : `Missing variables: ${missingVars.join(', ')}`
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check Auth0 configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
