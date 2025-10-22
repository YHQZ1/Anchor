import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get profile data including onboarding status
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('onboarding_completed, student_id, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    // Generate JWT with more user info
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
      message: 'Login successful', 
      token, 
      user: userWithoutPassword,
      profile: {
        onboarding_completed: profile?.onboarding_completed || false,
        student_id: profile?.student_id || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}