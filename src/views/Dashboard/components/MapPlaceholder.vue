<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, onUnmounted, ref } from 'vue';

const mapContainer = ref<HTMLElement | null>(null);
const mapLoaded = ref(false);
let mapInstance: any = null;

// 高德地图加载函数
const loadAMap = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果已经加载，直接返回
    if ((window as any).AMap) {
      resolve();
      return;
    }

    const key = import.meta.env.VITE_WEB_KEY;
    const securityCode = import.meta.env.VITE_SECURITY_JS_CODE;

    // 创建并加载高德地图脚本
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Scale,AMap.ToolBar`;
    script.async = true;

    script.onload = () => {
      // 设置安全密钥
      if (securityCode) {
        (window as any)._AMapSecurityConfig = {
          securityJsCode: securityCode,
        };
      }
      resolve();
    };

    script.onerror = () => {
      reject(new Error('高德地图加载失败'));
    };

    document.head.appendChild(script);
  });
};

// 初始化地图
const initMap = async () => {
  try {
    await loadAMap();

    if (!mapContainer.value) return;

    const AMap = (window as any).AMap;

    // 创建地图实例
    mapInstance = new AMap.Map(mapContainer.value, {
      zoom: 12, // 缩放级别
      center: [116.397428, 39.90923], // 北京市中心坐标 [经度, 纬度]
      viewMode: '2D', // 使用2D视图
      mapStyle: 'amap://styles/normal', // 标准地图样式
    });

    // 添加比例尺控件
    mapInstance.addControl(new AMap.Scale());

    // 添加工具条控件
    mapInstance.addControl(new AMap.ToolBar({
      position: 'RB', // 右下角
    }));

    // 标记地图加载完成
    mapLoaded.value = true;

  } catch (error) {
    console.error('地图初始化失败:', error);
  }
};

// 组件挂载时初始化地图
onMounted(() => {
  initMap();
});

// 组件卸载时销毁地图
onUnmounted(() => {
  if (mapInstance) {
    mapInstance.destroy();
    mapInstance = null;
  }
});
</script>

<template>
  <div class="map-wrapper">
    <div class="map-title">
      <Icon icon="typcn:camera" :size="18" color="#fff"></Icon>
      车辆行驶地图
    </div>
    <div class="map-content" ref="mapContainer">
      <div class="map-loading" v-if="!mapLoaded">
        <span class="loading-text">地图加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 586px;
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  box-sizing: border-box;
  position: relative;
  margin-top: 25px;
}

.map-title {
  display: inline-flex;
  align-items: center;
  background-color: #034c6a;
  border-radius: 18px;
  padding: 8px 30px;
  color: #ffffff;
  font-weight: bold;
  font-size: 18px;
  gap: 8px;
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 6px rgba(3, 76, 106, 0.3);
  width: auto;
  white-space: nowrap;
  z-index: 10;
}

.map-content {
  width: 96%;
  height: 94%;
  margin: 4% auto;
  background: linear-gradient(135deg, #034c6a 0%, #030829 100%);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #4b8df8;
  font-size: 18px;
}

/* 确保地图容器占满整个 content 区域 */
:deep(.amap-container) {
  width: 100%;
  height: 100%;
}
</style>
