import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAdminAuth, withAuth } from '@/lib/auth-middleware'

export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    const { searchParams } = new URL(req.url)
    const forUser = searchParams.get('forUser') === 'true'

    if (forUser) {
      // Get menus for the current user based on their role
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          role: {
            include: {
              roleMenus: {
                include: {
                  menu: true
                },
                where: {
                  canRead: true
                }
              }
            }
          }
        }
      })

      const userMenus = userWithRole?.role.roleMenus.map(rm => rm.menu) || []
      return NextResponse.json(userMenus)
    }

    // Get all menus (admin only)
    const adminUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { role: true }
    })

    if (adminUser?.role.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const menus = await prisma.menu.findMany({
      include: {
        children: true,
        parent: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    })

    return NextResponse.json(menus)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { name, path, icon, parentId, orderIndex } = await req.json()

    const menu = await prisma.menu.create({
      data: {
        name,
        path,
        icon,
        parentId,
        orderIndex: orderIndex || 0
      }
    })

    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
})