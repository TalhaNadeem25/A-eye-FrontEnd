import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This endpoint provides instructions for enabling passwordless email in Auth0
    const instructions = {
      message: "To enable passwordless email authentication in Auth0:",
      steps: [
        "1. Go to Auth0 Dashboard → Authentication → Passwordless",
        "2. Enable 'Email' connection",
        "3. Configure email settings (SMTP or Auth0's email service)",
        "4. Go to Applications → Your App → Connections",
        "5. Enable 'Email' connection for your application",
        "6. Save changes"
      ],
      note: "Once enabled, the passwordless email authentication will work automatically."
    };

    return NextResponse.json(instructions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get instructions' },
      { status: 500 }
    );
  }
}
