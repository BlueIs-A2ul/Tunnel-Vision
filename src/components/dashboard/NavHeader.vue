<script setup lang="ts">
defineProps<{
  activeNav: string
}>()

const emit = defineEmits<{
  'update:activeNav': [value: string]
}>()
</script>

<template>
  <header class="w-full h-20 bg-[#030829] flex items-center justify-center">
    <div
      class="w-[30%] h-20 bg-linear-to-b from-[#030829] to-[#04425f] border-x-2 border-[#034c6a] text-white text-center flex flex-col items-center justify-center font-['Microsoft_YaHei']">
      <h2 class="mt-2.5 mb-2.5 text-lg font-bold">智慧隧道监测综合平台</h2>
      <p class="text-[#e8f7fe] text-xs">Comprehensive service platform for smart tourism</p>
    </div>
  </header>
</template>
