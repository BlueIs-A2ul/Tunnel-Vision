<script setup lang="ts">
import NavHeader from '@/views/Dashboard/components/NavHeader.vue'
</script>

<template>
  <div class="common-layout">
    <el-container class="h-screen">
      <!-- 顶部导航栏 -->
      <el-header class="p-0! mb-2!">
        <NavHeader />
      </el-header>
      <!-- 主内容区域 -->
      <el-main class="bg-[#081832] p-6">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped></style>
