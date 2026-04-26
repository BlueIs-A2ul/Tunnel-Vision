<script setup lang="ts">
import { ref } from 'vue'
import NavHeader from '@/components/dashboard/NavHeader.vue'
import StatsOverview from '@/components/dashboard/StatsOverview.vue'
import TypeChart from '@/components/dashboard/TypeChart.vue'
import StatusChart from '@/components/dashboard/StatusChart.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import AlarmChart from '@/components/dashboard/AlarmChart.vue'
import RankingTable from '@/components/dashboard/RankingTable.vue'
import MapPlaceholder from '@/components/dashboard/MapPlaceholder.vue'

const activeNav = ref('data')

const stats = ref({
  totalVehicles: 12356,   // 累计特殊车辆总数
  usedVehicles: 856,      // 当前特殊车辆总数
  totalDistance: 256.8,   // 隧道总长(km)
  avgDistance: 128,       // 正常运行监控总数
  totalDuration: 8,        // 高峰时段(小时数)
  avgDuration: 12,         // 今日预警次数
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

const handleNavUpdate = (value: string) => {
  activeNav.value = value
}
</script>

<template>
  <div class="dashboard-container">
    <NavHeader :active-nav="activeNav" @update:active-nav="handleNavUpdate" />

    <div class="con">
      <!-- 总体概况 -->
      <StatsOverview :stats="stats" />

      <div class="div_any">
        <div class="div_any01">
          <!-- 车辆类型统计 -->
          <TypeChart />
          <StatusChart />
        </div>
        <div class="div_any02">
          <MapPlaceholder />
        </div>
        <div class="div_any01">
          <!-- 日流量趋势 -->
          <TrendChart />
          <!-- 车辆时段分布 -->
          <AlarmChart />
        </div>
      </div>

      <div class="div_table">
        <RankingTable title="车辆通行记录" :data="vehicleRecords" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #081832;
}

.con {
  width: 100%;
  background-color: #081832;
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.div_any {
  width: 98%;
  margin-left: 1%;
  margin-bottom: 25px;
  height: 610px;
  display: flex;
  justify-content: space-between;
}

.div_any01 {
  width: 23%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.div_any02 {
  width: 48%;
}

.div_table {
  width: 98%;
  margin-left: 1%;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
}

.div_table_box {
  width: 23%;
}
</style>
