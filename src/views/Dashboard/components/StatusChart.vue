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
      right: '10%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['C_01', 'C_02', 'C_03', 'C_04', 'C_05', 'C_06'],
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: { color: '#ffffff' },
    },
    yAxis: {
      type: 'value',
      name: '车辆数',
      nameTextStyle: { color: '#ffffff' },
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#034c6a' } },
    },
    series: [
      {
        name: '车辆数',
        type: 'bar',
        data: [125, 89, 156, 203, 78, 142],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4b8df8' },
            { offset: 1, color: '#25f3e6' },
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
      <i class="title_icon"></i>摄像头下车辆数
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