'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { RoleMenu } from '@/types'

export interface RoleMenuPermission {
  id?: string
  roleId: string
  menuId: string
  canRead: boolean
  canWrite: boolean
  canUpdate: boolean
  canDelete: boolean
  role?: {
    id: string
    name: string
  }
  menu?: {
    id: string
    name: string
    path: string
  }
}

export function useRoleMenus(roleId?: string) {
  return useQuery({
    queryKey: ['role-menus', roleId],
    queryFn: () => apiClient.get<RoleMenu[]>(`/role-menus${roleId ? `?roleId=${roleId}` : ''}`),
    enabled: !!roleId,
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: Omit<RoleMenuPermission, 'id' | 'role' | 'menu'>[] }) => {
      const response = await apiClient.put('/role-menus', { roleId, permissions })
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-menus'] })
      queryClient.invalidateQueries({ queryKey: ['role-menus', variables.roleId] })
    },
  })
}

export function useCreateRoleMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<RoleMenuPermission, 'id' | 'role' | 'menu'>) => {
      const response = await apiClient.post('/role-menus', data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menus'] })
    },
  })
}

export function useDeleteRoleMenu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/role-menus/${id}`)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-menus'] })
    },
  })
}
