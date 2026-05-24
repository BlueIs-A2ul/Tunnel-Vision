<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  busCount: number
  truckCount: number
  tankerCount: number
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let instance: echarts.ECharts | null = null

function getChartData() {
  return [
    { value: props.busCount, name: '巴士', itemStyle: { color: '#4b8df8' } },
    { value: props.truckCount, name: '卡车', itemStyle: { color: '#25f3e6' } },
    { value: props.tankerCount, name: '油罐车', itemStyle: { color: '#ff4e4e' } },
  ]
}

const handleResize = () => instance?.resize()

function initChart() {
  if (!chartRef.value) return
  instance = echarts.init(chartRef.value)
  instance.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(3, 8, 41, 0.9)',
      borderColor: '#034c6a',
      textStyle: { color: '#ffffff' },
    },
    legend: { bottom: '5%', left: 'center', textStyle: { color: '#ffffff' } },
    series: [
      {
        name: '车辆类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#081832', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' },
        },
        data: getChartData(),
      },
    ],
  })
}

watch(
  () => [props.busCount, props.truckCount, props.tankerCount],
  () => {
    instance?.setOption({ series: [{ data: getChartData() }] })
  },
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  instance?.dispose()
  instance = null
})
</script>

<template>
  <div
    class="relative border border-[#034c6a] rounded-lg mt-6 mb-4 shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset] box-border">
    <div
      class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
      车辆类型分布
    </div>
    <div class="pt-5 px-2 pb-2">
      <div ref="chartRef" class="h-80"></div>
    </div>
  </div>
</template>
