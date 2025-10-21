/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to verify JWT token
const verifyToken = (request: NextRequest) => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Fetch all classes for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: classes, error } = await supabaseAdmin
      .from('classes')
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    return NextResponse.json({ classes })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new class to timetable
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { course_id, day_of_week, start_time, end_time, room, class_type } = await request.json()

    // Validation
    if (!course_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Course, day, start time and end time are required' },
        { status: 400 }
      )
    }

    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .insert({
        user_id: user.id,
        course_id,
        day_of_week, // 0=Sunday, 1=Monday, etc.
        start_time,
        end_time,
        room: room || '',
        class_type: class_type || 'lecture'
      })
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Class added successfully',
      class: classItem
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove class from timetable
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('id')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('classes')
      .delete()
      .eq('id', classId)
      .eq('user_id', user.id) // Ensure user owns the class

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}