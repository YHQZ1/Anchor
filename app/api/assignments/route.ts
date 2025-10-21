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

// GET - Fetch all assignments for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assignments, error } = await supabaseAdmin
      .from('assignments')
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new assignment
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { course_id, title, description, due_date, priority } = await request.json()

    // Validation
    if (!course_id || !title || !due_date) {
      return NextResponse.json(
        { error: 'Course, title and due date are required' },
        { status: 400 }
      )
    }

    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        user_id: user.id,
        course_id,
        title,
        description: description || '',
        due_date,
        priority: priority || 'medium',
        status: 'pending',
        progress: 0
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
      message: 'Assignment added successfully',
      assignment
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update assignment
export async function PUT(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, title, description, due_date, priority, status, progress } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (due_date !== undefined) updateData.due_date = due_date
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (progress !== undefined) updateData.progress = progress

    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Assignment updated successfully',
      assignment
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove assignment
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('assignments')
      .delete()
      .eq('id', assignmentId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}