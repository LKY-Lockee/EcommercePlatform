<template>
  <div class="admin-categories">
    <div class="page-header">
      <h1 class="page-title">分类管理</h1>
      <va-button @click="showCreateDialog = true" icon="add"> 添加分类 </va-button>
    </div>

    <!-- 分类列表 -->
    <va-card>
      <va-card-content>
        <va-data-table
          :items="categories"
          :columns="columns"
          :loading="loading"
          no-data-html="暂无分类"
        >
          <template #cell(image)="{ rowData }">
            <va-avatar :src="rowData.image || '/placeholder.png'" size="small" square />
          </template>

          <template #cell(is_active)="{ rowData }">
            <va-chip :color="rowData.is_active ? 'success' : 'secondary'" small>
              {{ rowData.is_active ? '启用' : '禁用' }}
            </va-chip>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="action-buttons">
              <va-button
                preset="secondary"
                size="small"
                icon="edit"
                @click="editCategory(rowData)"
              />
              <va-button
                preset="secondary"
                size="small"
                icon="delete"
                color="danger"
                @click="deleteCategoryConfirm(rowData)"
              />
            </div>
          </template>
        </va-data-table>
      </va-card-content>
    </va-card>

    <!-- 创建/编辑分类对话框 -->
    <va-modal v-model="showCreateDialog" title="添加分类" @ok="handleCreateCategory">
      <category-form
        ref="categoryFormRef"
        :category="currentCategory"
        @submit="handleCreateCategory"
      />
    </va-modal>

    <va-modal v-model="showEditDialog" title="编辑分类" @ok="handleUpdateCategory">
      <category-form
        ref="categoryFormRef"
        :category="currentCategory"
        @submit="handleUpdateCategory"
      />
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories, type Category } from '@/api/category'

const loading = ref(false)
const categories = ref<Category[]>([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentCategory = ref<Partial<Category>>({})
const categoryFormRef = ref()

const columns = [
  { key: 'image', label: '图片', width: '80px' },
  { key: 'name', label: '分类名称', sortable: true },
  { key: 'description', label: '描述' },
  { key: 'sort_order', label: '排序', sortable: true },
  { key: 'is_active', label: '状态' },
  { key: 'actions', label: '操作', width: '120px' },
]

const loadCategories = async () => {
  try {
    loading.value = true
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

const editCategory = (category: Category) => {
  currentCategory.value = { ...category }
  showEditDialog.value = true
}

const handleCreateCategory = async () => {
  try {
    const formData = await categoryFormRef.value?.validate()
    if (formData) {
      // TODO: 调用创建分类 API
      showCreateDialog.value = false
      loadCategories()
      currentCategory.value = {}
    }
  } catch (error) {
    console.error('创建分类失败:', error)
  }
}

const handleUpdateCategory = async () => {
  try {
    const formData = await categoryFormRef.value?.validate()
    if (formData && currentCategory.value.id) {
      // TODO: 调用更新分类 API
      showEditDialog.value = false
      loadCategories()
      currentCategory.value = {}
    }
  } catch (error) {
    console.error('更新分类失败:', error)
  }
}

const deleteCategoryConfirm = (category: Category) => {
  if (confirm(`确定要删除分类 "${category.name}" 吗？`)) {
    handleDeleteCategory(category.id)
  }
}

const handleDeleteCategory = async (id: number) => {
  try {
    // TODO: 调用删除分类 API
    console.log('删除分类 ID:', id)
    loadCategories()
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.admin-categories {
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

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
