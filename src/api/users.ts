/* ============================================
 * 用户管理相关 API 接口
 * ============================================
 * getUsers    - 获取用户列表
 * createUser  - 添加用户
 * updateUser  - 更新用户信息
 * deleteUser  - 删除用户
 * ============================================ */

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

export interface GetUsersResponse {
  code: number
  msg: string
  data: User[]
}

export interface CreateUserResponse {
  code: number
  msg: string
}

export interface UpdateUserResponse {
  code: number
  msg: string
}

export interface DeleteUserResponse {
  code: number
  msg: string
}

/**
 * 获取用户列表
 * @returns
 */
export function getUsers(): Promise<GetUsersResponse> {
  return request.get(`/user/list`)
}

/**
 * 添加用户
 * @param {object} params 用户信息
 * @param {string} params.username 用户名
 * @param {string} params.password 密码
 * @param {number} params.isAdmin 是否管理员(1-是,0-否)
 * @returns
 */
export function createUser(params: CreateUserParams): Promise<CreateUserResponse> {
  return request.post(`/user/add`, params)
}

/**
 * 更新用户信息
 * @param {number} id 用户ID
 * @param {object} params 更新参数
 * @returns
 */
export function updateUser(id: number, params: UpdateUserParams): Promise<UpdateUserResponse> {
  return request.put(`/user/updateRole`, {
    id,
    username: params.username,
    password: params.password || '',
    isAdmin: params.isAdmin ?? 0,
  })
}

/**
 * 删除用户
 * @param {number} id 用户ID
 * @returns
 */
export function deleteUser(id: number): Promise<DeleteUserResponse> {
  return request.delete(`/user/delete/${id}`)
}
