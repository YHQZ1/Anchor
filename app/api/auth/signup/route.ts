import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Basic validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Username, email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error checking existing user' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 } // 409 Conflict is more appropriate
      )
    }

    // Check if username already exists
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .single()

    if (usernameError && usernameError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Error checking username availability' },
        { status: 500 }
      )
    }

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user into Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        username: username.trim(),
      }])
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    const user = userData

    // Create initial profile with onboarding_completed = false
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: user.id,
        full_name: username, // Set initial full_name from username
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup if profile creation fails
      // Profile can be created/updated during onboarding
    }

    // Generate JWT with longer expiry
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Longer expiry for better UX
    )

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword,
      token,
      onboarding_completed: false, // Always false for new signups
    }, { status: 201 })

  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}