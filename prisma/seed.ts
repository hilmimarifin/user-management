import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full system access'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with limited access'
    }
  })

  // Create menus
  const dashboardMenu = await prisma.menu.upsert({
    where: { path: '/dashboard' },
    update: {},
    create: {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      orderIndex: 1
    }
  })

  const usersMenu = await prisma.menu.upsert({
    where: { path: '/users' },
    update: {},
    create: {
      name: 'Users',
      path: '/users',
      icon: 'Users',
      orderIndex: 2
    }
  })

  const rolesMenu = await prisma.menu.upsert({
    where: { path: '/roles' },
    update: {},
    create: {
      name: 'Roles',
      path: '/roles',
      icon: 'UserCheck',
      orderIndex: 3
    }
  })

  const menusMenu = await prisma.menu.upsert({
    where: { path: '/menus' },
    update: {},
    create: {
      name: 'Menus',
      path: '/menus',
      icon: 'MenuIcon',
      orderIndex: 4
    }
  })

  // Create role-menu assignments for admin (full access)
  await prisma.roleMenu.upsert({
    where: {
      roleId_menuId: {
        roleId: adminRole.id,
        menuId: dashboardMenu.id
      }
    },
    update: {},
    create: {
      roleId: adminRole.id,
      menuId: dashboardMenu.id,
      canRead: true,
      canWrite: true,
      canUpdate: true,
      canDelete: true
    }
  })

  await prisma.roleMenu.upsert({
    where: {
      roleId_menuId: {
        roleId: adminRole.id,
        menuId: usersMenu.id
      }
    },
    update: {},
    create: {
      roleId: adminRole.id,
      menuId: usersMenu.id,
      canRead: true,
      canWrite: true,
      canUpdate: true,
      canDelete: true
    }
  })

  await prisma.roleMenu.upsert({
    where: {
      roleId_menuId: {
        roleId: adminRole.id,
        menuId: rolesMenu.id
      }
    },
    update: {},
    create: {
      roleId: adminRole.id,
      menuId: rolesMenu.id,
      canRead: true,
      canWrite: true,
      canUpdate: true,
      canDelete: true
    }
  })

  await prisma.roleMenu.upsert({
    where: {
      roleId_menuId: {
        roleId: adminRole.id,
        menuId: menusMenu.id
      }
    },
    update: {},
    create: {
      roleId: adminRole.id,
      menuId: menusMenu.id,
      canRead: true,
      canWrite: true,
      canUpdate: true,
      canDelete: true
    }
  })

  // Create role-menu assignments for user (limited access)
  await prisma.roleMenu.upsert({
    where: {
      roleId_menuId: {
        roleId: userRole.id,
        menuId: dashboardMenu.id
      }
    },
    update: {},
    create: {
      roleId: userRole.id,
      menuId: dashboardMenu.id,
      canRead: true,
      canWrite: false,
      canUpdate: false,
      canDelete: false
    }
  })

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      roleId: adminRole.id
    }
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      roleId: userRole.id
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('🔑 Admin credentials: admin@example.com / admin123')
  console.log('👤 User credentials: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })