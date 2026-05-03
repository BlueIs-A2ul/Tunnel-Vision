/* ============================================
 * 系统参数设置相关 API 接口
 * ============================================
 * getSystemConfig    - 获取系统配置
 * saveSystemConfig  - 保存系统配置
 * ============================================ */

import request from '@/utils/request'
import type { SystemSettings } from '@/types/settings'

export interface GetSystemConfigResponse {
  code: number
  msg: string
  data: SystemSettings
}

export interface SaveSystemConfigResponse {
  code: number
  msg: string
  data: string
}

/**
 * 获取系统配置
 * @returns
 */
export function getSystemConfig(): Promise<GetSystemConfigResponse> {
  return request.get(`/api/system/config`)
}

/**
 * 保存系统配置
 * @param {object} params 系统配置参数
 * @returns
 */
export function saveSystemConfig(params: SystemSettings): Promise<SaveSystemConfigResponse> {
  return request.post(`/api/system/config/save`, params)
}
