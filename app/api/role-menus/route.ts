import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/auth-middleware'

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const roleId = searchParams.get('roleId')

    const roleMenus = await prisma.roleMenu.findMany({
      where: roleId ? { roleId } : {},
      include: {
        role: true,
        menu: true
      }
    })

    return NextResponse.json(roleMenus)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch role menus' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { roleId, menuId, canRead, canWrite, canUpdate, canDelete } = await req.json()

    const roleMenu = await prisma.roleMenu.upsert({
      where: {
        roleId_menuId: {
          roleId,
          menuId
        }
      },
      create: {
        roleId,
        menuId,
        canRead: canRead || true,
        canWrite: canWrite || false,
        canUpdate: canUpdate || false,
        canDelete: canDelete || false
      },
      update: {
        canRead,
        canWrite,
        canUpdate,
        canDelete
      },
      include: {
        role: true,
        menu: true
      }
    })

    return NextResponse.json(roleMenu)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to assign menu to role' },
      { status: 500 }
    )
  }
})