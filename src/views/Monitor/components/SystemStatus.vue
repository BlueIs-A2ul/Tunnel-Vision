<script setup lang="ts">
defineProps<{
  pyConnected: boolean
}>()
</script>

<template>
  <div
    class="relative border border-[#034c6a] rounded-lg mt-6 mb-4 shadow-[-10px_0_15px_#034c6a_inset,0_-10px_15px_#034c6a_inset,10px_0_15px_#034c6a_inset,0_10px_15px_#034c6a_inset] box-border">
    <div
      class="absolute -top-3.75 left-[20%] bg-[#034c6a] rounded-[18px] h-8.75 w-3/5 leading-8.75 text-center text-sm font-bold text-white z-10 flex items-center justify-center gap-2 px-3 box-border">
      系统状态
    </div>
    <div class="pt-5 px-5 pb-5">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="text-[#61d2f7] text-[13px]">服务器状态</span>
          <span
            :class="['text-[12px] px-2.5 py-0.5 rounded-[10px] border', pyConnected ? 'bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border-[#25f3e6]' : 'bg-[rgba(255,78,78,0.2)] text-[#ff4e4e] border-[#ff4e4e]']">{{
              pyConnected ? '运行中' : '离线' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[#61d2f7] text-[13px]">数据库连接</span>
          <span
            class="text-[12px] px-2.5 py-0.5 rounded-[10px] bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border border-[#25f3e6]">正常</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[#61d2f7] text-[13px]">AI 识别服务</span>
          <span
            :class="['text-[12px] px-2.5 py-0.5 rounded-[10px] border', pyConnected ? 'bg-[rgba(37,243,230,0.2)] text-[#25f3e6] border-[#25f3e6]' : 'bg-[rgba(255,78,78,0.2)] text-[#ff4e4e] border-[#ff4e4e]']">{{
              pyConnected ? '运行中' : '离线' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
