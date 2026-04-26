<script setup lang="ts">
</script>

<template>
  <div class="map-wrapper">
    <div class="map-title">
      <i class="title_icon"></i>车辆行驶地图
    </div>
    <div id="map_div" class="map-content">
      <div class="map-placeholder">
        <span class="map-text">地图区域</span>
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
  background-color: #034c6a;
  border-radius: 18px;
  position: absolute;
  height: 35px;
  width: 30%;
  top: -15px;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  left: 35%;
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

.map-content {
  width: 96%;
  height: 94%;
  margin: 4% auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #034c6a 0%, #030829 100%);
  border-radius: 8px;
}

.map-placeholder {
  text-align: center;
}

.map-text {
  color: #4b8df8;
  font-size: 18px;
}
</style>