import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './jwt'

export function withAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const user = verifyAccessToken(token)
      return handler(req, user, context)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }
}

export function withAdminAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: any, context?: any) => {
    // Check if user is admin (you'll need to fetch role from DB)
    const { prisma } = await import('./prisma')
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true }
    })

    if (userWithRole?.role.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return handler(req, user, context)
  })
}