/* ============================================
 * 车辆相关 API 接口
 * ============================================
 * getVehiclesWithImages  - 获取所有车辆及对应图片（聚合接口）
 * getAllVehicles         - 获取所有车辆通行记录
 * ============================================ */

import request from '@/utils/request'
import type { GetVehiclesWithImagesRes } from '@/types/vehicle'

export interface GetAllVehiclesRes {
  id: number
  vehicleUid: string
  plate: string
  type: string
  color: string
  firstSeenTime: Record<string, unknown>
  lastSeenTime: Record<string, unknown>
  status: string
}

/**
 * 获取所有车辆及对应图片（聚合接口）
 * GET /api/vehicle-images/with-images
 * @param date 可选日期筛选 YYYY-MM-DD
 * @returns
 */
export function getVehiclesWithImages(date?: string): Promise<GetVehiclesWithImagesRes> {
  const params = date ? { date } : {}
  return request.get('/api/vehicle-images/with-images', { params })
}

/**
 * 获取所有车辆通行记录
 * GET /api/vehicles
 */
export function getAllVehicles(): Promise<GetAllVehiclesRes[]> {
  return request.get('/api/vehicles')
}
