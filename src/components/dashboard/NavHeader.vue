<script setup lang="ts">
defineProps<{
  activeNav: string
}>()

const emit = defineEmits<{
  'update:activeNav': [value: string]
}>()

const navItems = [
  { id: 'data', icon: 'nav_1', label: '数据概览' },
  { id: 'vehicle', icon: 'nav_2', label: '车辆监控' },
  { id: 'map', icon: 'nav_3', label: '地图界面' },
  { id: 'stat', icon: 'nav_7', label: '查询统计' },
  { id: 'message', icon: 'nav_8', label: '信息录入' },
  { id: 'table', icon: 'nav_4', label: '表格界面' },
]

const handleNavClick = (navId: string) => {
  emit('update:activeNav', navId)
}
</script>

<template>
  <header class="header left">
    <div class="left nav">
      <ul>
        <li v-for="item in navItems.slice(0, 3)" :key="item.id" :class="{ 'nav_active': activeNav === item.id }"
          @click="handleNavClick(item.id)">
          <i :class="item.icon"></i><span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
    <div class="header_center left">
      <h2><strong>智慧隧道监测综合平台</strong></h2>
      <p class="color_font"><small>Comprehensive service platform for smart tourism</small></p>
    </div>
    <div class="right nav text_right">
      <ul>
        <li v-for="item in navItems.slice(3)" :key="item.id" :class="{ 'nav_active': activeNav === item.id }"
          @click="handleNavClick(item.id)">
          <i :class="item.icon"></i><span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  height: 80px;
  background-color: #030829;
}

.header_center {
  width: 30%;
  margin: 0px auto;
  color: #FFFFff;
  text-align: center;
  height: 80px;
  background: linear-gradient(180deg, #030829 0%, #04425f 100%);
  border-left: 2px solid #034c6a;
  border-right: 2px solid #034c6a;
  font-family: "微软雅黑", "Microsoft YaHei", sans-serif;
}

.header_center h2 {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 18px;
}

.color_font {
  color: #e8f7fe !important;
  font-size: 12px !important;
}

.nav {
  width: 35%;
}

.nav ul {
  display: flex;
  justify-content: space-around;
  height: 100%;
  align-items: center;
}

.nav ul li {
  display: inline-block;
  width: 120px;
  text-align: center;
  height: 50px;
  position: relative;
  line-height: 50px;
  margin-top: 15px;
  box-sizing: border-box;
  border-radius: 5px;
  cursor: pointer;
  color: #ffffff;
}

.nav ul li:hover {
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  box-sizing: border-box;
}

.nav ul li i {
  width: 16px;
  height: 16px;
  display: inline-block;
  position: relative;
  top: 3px;
  margin-right: 5px;
}

.nav ul li span {
  color: #ffffff;
  font-size: 14px;
}

.nav_active {
  border-bottom: 4px solid #4b8df8;
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  box-sizing: border-box;
}

/* Navigation Icons */
.nav_1 {
  background: #4b8df8 no-repeat center;
  background-size: contain;
}

.nav_2 {
  background: #25f3e6 no-repeat center;
  background-size: contain;
}

.nav_3 {
  background: #ffff43 no-repeat center;
  background-size: contain;
}

.nav_4 {
  background: #ff4e4e no-repeat center;
  background-size: contain;
}

.nav_7 {
  background: #61d2f7 no-repeat center;
  background-size: contain;
}

.nav_8 {
  background: #ffffff no-repeat center;
  background-size: contain;
}

.left {
  float: left;
}

.right {
  float: right;
}

.text_right {
  text-align: right;
}
</style>