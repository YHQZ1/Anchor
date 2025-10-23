/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from './auth'

type Handler = (request: NextRequest, user: any) => Promise<NextResponse>

export async function withAuth(handler: Handler, request: NextRequest) {
  try {
    const user = requireAuth(request)
    return await handler(request, user)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}