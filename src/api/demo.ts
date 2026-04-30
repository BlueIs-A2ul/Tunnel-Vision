/* ============================================
 * 演示控制相关 API 接口
 * ============================================
 * startDemo - 开始演示推送
 * stopDemo  - 停止演示推送
 * ============================================ */

import request from '@/utils/request'

export interface DemoResponse {
  code: number
  msg: string
  data: string
}

/**
 * 开始演示推送
 * POST /api/demo/start
 * @returns
 */
export function startDemo(): Promise<DemoResponse> {
  return request.post(`/api/demo/start`)
}

/**
 * 停止演示推送
 * POST /api/demo/stop
 * @returns
 */
export function stopDemo(): Promise<DemoResponse> {
  return request.post(`/api/demo/stop`)
}
