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
      trigger: 'item',
      backgroundColor: 'rgba(3, 8, 41, 0.9)',
      borderColor: '#034c6a',
      textStyle: { color: '#ffffff' },
    },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#081832',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: 45, name: '客车', itemStyle: { color: '#4b8df8' } },
          { value: 30, name: '货车', itemStyle: { color: '#25f3e6' } },
          { value: 15, name: '特种车', itemStyle: { color: '#ff4e4e' } },
          { value: 10, name: '其他', itemStyle: { color: '#ffff43' } },
        ],
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
      <i class="title_icon"></i>车辆类型统计
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