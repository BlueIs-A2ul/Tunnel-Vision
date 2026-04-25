<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/user'

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
  role: 'user' as 'admin' | 'user',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
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
    role: 'user',
  }
  dialogVisible.value = true
}

function openEditDialog(user: User) {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  form.value = {
    id: user.id,
    username: user.username,
    password: '',
    role: user.role,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isEdit.value) {
      const updateData: any = { role: form.value.role }
      if (form.value.password) {
        updateData.password = form.value.password
      }
      await updateUser(form.value.id, updateData)
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.value.username,
        password: form.value.password,
        role: form.value.role,
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
      await deleteUser(user.id)
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
  <div class="p-6">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">用户管理</h2>
          <div class="flex gap-2">
            <el-button type="primary" :icon="Plus" @click="openAddDialog">添加用户</el-button>
            <el-button :icon="Refresh" @click="fetchUsers">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="users" stripe class="w-full">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" size="small">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建日期" width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="450px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item prop="username" :label="isEdit ? '用户名' : '用户名'">
          <el-input v-model="form.username" :placeholder="isEdit ? '不修改请留空' : '请输入用户名'" :disabled="isEdit" />
        </el-form-item>
        <el-form-item prop="password" :label="isEdit ? '密码' : '密码'">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? '不修改请留空' : '请输入密码'" />
        </el-form-item>
        <el-form-item prop="role" label="角色">
          <el-select v-model="form.role" class="w-full">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
