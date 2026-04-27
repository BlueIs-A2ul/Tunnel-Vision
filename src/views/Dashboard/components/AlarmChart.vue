<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(3, 8, 41, 0.9)',
      borderColor: '#034c6a',
      textStyle: { color: '#ffffff' },
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['超速', '疲劳驾驶', '偏离路线', '异常停车', '设备故障'],
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: { color: '#ffffff', rotate: 15 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#034c6a' } },
    },
    series: [
      {
        name: '报警次数',
        type: 'bar',
        data: [120, 85, 45, 30, 18],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff4e4e' },
            { offset: 1, color: '#ffff43' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  chartInstance?.dispose()
})

defineExpose({ resize: () => chartInstance?.resize() })
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-title">
      <i class="title_icon"></i>车辆报警统计
    </div>
    <div ref="chartRef" class="chart-content"></div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 280px;
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  box-sizing: border-box;
  position: relative;
  margin-top: 25px;
}

.chart-title {
  background-color: #034c6a;
  border-radius: 18px;
  position: absolute;
  height: 35px;
  width: 60%;
  top: -15px;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  left: 20%;
  line-height: 35px;
  text-align: center;
}

.title_icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  position: relative;
  top: 2px;
  margin-right: 5px;
  background: #ffffff no-repeat center;
  background-size: contain;
}

.chart-content {
  height: 250px;
  padding: 5px 10px;
  margin-top: 15px;
}
</style>