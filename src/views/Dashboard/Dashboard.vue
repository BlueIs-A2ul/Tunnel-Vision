<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatsOverview from '@/views/Dashboard/components/StatsOverview.vue'
import TypeChart from '@/views/Dashboard/components/TypeChart.vue'
import StatusChart from '@/views/Dashboard/components/StatusChart.vue'
import TrendChart from '@/views/Dashboard/components/TrendChart.vue'
import AlarmChart from '@/views/Dashboard/components/AlarmChart.vue'
import RankingTable from '@/views/Dashboard/components/RankingTable.vue'
import MapPlaceholder from '@/views/Dashboard/components/MapPlaceholder.vue'
import { Icon } from '@iconify/vue'
import { getRealtimeVehicleCards } from '@/api/vehicles'

const stats = ref({
  totalVehicles: 67,
  usedVehicles: 5,
  totalDistance: 25.6,
  avgDistance: 5,
  totalDuration: '7:00-8:00',
  avgDuration: 1,
})

interface VehicleRecord {
  ID: string
  type: string
  timeStamp: string
  cameraID: string
  count: number
  photos?: string[]
  isDangerous?: boolean
  speed?: number
}

const vehicleRecords = ref<VehicleRecord[]>([])

onMounted(async () => {
  try {
    const res = await getRealtimeVehicleCards()
    console.log('获取车辆通行记录成功:', res)
    if (res.code === 200) {
      vehicleRecords.value = res.data.map((item) => ({
        ID: item.vehicleUid,
        type: item.vehicleType,
        timeStamp: item.captureTime,
        cameraID: item.cameraId,
        count: item.captureCount,
        photos: [],
        isDangerous: item.status === '异常',
        speed: undefined,
      }))
    }
  } catch (err) {
    console.error('获取车辆通行记录失败:', err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#081832]">
    <div class="w-[98%] mx-auto pt-5 pb-5 flex flex-col">
      <div class="mb-5">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg gap-2">
          <Icon icon="uis:chart" :size="20" color="#4b8df8"></Icon>
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

      <div class="w-full mb-6.25 flex justify-between">
        <RankingTable title="车辆通行记录" :data="vehicleRecords" />
      </div>
    </div>
  </div>
</template>
