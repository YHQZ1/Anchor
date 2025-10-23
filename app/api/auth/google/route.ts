/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    let user

    if (existingUser) {
      user = existingUser
    } else {
      const randomPassword = Math.random().toString(36) + Date.now().toString(36)
      
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          username: name || email.split('@')[0],
          password: randomPassword,
          auth_provider: 'google',
        }])
        .select()
        .single()

      if (userError) return NextResponse.json({ error: userError.message }, { status: 400 })

      user = userData

      await supabaseAdmin
        .from('profiles')
        .insert([{
          id: user.id,
          full_name: name || email.split('@')[0],
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('onboarding_completed, student_id, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Google authentication successful',
      user: userWithoutPassword,
      token,
      profile: {
        onboarding_completed: profile?.onboarding_completed || false,
        student_id: profile?.student_id || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null
      }
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}