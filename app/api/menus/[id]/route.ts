import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const PUT = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { name, path, icon, parentId, orderIndex } = await req.json()
    const { id } = params

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        path,
        icon,
        parentId,
        orderIndex
      }
    })

    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    await prisma.menu.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Menu deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
})