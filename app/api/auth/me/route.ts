import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userCookie = request.cookies.get('auth0_user');
  
  if (!userCookie || !userCookie.value || userCookie.value.trim() === '') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    
    // Validate that user has required fields
    if (!user.id || !user.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }
    
    // Ensure role is properly set
    if (!user.role) {
      user.role = 'operator'; // Default role
    }
    
    console.log('Returning user data:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
  }
}
