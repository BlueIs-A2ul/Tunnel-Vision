<script setup lang="ts">
defineProps<{
  value: number
  label: string
  color: string
}>()
</script>

<template>
  <div class="w-[15.66%] bg-[#034c6a] rounded-lg p-4 text-center">
    <div class="text-[28px] font-bold leading-tight" :style="{ color }">{{ value }}</div>
    <div class="text-xs text-[#e8f7fe] mt-1">{{ label }}</div>
  </div>
</template>
