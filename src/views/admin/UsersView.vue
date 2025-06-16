<template>
  <div class="admin-users">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- 搜索 -->
    <va-card class="filter-card">
      <va-card-content>
        <va-row :gutter="16">
          <va-column :xs="12" :md="6">
            <va-input
              v-model="searchQuery"
              label="搜索用户"
              placeholder="输入用户名或邮箱"
              clearable
              @input="handleSearch"
            >
              <template #prepend>
                <va-icon name="search" />
              </template>
            </va-input>
          </va-column>
        </va-row>
      </va-card-content>
    </va-card>

    <!-- 用户列表 -->
    <va-card>
      <va-card-content>
        <va-data-table
          :items="users"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="updatePagination"
          no-data-html="暂无用户"
        >
          <template #cell(avatar)="{ rowData }">
            <va-avatar :src="(rowData as any).avatar || '/default-avatar.png'" size="small" />
          </template>

          <template #cell(role)="{ rowData }">
            <va-chip :color="rowData.role === 'admin' ? 'primary' : 'secondary'" small>
              {{ rowData.role === 'admin' ? '管理员' : '用户' }}
            </va-chip>
          </template>

          <template #cell(created_at)="{ rowData }">
            {{ formatDate(rowData.created_at) }}
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <va-button
                v-if="rowData.role !== 'admin'"
                preset="secondary"
                size="small"
                icon="delete"
                color="danger"
                @click="deleteUserConfirm(rowData)"
              />
            </div>
          </template>
        </va-data-table>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminUsers, deleteUser, type AdminUser } from '@/api/admin'

const loading = ref(false)
const users = ref<AdminUser[]>([])
const searchQuery = ref('')

const pagination = ref({
  page: 1,
  perPage: 20,
  total: 0,
})

const columns = [
  { key: 'avatar', label: '头像', width: '80px' },
  { key: 'username', label: '用户名', sortable: true },
  { key: 'email', label: '邮箱', sortable: true },
  { key: 'phone', label: '手机号' },
  { key: 'role', label: '角色' },
  { key: 'created_at', label: '注册时间', sortable: true },
  { key: 'actions', label: '操作', width: '120px' },
]

const loadUsers = async () => {
  try {
    loading.value = true
    const response = await getAdminUsers({
      page: pagination.value.page,
      limit: pagination.value.perPage,
      search: searchQuery.value,
    })
    users.value = response.data.users || []
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('加载用户失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadUsers()
}

const updatePagination = (newPagination: typeof pagination.value) => {
  pagination.value = { ...pagination.value, ...newPagination }
  loadUsers()
}

const deleteUserConfirm = (user: AdminUser) => {
  if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可撤销。`)) {
    handleDeleteUser(user.id)
  }
}

const handleDeleteUser = async (id: number) => {
  try {
    await deleteUser(id)
    loadUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  color: var(--va-primary);
}

.filter-card {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
