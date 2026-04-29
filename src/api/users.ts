import request from '@/utils/request'
import type { User } from '@/types/user'

export interface CreateUserParams {
  username: string
  password: string
  isAdmin: number
}

export interface UpdateUserParams {
  username?: string
  password?: string
  isAdmin?: number
}

export async function getUsers(): Promise<User[]> {
  const res = await request.get<any, { code: number; msg: string; data: User[] }>('/user/list')
  if (res.code !== 1) throw new Error(res.msg || '获取用户列表失败')
  return res.data
}

export async function createUser(params: CreateUserParams): Promise<void> {
  const res = await request.post<any, { code: number; msg: string }>('/user/add', params)
  if (res.code !== 1) throw new Error(res.msg || '添加用户失败')
}

export async function updateUser(id: number, params: UpdateUserParams): Promise<void> {
  const res = await request.put<any, { code: number; msg: string }>('/user/updateRole', {
    id,
    username: params.username,
    password: params.password || '',
    isAdmin: params.isAdmin ?? 0,
  })
  if (res.code !== 1) throw new Error(res.msg || '更新用户失败')
}

export async function deleteUser(id: number): Promise<void> {
  const res = await request.delete<any, { code: number; msg: string }>(`/user/delete/${id}`)
  if (res.code !== 1) throw new Error(res.msg || '删除用户失败')
}
