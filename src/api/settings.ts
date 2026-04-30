/* ============================================
 * 系统参数设置相关 API 接口
 * ============================================
 * getSystemSettings    - 获取系统参数
 * updateSystemSettings - 更新系统参数
 * ============================================ */

import request from '@/utils/request'
import type { SystemSettings } from '@/types/settings'

export interface GetSystemSettingsResponse {
  code: number
  msg: string
  data: SystemSettings
}

export interface UpdateSystemSettingsResponse {
  code: number
  msg: string
}

/**
 * 获取系统参数
 * @returns
 */
export function getSystemSettings(): Promise<GetSystemSettingsResponse> {
  return request.get(`/system/settings`)
}

/**
 * 更新系统参数
 * @param {object} params 系统参数
 * @returns
 */
export function updateSystemSettings(params: SystemSettings): Promise<UpdateSystemSettingsResponse> {
  return request.put(`/system/settings`, params)
}
