/* ============================================
 * 用户认证相关 API 接口
 * ============================================
 * login         - 用户登录
 * register      - 用户注册
 * logout        - 用户登出
 * getCurrentUser - 获取当前用户信息
 * ============================================ */

import request from '@/utils/request'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  User,
} from '@/types/user'

/**
 * 用户登录
 * @param {object} params 登录请求
 * @param {string} params.username 用户名
 * @param {string} params.password 密码
 * @returns
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return request.post(`/auth/login`, params)
}

/**
 * 用户注册
 * @param {object} params 注册请求
 * @param {string} params.username 用户名
 * @param {string} params.password 密码
 * @param {number} params.isAdmin 是否管理员(1-是,0-否)
 * @returns
 */
export function register(params: RegisterParams): Promise<RegisterResponse> {
  return request.post(`/user/register`, params)
}

/**
 * 用户登出
 * @returns
 */
export function logout(): Promise<void> {
  return request.post(`/auth/logout`)
}

/**
 * 获取当前用户信息
 * @returns
 */
export function getCurrentUser(): Promise<User | null> {
  return request.get(`/auth/me`)
}
