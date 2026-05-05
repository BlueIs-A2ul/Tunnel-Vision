/* ============================================
 * 实时数据相关 API 接口
 * ============================================
 * startMonitoring - 启动实时监测
 * ============================================ */

import request from '@/utils/request'

/**
 * 启动实时监测
 * POST /api/realtime/start
 */
export function startMonitoring(): Promise<{ code: number; msg: string }> {
  return request.post(`/api/realtime/start`)
}