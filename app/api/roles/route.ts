import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(roles)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { name, description } = await req.json()

    const role = await prisma.role.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
})