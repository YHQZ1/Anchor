import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface DecodedToken {
  id: string
  email: string
  username?: string
  iat?: number
  exp?: number
}

export function verifyToken(request: NextRequest): DecodedToken | null {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null
    
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    return decoded
  } catch (error) {
    return null
  }
}

// Helper for API routes that require authentication
export function requireAuth(request: NextRequest): DecodedToken {
  const user = verifyToken(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}