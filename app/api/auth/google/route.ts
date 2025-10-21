import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { googleAccessToken, email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      // User exists - log them in
      user = existingUser;
    } else {
      // Create new user with Google OAuth
      // Generate a random password for OAuth users
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 12);
      
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          username: name || email.split('@')[0],
          password: randomPassword,
          auth_provider: 'google',
        }])
        .select()
        .single();

      if (userError) {
        return NextResponse.json(
          { error: userError.message },
          { status: 400 }
        );
      }

      user = userData;
    }

    // Generate your existing JWT token (same as your login/signup)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Google authentication successful',
      user: userWithoutPassword,
      token,
    });

  } catch (err) {
    console.error('Google auth error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}