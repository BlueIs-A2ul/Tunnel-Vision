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

const vehicleRecords = ref([
  { rank: 1, plate: '京A12345', distance: 134.2 },
  { rank: 2, plate: '京B23456', distance: 128.5 },
  { rank: 3, plate: '京C34567', distance: 122.3 },
  { rank: 4, plate: '京D45678', distance: 118.7 },
  { rank: 5, plate: '京E56789', distance: 115.2 },
])

const tripCountRecords = ref([
  { rank: 1, plate: '京A12345', count: 134 },
  { rank: 2, plate: '京F67890', count: 128 },
  { rank: 3, plate: '京G78901', count: 122 },
  { rank: 4, plate: '京H89012', count: 118 },
  { rank: 5, plate: '京J90123', count: 115 },
])

const speedRecords = ref([
  { rank: 1, plate: '京A12345', speed: 134.2 },
  { rank: 2, plate: '京K01234', speed: 128.5 },
  { rank: 3, plate: '京L12345', speed: 122.3 },
  { rank: 4, plate: '京M23456', speed: 118.7 },
  { rank: 5, plate: '京N34567', speed: 115.2 },
])

const durationRecords = ref([
  { rank: 1, plate: '京A12345', duration: 134.2 },
  { rank: 2, plate: '京P45678', duration: 128.5 },
  { rank: 3, plate: '京Q56789', duration: 122.3 },
  { rank: 4, plate: '京R67890', duration: 118.7 },
  { rank: 5, plate: '京S78901', duration: 115.2 },
])

const tableColumns = [
  { key: 'rank', label: '排名' },
  { key: 'plate', label: '车牌号' },
]

const handleNavUpdate = (value: string) => {
  activeNav.value = value
}
</script>

<template>
  <div class="dashboard-container">
    <NavHeader :active-nav="activeNav" @update:active-nav="handleNavUpdate" />

    <div class="con left">
      <!-- 总体概况 -->
      <StatsOverview :stats="stats" />

      <div class="div_any">
        <div class="left div_any01">
          <!-- 车辆类型统计 -->
          <TypeChart />
          <StatusChart />
        </div>
        <div class="div_any02 left">
          <MapPlaceholder />
        </div>
        <div class="right div_any01">
          <!-- 日流量趋势 -->
          <TrendChart />
          <!-- 车辆时段分布 -->
          <AlarmChart />
        </div>
      </div>

      <div class="div_table">
        <div class="left div_table_box">
          <RankingTable title="行驶里程排名前5位" :columns="[...tableColumns, { key: 'distance', label: '里程数(km)' }]"
            :data="vehicleRecords" />
        </div>
        <div class="left div_table_box">
          <RankingTable title="行驶次数车辆前5位" :columns="[...tableColumns, { key: 'count', label: '次数(次)' }]"
            :data="tripCountRecords" />
        </div>
        <div class="left div_table_box">
          <RankingTable title="行驶最高时速前5位" :columns="[...tableColumns, { key: 'speed', label: '时速(km)' }]"
            :data="speedRecords" />
        </div>
        <div class="left div_table_box">
          <RankingTable title="行驶时长排名前5位" :columns="[...tableColumns, { key: 'duration', label: '时长(s)' }]"
            :data="durationRecords" />
        </div>
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
}

.div_any02 {
  width: 48%;
}

.div_table {
  width: 98%;
  margin-left: 1%;
  margin-bottom: 25px;
  height: 280px;
  display: flex;
  justify-content: space-between;
}

.div_table_box {
  width: 23%;
}

.left {
  float: left;
}

.right {
  float: right;
}
</style>