/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyToken, requireAuth } from '@/lib/auth'

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { full_name, student_id, college_name, department, current_semester, expected_graduation } = await request.json()

    // Basic validation
    if (!college_name || !department) {
      return NextResponse.json(
        { error: 'College name and department are required' },
        { status: 400 }
      )
    }

    // Validate current_semester range if provided
    if (current_semester && (current_semester < 1 || current_semester > 12)) {
      return NextResponse.json(
        { error: 'Current semester must be between 1 and 12' },
        { status: 400 }
      )
    }

    // Upsert profile (creates or updates)
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        full_name,
        student_id,
        college_name,
        department,
        current_semester: current_semester || 1,
        expected_graduation,
        updated_at: new Date().toISOString(),
        onboarding_completed: true, // Mark as completed since they're saving
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Profile saved successfully',
      profile
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update (for specific fields)
export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request) // No await needed now
    
    const updates = await request.json()
    
    // Remove id if present to prevent changing user ID
    delete updates.id
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id) // Now user.id should work
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}