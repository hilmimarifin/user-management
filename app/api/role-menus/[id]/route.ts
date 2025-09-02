import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    await prisma.roleMenu.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Role menu assignment deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role menu assignment' },
      { status: 500 }
    )
  }
})