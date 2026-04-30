<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SwitchButton } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

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
</style>
