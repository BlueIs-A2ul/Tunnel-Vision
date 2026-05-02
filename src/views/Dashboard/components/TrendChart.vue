<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const handleResize = () => chartInstance?.resize()

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  // 横坐标：全天24小时，每3小时一个区间，共8个区间
  const xAxisData = ['0-3时', '3-6时', '6-9时', '9-12时', '12-15时', '15-18时', '18-21时', '21-24时']
  // 模拟日流量数据，每3小时一个数据点
  const flowData = [245, 128, 389, 456, 267, 389, 356, 278]

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
      boundaryGap: false,
      data: xAxisData,
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: {
        color: '#ffffff',
        interval: 1,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#034c6a' } },
      axisLabel: { color: '#ffffff' },
      splitLine: { lineStyle: { color: '#034c6a' } },
    },
    series: [
      {
        name: '日流量',
        type: 'line',
        smooth: true,
        data: flowData,
        lineStyle: { color: '#4b8df8', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(75, 141, 248, 0.5)' },
            { offset: 1, color: 'rgba(75, 141, 248, 0.1)' },
          ]),
        },
        itemStyle: { color: '#4b8df8' },
      },
    ],
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

defineExpose({ resize: () => chartInstance?.resize() })
</script>

<template>
  <div class="relative w-full h-[280px] mt-[25px] box-border border border-[#034c6a] bg-[#081832]"
    style="box-shadow: -10px 0 15px #034c6a inset, 0 -10px 15px #034c6a inset, 10px 0 15px #034c6a inset, 0 10px 15px #034c6a inset;">
    <div
      class="absolute -top-3.75 left-[20%] w-[60%] h-[35px] bg-[#034c6a] rounded-[18px] text-white font-bold text-base leading-[35px] text-center z-10">
      日流量趋势
    </div>
    <div ref="chartRef" class="h-62.5 p-[5px_10px] mt-3.75"></div>
  </div>
</template>
