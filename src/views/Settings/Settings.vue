<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SwitchButton } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { getSystemConfig, saveSystemConfig } from '@/api/settings'
import type { SystemSettings } from '@/types/settings'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    router.push('/login')
  } catch {
  }
}

const settingsLoading = ref(false)
const systemSettings = ref<SystemSettings>({
  cameraCount: 5,
  frameRate: 25,
  detectionInterval: 4,
})

async function fetchSystemSettings() {
  try {
    const res = await getSystemConfig()
    if (res.code === 200 && res.data) {
      systemSettings.value = res.data
    }
  } catch {
    // 使用默认值
  }
}

async function handleSaveSettings() {
  settingsLoading.value = true
  try {
    const res = await saveSystemConfig(systemSettings.value)
    if (res.code !== 200) throw new Error(res.msg || '保存失败')
    ElMessage.success('系统参数已保存')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    settingsLoading.value = false
  }
}

onMounted(() => {
  fetchSystemSettings()
})
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[#081832]">
    <div class="w-[98%] mx-auto py-6">
      <div class="mb-5">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg gap-2">
          <Icon icon="lsicon:setting-filled" :size="20" color="#4b8df8"></Icon>
          系统设置
        </div>
      </div>

      <div class="max-w-180 mx-auto flex flex-col gap-5">
        <div class="setting-section">
          <div class="section-title">账户信息</div>
          <div class="p-0">
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between py-3 border-b border-[#034c6a] last:border-b-0">
                <span class="text-[#61d2f7] text-sm">当前用户</span>
                <span class="text-white font-medium text-sm">{{ authStore.user?.username }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-[#034c6a] last:border-b-0">
                <span class="text-[#61d2f7] text-sm">用户角色</span>
                <span :class="[
                  'px-3 py-0.5 rounded-xl text-xs border',
                  authStore.user?.isAdmin === 1
                    ? 'bg-[rgba(245,108,108,0.2)] text-[#f56c6c] border-[#f56c6c]'
                    : 'bg-[rgba(75,141,248,0.2)] text-[#4b8df8] border-[#4b8df8]'
                ]">
                  {{ authStore.user?.isAdmin === 1 ? '管理员' : '普通用户' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-section">
          <div class="section-title">系统参数设置</div>
          <div class="p-0">
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between py-3 border-b border-[#034c6a]">
                <span class="text-[#61d2f7] text-sm">默认摄像头数量</span>
                <el-input-number v-model="systemSettings.cameraCount" :min="1" :max="100" :step="1"
                  controls-position="right" class="settings-input-number" />
              </div>
              <div class="flex items-center justify-between py-3 border-b border-[#034c6a]">
                <span class="text-[#61d2f7] text-sm">视频同步帧率</span>
                <el-input-number v-model="systemSettings.frameRate" :min="1" :max="120" :step="1"
                  controls-position="right" class="settings-input-number" />
              </div>
              <div class="flex items-center justify-between py-3 border-b border-[#034c6a] last:border-b-0">
                <span class="text-[#61d2f7] text-sm">抽帧检测间隔（秒）</span>
                <el-input-number v-model="systemSettings.detectionInterval" :min="1" :max="3600" :step="1"
                  controls-position="right" class="settings-input-number" />
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <button
                class="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer border-none text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: linear-gradient(to bottom, #4b8df8, #25f3e6)" :disabled="settingsLoading"
                @click="handleSaveSettings">
                {{ settingsLoading ? '保存中...' : '保存设置' }}
              </button>
            </div>
          </div>
        </div>

        <div class="setting-section">
          <div class="section-title">退出登录</div>
          <div class="p-0">
            <div class="flex items-center justify-between">
              <span class="text-[#61d2f7] text-sm">退出当前账户，返回登录页面</span>
              <button class="btn-danger" @click="handleLogout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting-section {
  position: relative;
  box-shadow: -10px 0 15px #034c6a inset,
    0 -10px 15px #034c6a inset,
    10px 0 15px #034c6a inset,
    0 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 25px;
  padding: 20px;
  padding-top: 30px;
}

.section-title {
  position: absolute;
  top: -15px;
  left: 20%;
  background: #034c6a;
  border-radius: 18px;
  height: 35px;
  width: 60%;
  line-height: 35px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  z-index: 10;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #f56c6c;
  background: transparent;
  color: #f56c6c;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: rgba(245, 108, 108, 0.2);
}

:deep(.settings-input-number .el-input-number__decrease),
:deep(.settings-input-number .el-input-number__increase) {
  background: #034c6a;
  color: #fff;
  border-color: #034c6a;
}

:deep(.settings-input-number .el-input__wrapper) {
  background: #034c6a;
  border: 1px solid #034c6a;
  box-shadow: none;
}

:deep(.settings-input-number .el-input__inner) {
  color: #fff;
}

:deep(.settings-input-number .el-input__wrapper.is-focus) {
  border-color: #4b8df8;
}
</style>
