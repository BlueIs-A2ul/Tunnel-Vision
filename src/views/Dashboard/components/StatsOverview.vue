<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  stats: {
    totalVehicles: number  // 累计特殊车辆总数
    usedVehicles: number   // 当前特殊车辆总数
    totalDistance: number   // 隧道总长(km)
    avgDistance: number     // 正常运行监控总数
    totalDuration: string   // 高峰时段
    avgDuration: number     // 今日预警次数
  }
}>()
</script>

<template>
  <div class="w-full">
    <div class="w-35 h-9 mb-6 ml-[1%] pl-5">
      <div class="left w-35 h-9 leading-9 bg-[#04425f] mb-6 pl-5 rounded-sm shadow-[0px_3px_3px_#61d2f7]">
        <Icon icon="mdi:view-dashboard" class="w-4 h-4 inline-block relative mr-1.5 top-0.5 text-[#61d2f7]"></Icon>
        <span class="text-[#25f3e6]">总体概况</span>
      </div>
    </div>

    <div class="con_div">
      <div class="con_div_text flex">
        <div class="con_div_text01">
          <Icon icon="mdi:car" class="info_icon" style="background: linear-gradient(135deg, #4b8df8 0%, #25f3e6 100%);">
          </Icon>
          <div class="text01_div">
            <p>累计特殊车辆总数</p>
            <p>{{ stats.totalVehicles.toLocaleString() }}</p>
          </div>
        </div>
        <div class="con_div_text01">
          <Icon icon="system-uicons:pull-up" class="info_icon"
            style="background: linear-gradient(135deg, #25f3e6 0%, #4b8df8 100%);"></Icon>
          <div class="text01_div">
            <p>当前特殊车辆总数</p>
            <p>{{ stats.usedVehicles.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      <div class="con_div_text flex">
        <div class="con_div_text01">
          <Icon icon="mdi:map-marker-distance" class="info_icon"
            style="background: linear-gradient(135deg, #ffff43 0%, #ff4e4e 100%);"></Icon>
          <div class="text01_div">
            <p>隧道总长(km)</p>
            <p class="sky">{{ stats.totalDistance.toLocaleString() }}</p>
          </div>
        </div>
        <div class="con_div_text01">
          <Icon icon="mdi:monitor" class="info_icon"
            style="background: linear-gradient(135deg, #ff4e4e 0%, #ffff43 100%);"></Icon>
          <div class="text01_div">
            <p>正常运行监控总数</p>
            <p class="sky">{{ stats.avgDistance.toLocaleString() }}</p>
          </div>
        </div>
      </div>
      <div class="con_div_text flex">
        <div class="con_div_text01">
          <Icon icon="mdi:clock-outline" class="info_icon"
            style="background: linear-gradient(135deg, #61d2f7 0%, #4b8df8 100%);"></Icon>
          <div class="text01_div">
            <p>高峰时段</p>
            <p class="org">{{ stats.totalDuration.toLocaleString() }}</p>
          </div>
        </div>
        <div class="con_div_text01">
          <Icon icon="mdi:bell-alert" class="info_icon"
            style="background: linear-gradient(135deg, #4b8df8 0%, #61d2f7 100%);"></Icon>
          <div class="text01_div">
            <p>今日预警次数</p>
            <p class="org">{{ stats.avgDuration.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.con_div {
  height: 110px;
  width: 98%;
  margin-left: 1%;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
}

.con_div_text {
  height: 100%;
  background-color: #034c6a;
  width: 32%;
}

.con_div_text01 {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.text01_div {
  margin-top: 15px;
  margin-left: 5%;
  text-align: center;
}

.text01_div p {
  line-height: 35px;
}

.text01_div p:nth-child(1) {
  font-size: 13px;
  color: #ffffff;
}

.text01_div p:nth-child(2) {
  font-size: 28px;
  color: #ffff43;
  font-weight: 600;
}

.sky {
  color: #25f3e6 !important;
}

.org {
  color: #ff4e4e !important;
}

.info_icon {
  width: 40px;
  height: 40px;
  margin-left: 5%;
  border-radius: 50%;
  display: inline-block;
}
</style>
