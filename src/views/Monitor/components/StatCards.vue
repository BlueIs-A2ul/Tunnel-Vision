<script setup lang="ts">
import StatCard from './StatCard.vue'

defineProps<{
  stats: {
    totalVehicles: number
    busCount: number
    truckCount: number
    tankerCount: number
    onlineCameras: number
    todayWarnings: number
  }
}>()
</script>

<template>
  <div class="flex flex-wrap gap-[1%] mb-4">
    <StatCard :value="stats.totalVehicles" label="总车辆数" color="#ffff43" />
    <StatCard :value="stats.busCount" label="巴士" color="#25f3e6" />
    <StatCard :value="stats.truckCount" label="卡车" color="#4b8df8" />
    <StatCard :value="stats.tankerCount" label="油罐车" color="#ff4e4e" />
    <StatCard :value="stats.onlineCameras" label="在线摄像头" color="#ffff43" />
    <StatCard :value="stats.todayWarnings" label="今日预警" color="#ff4e4e" />
  </div>
</template>
