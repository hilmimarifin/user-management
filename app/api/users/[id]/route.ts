import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const PUT = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { email, username, password, roleId } = await req.json()
    const { id } = params

    const updateData: any = {
      email,
      username,
      roleId
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true
      }
    })

    const { password: _, ...safeUser } = updatedUser

    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
})