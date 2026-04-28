<script setup lang="ts">
import { ref } from 'vue'
import StatsOverview from '@/views/Dashboard/components/StatsOverview.vue'
import TypeChart from '@/views/Dashboard/components/TypeChart.vue'
import StatusChart from '@/views/Dashboard/components/StatusChart.vue'
import TrendChart from '@/views/Dashboard/components/TrendChart.vue'
import AlarmChart from '@/views/Dashboard/components/AlarmChart.vue'
import RankingTable from '@/views/Dashboard/components/RankingTable.vue'
import MapPlaceholder from '@/views/Dashboard/components/MapPlaceholder.vue'

const stats = ref({
  totalVehicles: 12356,
  usedVehicles: 856,
  totalDistance: 256.8,
  avgDistance: 128,
  totalDuration: '7:00-8:00',
  avgDuration: 12,
})

interface VehicleRecord {
  ID: string
  type: string
  timeStamp: string
  cameraID: string
  count: number
  photos: string[]
  isDangerous?: boolean
  speed?: number
}

const vehicleRecords = ref<VehicleRecord[]>([
  { ID: 'ID_001', type: '小车', timeStamp: '2024-01-15 10:30', cameraID: 'C01', count: 3, photos: [], isDangerous: false },
  { ID: 'ID_002', type: '卡车', timeStamp: '2024-01-15 10:25', cameraID: 'C01', count: 2, photos: [], isDangerous: false },
  { ID: 'ID_003', type: '巴士', timeStamp: '2024-01-15 10:20', cameraID: 'C02', count: 5, photos: [], isDangerous: true, speed: 85 },
  { ID: 'ID_004', type: '小车', timeStamp: '2024-01-15 10:15', cameraID: 'C02', count: 2, photos: [], isDangerous: false },
  { ID: 'ID_005', type: '卡车', timeStamp: '2024-01-15 10:10', cameraID: 'C03', count: 4, photos: [], isDangerous: false },
])
</script>

<template>
  <div class="min-h-screen bg-[#081832]">
    <div class="w-[98%] mx-auto pt-5 pb-5 flex flex-col">
      <div class="mb-5">
        <div class="inline-block bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg">
          <i class="inline-block w-[18px] h-[18px] relative top-0.5 mr-2 bg-white bg-center bg-no-repeat bg-contain"></i>
          数据总览
        </div>
      </div>
      <!-- 总体概况 -->
      <StatsOverview :stats="stats" />

      <div class="w-full mb-[25px] h-[610px] flex justify-between">
        <div class="w-[23%] flex flex-col gap-5">
          <!-- 车辆类型统计 -->
          <TypeChart />
          <!-- 摄像头下车辆数 -->
          <StatusChart />
        </div>
        <div class="w-[48%]">
          <MapPlaceholder />
        </div>
        <div class="w-[23%] flex flex-col gap-5">
          <!-- 日流量趋势 -->
          <TrendChart />
          <!-- 车辆时段分布 -->
          <AlarmChart />
        </div>
      </div>

      <div class="w-full mb-[25px] flex justify-between">
        <RankingTable title="车辆通行记录" :data="vehicleRecords" />
      </div>
    </div>
  </div>
</template>
