import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 /api/auth/me called');
  
  const userCookie = request.cookies.get('auth0_user');
  console.log('🍪 User cookie exists:', !!userCookie);
  console.log('🍪 User cookie value length:', userCookie?.value?.length || 0);
  console.log('🍪 User cookie value preview:', userCookie?.value?.substring(0, 100) + '...');
  
  if (!userCookie || !userCookie.value || userCookie.value.trim() === '') {
    console.log('❌ No valid user cookie found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    console.log('👤 Parsed user data:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasId: !!user.id,
      hasEmail: !!user.email
    });
    
    // Validate that user has required fields
    if (!user.id || !user.email) {
      console.log('❌ Missing required user fields:', { id: !!user.id, email: !!user.email });
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }
    
    // Ensure role is properly set
    if (!user.role) {
      user.role = 'operator'; // Default role
      console.log('🔧 Set default role to operator');
    }
    
    console.log('✅ Returning user data successfully');
    return NextResponse.json(user);
  } catch (error) {
    console.error('💥 Error parsing user cookie:', error);
    return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
  }
}
