'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles'
import { RoleForm } from '@/components/forms/role-form'
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

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: roles = [], isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  useEffect(() => {
    if (user?.role.name !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleCreateRole = async (data: any) => {
    try {
      await createRole.mutateAsync(data)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to create role:', error)
    }
  }

  const handleUpdateRole = async (data: any) => {
    try {
      await updateRole.mutateAsync({ id: selectedRole.id, ...data })
      setDialogOpen(false)
      setSelectedRole(null)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleDeleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete role:', error)
      }
    }
  }

  const openEditDialog = (role: any) => {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedRole(null)
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
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Create and manage system roles and permissions.
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <RoleForm
              role={selectedRole}
              onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
              isLoading={createRole.isPending || updateRole.isPending}
            />
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading roles...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role: any) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{role.name}</Badge>
                      </TableCell>
                      <TableCell>{role.description || 'No description'}</TableCell>
                      <TableCell>{role._count.users}</TableCell>
                      <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-destructive"
                              disabled={role._count.users > 0}
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