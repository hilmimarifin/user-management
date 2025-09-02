'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useMenus, useCreateMenu, useUpdateMenu, useDeleteMenu } from '@/hooks/use-menus'
import { MenuForm } from '@/components/forms/menu-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Edit, Trash } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MenusPage() {
  const [selectedMenu, setSelectedMenu] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: menus = [], isLoading } = useMenus()
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const deleteMenu = useDeleteMenu()

  useEffect(() => {
    if (user?.role.name !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleCreateMenu = async (data: any) => {
    try {
      await createMenu.mutateAsync(data)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create menu:', error)
    }
  }

  const handleUpdateMenu = async (data: any) => {
    try {
      await updateMenu.mutateAsync({ id: selectedMenu.id, ...data })
      setDialogOpen(false)
      setSelectedMenu(null)
    } catch (error) {
      console.error('Failed to update menu:', error)
    }
  }

  const handleDeleteMenu = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      try {
        await deleteMenu.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete menu:', error)
      }
    }
  }

  const openEditDialog = (menu: any) => {
    setSelectedMenu(menu)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedMenu(null)
    setDialogOpen(true)
  }

  if (user?.role.name !== 'admin') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground">
              Manage navigation menus and their hierarchy.
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Menu
              </Button>
            </DialogTrigger>
            <MenuForm
              menu={selectedMenu}
              onSubmit={selectedMenu ? handleUpdateMenu : handleCreateMenu}
              isLoading={createMenu.isPending || updateMenu.isPending}
            />
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading menus...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu: any) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{menu.path}</Badge>
                      </TableCell>
                      <TableCell>{menu.icon || 'None'}</TableCell>
                      <TableCell>{menu.parent?.name || 'Root'}</TableCell>
                      <TableCell>{menu.orderIndex}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(menu)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}