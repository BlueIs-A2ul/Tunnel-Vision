/* ============================================
 * 实时数据相关 API 接口
 * ============================================
 * getSummary        - 获取车辆统计汇总
 * getRealtimeStats  - 获取实时车辆统计数据
 * ============================================ */

import request from '@/utils/request'
import type { GetRealtimeStatsResponse, GetSummaryResponse } from '@/types/realtime'

/**
 * 获取车辆统计汇总（总数、巴士数、卡车数、罐车数）
 * GET /api/realtime/summary
 * @returns
 */
export function getSummary(): Promise<GetSummaryResponse> {
  return request.get(`/api/realtime/summary`)
}

/**
 * 获取实时车辆统计数据（统计数字 + 当前经过车辆列表）
 * GET /api/realtime/stats
 * @returns
 */
export function getRealtimeStats(): Promise<GetRealtimeStatsResponse> {
  return request.get(`/api/realtime/stats`)
}
