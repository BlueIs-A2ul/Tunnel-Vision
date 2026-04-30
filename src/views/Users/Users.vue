<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'
import { Icon } from '@iconify/vue'

const authStore = useAuthStore()

const loading = ref(false)
const users = ref<User[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)

const formRef = ref<FormInstance>()
const form = ref({
  id: 0,
  username: '',
  password: '',
  isAdmin: 0,
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  isAdmin: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function fetchUsers() {
  loading.value = true
  try {
    users.value = await getUsers()
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  dialogTitle.value = '添加用户'
  isEdit.value = false
  form.value = {
    id: 0,
    username: '',
    password: '',
    isAdmin: 0,
  }
  dialogVisible.value = true
}

function openEditDialog(user: User) {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  form.value = {
    id: user.id!,
    username: user.username,
    password: '',
    isAdmin: user.isAdmin ?? 0,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (!isEdit.value && !form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      const updateData: any = { isAdmin: form.value.isAdmin }
      if (form.value.username) {
        updateData.username = form.value.username
      }
      if (form.value.password) {
        updateData.password = form.value.password
      }
      await updateUser(form.value.id, updateData)
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.value.username,
        password: form.value.password,
        isAdmin: form.value.isAdmin,
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    await fetchUsers()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

async function handleDelete(user: User) {
  if (user.id === authStore.user?.id) {
    ElMessage.warning('不能删除当前登录用户')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    try {
      await deleteUser(user.id!)
      ElMessage.success('删除成功')
      await fetchUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-container">
    <div class="users-content">
      <!-- 标题 -->
      <div class="page-header">
        <div
          class="inline-flex items-center bg-[#034c6a] rounded-[18px] px-[30px] py-2 text-white font-bold text-lg gap-2">
          <Icon icon="boxicons:user-filled" :size="20" color="#4b8df8"></Icon>
          用户管理
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" class="action-btn primary" @click="openAddDialog">
          <Plus /> 添加用户
        </el-button>
        <el-button class="action-btn" @click="fetchUsers">
          <Refresh /> 刷新
        </el-button>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table v-loading="loading" element-loading-background="rgba(8, 24, 50, 0.85)" :data="users"
          class="users-table" :header-cell-style="{ background: '#034c6a', color: '#ffffff', border: 'none' }"
          :cell-style="{ background: '#081832', color: '#ffffff', borderColor: '#034c6a' }">
          <el-table-column prop="id" label="ID" width="100" align="center" />
          <el-table-column prop="username" label="用户名" min-width="150" align="center" />
          <el-table-column prop="role" label="角色" width="150" align="center">
            <template #default="{ row }">
              <span :class="['role-tag', row.isAdmin === 1 ? 'admin' : 'user']">
                {{ row.isAdmin === 1 ? '管理员' : '普通用户' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button type="primary" link class="table-btn" @click="openEditDialog(row)">
                <Edit /> 编辑
              </el-button>
              <el-button type="danger" link class="table-btn delete" @click="handleDelete(row)">
                <Delete /> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="" width="450px" class="users-dialog" :show-close="false"
      :close-on-click-modal="false" destroy-on-close>
      <div class="dialog-custom-header">
        <span>{{ dialogTitle }}</span>
      </div>
      <div class="dialog-custom-body">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="form.username" :placeholder="isEdit ? '不修改请留空' : '请输入用户名'" :disabled="isEdit"
              class="dialog-input" />
          </el-form-item>
          <el-form-item prop="password" :label="isEdit ? '新密码' : '密码'">
            <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
              class="dialog-input" />
          </el-form-item>
          <el-form-item prop="isAdmin" label="角色">
            <el-select v-model="form.isAdmin" class="dialog-select">
              <el-option label="管理员" :value="1" />
              <el-option label="普通用户" :value="0" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-custom-footer">
        <el-button class="dialog-btn" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="dialog-btn primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.users-container {
  min-height: 100vh;
  background-color: #081832;
  padding: 20px;
}

.users-content {
  width: 98%;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}

.header-title {
  background-color: #034c6a;
  border-radius: 18px;
  display: inline-block;
  padding: 8px 30px;
  color: #ffffff;
  font-weight: bold;
  font-size: 18px;
}

.title-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  position: relative;
  top: 2px;
  margin-right: 8px;
  background: #ffffff no-repeat center;
  background-size: contain;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.action-btn {
  background-color: transparent !important;
  border: 1px solid #034c6a !important;
  color: #ffffff !important;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-btn:hover {
  background-color: rgba(3, 76, 106, 0.3) !important;
}

.action-btn.primary {
  background: linear-gradient(to bottom, #4b8df8, #25f3e6) !important;
  border: none !important;
  color: #ffffff !important;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

/* 表格容器 */
.table-wrapper {
  box-shadow: -10px 0px 15px #034c6a inset,
    0px -10px 15px #034c6a inset,
    10px 0px 15px #034c6a inset,
    0px 10px 15px #034c6a inset;
  border: 1px solid #034c6a;
  border-radius: 8px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  background-color: #081832;
}

/* 角色标签 */
.role-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.role-tag.admin {
  background-color: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
  border: 1px solid #f56c6c;
}

.role-tag.user {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409eff;
  border: 1px solid #409eff;
}

/* 表格按钮 */
.table-btn {
  color: #4b8df8 !important;
  font-size: 13px;
  padding: 4px 8px !important;
}

.table-btn:hover {
  color: #25f3e6 !important;
}

.table-btn.delete:hover {
  color: #f56c6c !important;
}

/* 对话框样式 */
.users-dialog :deep(.el-overlay-dialog) {
  background: transparent;
}

.users-dialog :deep(.el-dialog) {
  background-color: #081832 !important;
  border: 1px solid #034c6a;
  border-radius: 12px;
}

.users-dialog :deep(.el-dialog__header) {
  display: none;
}

.users-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.users-dialog :deep(.el-dialog__footer) {
  display: none;
}

.dialog-custom-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #034c6a;
  color: #fff;
  border-radius: 12px 12px 0 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog-custom-body {
  padding: 24px 20px;
  background: #081832;
}

.dialog-custom-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #034c6a;
  background: #072951;
  border-radius: 0 0 12px 12px;
}

/* 表单项 */
.users-dialog :deep(.el-form-item__label) {
  color: #ffffff;
  font-weight: 500;
}

.users-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 输入框 */
.dialog-input :deep(.el-input__wrapper) {
  background-color: #034c6a !important;
  border: 1px solid #034c6a;
  box-shadow: none;
  padding: 0 12px;
}

.dialog-input :deep(.el-input__inner) {
  color: #ffffff;
  height: 40px;
}

.dialog-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.dialog-input :deep(.el-input__wrapper.is-focus) {
  border-color: #4b8df8;
}

.dialog-input :deep(.el-input__inner:disabled) {
  color: rgba(255, 255, 255, 0.5);
  background-color: rgba(3, 76, 106, 0.5);
}

/* 选择器 */
.dialog-select :deep(.el-input__wrapper),
.dialog-select :deep(.el-select__wrapper) {
  background-color: #034c6a !important;
  border: 1px solid #034c6a;
  box-shadow: none;
  padding: 0 12px;
}

.dialog-select :deep(.el-input__inner) {
  color: #ffffff;
  height: 40px;
}

.dialog-select :deep(.el-input__wrapper.is-focus) {
  border-color: #4b8df8;
}

.dialog-select :deep(.el-select-dropdown) {
  background-color: #081832;
  border: 1px solid #034c6a;
}

.dialog-select :deep(.el-select-dropdown__item) {
  color: #ffffff;
}

.dialog-select :deep(.el-select-dropdown__item.hover),
.dialog-select :deep(.el-select-dropdown__item:hover) {
  background-color: #034c6a;
}

.dialog-select :deep(.el-select-dropdown__item.selected) {
  color: #4b8df8;
}

/* 对话框按钮 */
.dialog-btn {
  background-color: transparent !important;
  border: 1px solid #034c6a !important;
  color: #ffffff !important;
}

.dialog-btn:hover {
  background-color: rgba(3, 76, 106, 0.3) !important;
}

.dialog-btn.primary {
  background: linear-gradient(to bottom, #4b8df8, #25f3e6) !important;
  border: none !important;
  color: #ffffff !important;
}

/* 表格hover效果 */
.users-table :deep(.el-table__row:hover > td) {
  background-color: rgba(3, 76, 106, 0.3) !important;
}

/* 表格边框 */
.users-table :deep(.el-table--border) {
  border: none;
}

.users-table :deep(.el-table--border .el-table__cell) {
  border-right: 1px solid #034c6a;
}
</style>

<style>
.users-dialog {
  background-color: #081832 !important;
  border: 1px solid #034c6a;
  border-radius: 12px;
}
</style>
