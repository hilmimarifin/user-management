import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const safeUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json(safeUsers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { email, username, password, roleId } = await req.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        roleId
      },
      include: {
        role: true
      }
    })

    const { password: _, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
})