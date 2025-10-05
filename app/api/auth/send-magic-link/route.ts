import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // For now, we'll simulate sending a magic link
    // In a real implementation, you would:
    // 1. Generate a secure token
    // 2. Store it in your database with expiration
    // 3. Send an email with the magic link
    // 4. Create an endpoint to verify the token

    console.log(`Magic link requested for: ${email}`);
    
    // Simulate success
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
