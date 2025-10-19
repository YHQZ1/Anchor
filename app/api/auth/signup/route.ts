import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert user into database using admin client (bypasses RLS)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
        },
      ])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }
      throw error
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
