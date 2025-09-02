import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const PUT = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { name, description } = await req.json()
    const { id } = params

    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Check if role has users
    const roleWithUsers = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    })

    if (roleWithUsers?._count.users && roleWithUsers._count.users > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      )
    }

    await prisma.role.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
})