/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { withAuth } from '@/lib/apiHandler'
import redis from '@/lib/redis'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const targetUserId = resolvedParams.id
  
  return withAuth(async (request, user) => {
    if (user.id !== targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    try {
      const { data: timetableUploads } = await supabaseAdmin
        .from('timetable_uploads')
        .select('file_url')
        .eq('user_id', targetUserId)

      if (timetableUploads?.length) {
        const filesToDelete = timetableUploads
          .map(upload => upload.file_url.split('/timetables/').pop())
          .filter((path): path is string => !!path)

        if (filesToDelete.length) {
          await supabaseAdmin.storage.from('timetables').remove(filesToDelete)
        }
      }

      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', targetUserId)

      if (error) throw error

      await redis.del(`profile:${targetUserId}`)

      return NextResponse.json({ 
        message: 'Account deleted successfully' 
      })

    } catch (error: any) {
      console.error('User deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
  }, request)
}