/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { verifyToken, requireAuth } from '@/lib/auth'

// GET - Fetch all assignments for user
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course_id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const upcomingOnly = searchParams.get('upcoming_only')

    let query = supabaseAdmin
      .from('assignments')
      .select(`
        *,
        courses (course_code, course_name, color)
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (courseId) {
      query = query.eq('course_id', courseId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (upcomingOnly === 'true') {
      query = query.gte('due_date', new Date().toISOString())
    }

    const { data: assignments, error } = await query
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

    // Validate due date is in the future
    const dueDate = new Date(due_date)
    if (dueDate < new Date()) {
      return NextResponse.json(
        { error: 'Due date must be in the future' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be low, medium, or high' },
        { status: 400 }
      )
    }

    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        user_id: user.id,
        course_id,
        title: title.trim(),
        description: description?.trim() || '',
        due_date: dueDate.toISOString(),
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

// PATCH - Update assignment (partial update)
export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
    const { id, title, description, due_date, priority, status, progress } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    }

    // Validate and add fields to update
    if (title !== undefined) updates.title = title.trim()
    if (description !== undefined) updates.description = description?.trim() || ''
    if (due_date !== undefined) {
      const dueDate = new Date(due_date)
      if (dueDate < new Date()) {
        return NextResponse.json(
          { error: 'Due date must be in the future' },
          { status: 400 }
        )
      }
      updates.due_date = dueDate.toISOString()
    }
    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Priority must be low, medium, or high' },
          { status: 400 }
        )
      }
      updates.priority = priority
    }
    if (status !== undefined) {
      const validStatuses = ['pending', 'in-progress', 'completed', 'overdue']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status must be pending, in-progress, completed, or overdue' },
          { status: 400 }
        )
      }
      updates.status = status
    }
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        return NextResponse.json(
          { error: 'Progress must be between 0 and 100' },
          { status: 400 }
        )
      }
      updates.progress = progress
      // Auto-update status based on progress
      if (progress === 100) {
        updates.status = 'completed'
      } else if (progress > 0) {
        updates.status = 'in-progress'
      }
    }

    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .update(updates)
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

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Assignment updated successfully',
      assignment
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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