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

// GET - Fetch attendance records and summary for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const summaryOnly = searchParams.get('summary_only')

    // If only summary is needed
    if (summaryOnly === 'true') {
      return await getAttendanceSummary(user.id)
    }

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .eq('user_id', user.id)

    // Filter by course if provided
    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('class_date', startDate)
    }
    if (endDate) {
      query = query.lte('class_date', endDate)
    }

    const { data: attendance, error } = await query
      .order('class_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }

    return NextResponse.json({ attendance })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get attendance summary
async function getAttendanceSummary(userId: string) {
  const { data: attendance, error } = await supabaseAdmin
    .from('attendance')
    .select(`
      class_date,
      status,
      courses (course_code, course_name, color)
    `)
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  // Calculate summary statistics
  const summary = attendance?.reduce((acc: any, record: any) => {
    const courseCode = record.courses.course_code;
    if (!acc[courseCode]) {
      acc[courseCode] = {
        course_code: courseCode,
        course_name: record.courses.course_name,
        color: record.courses.color,
        total_classes: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendance_percentage: 0
      };
    }
    
    acc[courseCode].total_classes++;
    acc[courseCode][record.status]++;
    
    // Calculate percentage (present + late count as attended)
    const attended = acc[courseCode].present + acc[courseCode].late;
    acc[courseCode].attendance_percentage = 
      Math.round((attended / acc[courseCode].total_classes) * 100);
    
    return acc;
  }, {});

  return NextResponse.json({ 
    summary: Object.values(summary || {})
  })
}

// POST - Mark attendance for a class
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { course_id, class_date, status } = await request.json()

    // Validation
    if (!course_id || !class_date || !status) {
      return NextResponse.json(
        { error: 'Course, date and status are required' },
        { status: 400 }
      )
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be present, absent, or late' },
        { status: 400 }
      )
    }

    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .upsert({
        user_id: user.id,
        course_id,
        class_date,
        status,
        marked_at: new Date().toISOString()
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
      message: 'Attendance marked successfully',
      attendance
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove attendance record
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('id')

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('id', attendanceId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Attendance record deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}