import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { withAuth } from '@/lib/apiHandler'
import redis from '@/lib/redis'
import { withCache } from '@/utils/cache'

export async function GET(request: NextRequest) {
  return withAuth(async (request, user) => {
    const cacheKey = `profile:${user.id}`

    const { data: profile, cached } = await withCache(cacheKey, async () => {
      const supabaseAdmin = getSupabaseAdmin()
      
      const { data: profileData, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw new Error('Profile not found')
      }

      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('email, username')
        .eq('id', user.id)
        .single()

      return {
        ...profileData,
        email: userData?.email,
        username: userData?.username
      }
    })

    return NextResponse.json({ profile, cached })
  }, request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin()
    
    const { 
      full_name, 
      student_id, 
      college_name, 
      department, 
      current_semester, 
      expected_graduation,
      min_attendance_percentage,
      enable_attendance_warnings,
      onboarding_completed,
      avatar_url 
    } = await request.json()

    if (!college_name || !department) {
      return NextResponse.json({ error: 'College name and department are required' }, { status: 400 })
    }

    if (current_semester && (current_semester < 1 || current_semester > 12)) {
      return NextResponse.json({ error: 'Current semester must be between 1 and 12' }, { status: 400 })
    }

    if (min_attendance_percentage && (min_attendance_percentage < 50 || min_attendance_percentage > 100)) {
      return NextResponse.json({ error: 'Minimum attendance percentage must be between 50 and 100' }, { status: 400 })
    }

    await redis.del(`profile:${user.id}`)

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
        min_attendance_percentage: min_attendance_percentage || 75,
        enable_attendance_warnings: enable_attendance_warnings !== false,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
        onboarding_completed: onboarding_completed !== false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'Profile saved successfully', profile })
  }, request)
}

export async function PATCH(request: NextRequest) {
  return withAuth(async (request, user) => {
    const supabaseAdmin = getSupabaseAdmin()
    
    const updates = await request.json()
    delete updates.id

    if (updates.min_attendance_percentage && 
        (updates.min_attendance_percentage < 50 || updates.min_attendance_percentage > 100)) {
      return NextResponse.json({ error: 'Minimum attendance percentage must be between 50 and 100' }, { status: 400 })
    }

    await redis.del(`profile:${user.id}`)

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'Profile updated successfully', profile })
  }, request)
}