import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Comprehensive Auth0 configuration check...');
    
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;

    // Check environment variables
    const envCheck = {
      AUTH0_ISSUER_BASE_URL: auth0Domain ? 'SET' : 'NOT SET',
      AUTH0_CLIENT_ID: clientId ? 'SET' : 'NOT SET',
      AUTH0_BASE_URL: baseUrl ? 'SET' : 'NOT SET'
    };

    // Test different Auth0 endpoints
    const tests = [];

    // Test 1: Basic authorize endpoint
    try {
      const basicUrl = `${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(baseUrl + '/api/auth/callback')}`;
      const response1 = await fetch(basicUrl, { method: 'GET', redirect: 'manual' });
      tests.push({
        name: 'Basic Authorize',
        url: basicUrl,
        status: response1.status,
        success: response1.status === 302 || response1.status === 200
      });
    } catch (error) {
      tests.push({
        name: 'Basic Authorize',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: With connection parameter
    try {
      const connectionUrl = `${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(baseUrl + '/api/auth/callback')}&connection=Username-Password-Authentication`;
      const response2 = await fetch(connectionUrl, { method: 'GET', redirect: 'manual' });
      tests.push({
        name: 'With Connection',
        url: connectionUrl,
        status: response2.status,
        success: response2.status === 302 || response2.status === 200
      });
    } catch (error) {
      tests.push({
        name: 'With Connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Check Auth0 domain accessibility
    try {
      const domainUrl = `${auth0Domain}/.well-known/openid_configuration`;
      const response3 = await fetch(domainUrl, { method: 'GET' });
      const config = await response3.json();
      tests.push({
        name: 'Domain Check',
        url: domainUrl,
        status: response3.status,
        success: response3.ok,
        issuer: config.issuer
      });
    } catch (error) {
      tests.push({
        name: 'Domain Check',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Auth0 configuration comprehensive check completed',
      environment: envCheck,
      tests: tests,
      recommendations: [
        '1. Check Auth0 Dashboard → Applications → Your App → Settings',
        '2. Verify Application Type is "Regular Web Application"',
        '3. Enable "Authorization Code" grant type',
        '4. Add callback URL to Allowed Callback URLs',
        '5. Check if Username-Password-Authentication connection is enabled'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Config check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Configuration check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
