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

    // Check if email already exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user into Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        username,
      }])
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    const user = userData

    // Create initial profile with onboarding_completed = false
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: user.id,
        onboarding_completed: false, // ← New users start with false
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway - profile can be created during onboarding
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token,
      onboarding_completed: false, // ← Always false for new signups
    }, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}