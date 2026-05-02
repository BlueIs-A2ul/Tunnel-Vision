export interface VehicleImage {
  imageUrl: string
}

export interface VehicleRecord {
  id: number
  vehicleUid: string
  type: string
  firstSeenTime: Record<string, unknown>
  lastSeenTime: Record<string, unknown>
  status: 'moving' | 'exited' | 'abnormal'
  images: VehicleImage[]
}

export interface GetVehiclesWithImagesRes {
  code: number
  msg: string
  data: VehicleRecord[]
}
