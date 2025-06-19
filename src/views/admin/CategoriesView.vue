<template>
  <div class="admin-categories">
    <!-- 搜索和筛选 -->
    <div class="header-section">
      <div class="filter-section">
        <div class="filter-item">
          <va-input
            v-model="searchQuery"
            placeholder="搜索分类名称"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #appendInner>
              <va-button
                preset="plain"
                @click="handleSearch"
                icon="search"
                size="small"
                color="primary"
              />
            </template>
          </va-input>
        </div>
      </div>
      <va-button @click="openCreateDialog" icon="add"> 添加分类 </va-button>
    </div>

    <!-- 分类列表 -->
    <div class="categories-table">
      <va-data-table
        :items="filteredCategories"
        :columns="columns"
        :loading="loading"
        no-data-html="暂无分类"
        class="data-table"
      >
        <template #cell(image)="{ rowData }">
          <va-avatar :src="rowData.image || '/placeholder.png'" size="medium" square />
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="action-buttons">
            <va-button preset="plain" size="small" icon="edit" @click="editCategory(rowData)" />
            <va-button
              preset="plain"
              size="small"
              icon="delete"
              color="danger"
              @click="deleteCategoryConfirm(rowData)"
            />
          </div>
        </template>
      </va-data-table>
    </div>

    <!-- 创建/编辑分类对话框 -->
    <va-modal
      v-model="showCategoryDialog"
      :title="isEditing ? '编辑分类' : '添加分类'"
      size="large"
      max-width="600px"
      hide-default-actions
      class="category-modal"
    >
      <div class="category-form">
        <va-form ref="categoryFormRef" @submit.prevent="handleFormSubmit">
          <!-- 基本信息卡片 -->
          <va-card class="form-card">
            <va-card-title class="form-section-title">基本信息</va-card-title>
            <va-card-content>
              <div class="form-field-full">
                <va-input
                  v-model="categoryForm.name"
                  label="分类名称"
                  placeholder="请输入分类名称"
                  :rules="[required]"
                  required
                  clearable
                />
              </div>

              <div class="form-field-full">
                <va-textarea
                  v-model="categoryForm.description"
                  label="分类描述"
                  placeholder="请输入分类描述"
                  rows="3"
                  autosize
                  clearable
                />
              </div>
            </va-card-content>
          </va-card>

          <!-- 分类图片卡片 -->
          <va-card class="form-card">
            <va-card-title class="form-section-title">分类图片</va-card-title>
            <va-card-content>
              <div class="form-field-full">
                <va-input
                  v-model="categoryForm.image"
                  label="分类图片"
                  placeholder="请输入图片URL"
                  clearable
                />
              </div>

              <div v-if="categoryForm.image" class="image-preview">
                <img :src="categoryForm.image" alt="分类预览" @error="handleImageError" />
              </div>
            </va-card-content>
          </va-card>

          <!-- 表单操作按钮 -->
          <div class="form-actions">
            <va-button @click="cancelForm" preset="secondary" size="large"> 取消 </va-button>
            <va-button
              @click="handleFormSubmit"
              color="primary"
              size="large"
              :loading="formSubmitting"
            >
              {{ isEditing ? '更新分类' : '创建分类' }}
            </va-button>
          </div>
        </va-form>
      </div>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'
import type { Category, CategoryCreateData } from '@/types'

const loading = ref(false)
const categories = ref<Category[]>([])
const searchQuery = ref('')
const showCategoryDialog = ref(false)
const isEditing = ref(false)
const formSubmitting = ref(false)
const categoryFormRef = ref()

// 统一的分类表单数据
const categoryForm = ref({
  name: '',
  description: '',
  image: '',
  id: undefined as number | undefined,
})

const columns = [
  { key: 'image', label: '图片', width: '80px' },
  { key: 'name', label: '分类名称', sortable: true },
  { key: 'description', label: '描述' },
  { key: 'actions', label: '操作', width: '120px' },
]

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  return categories.value.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// 表单验证规则
const required = (value: unknown) => !!value || '此字段为必填项'

const loadCategories = async () => {
  try {
    loading.value = true
    const response = await getAdminCategories()
    const categoriesData = response.data
    if (Array.isArray(categoriesData)) {
      categories.value = categoriesData
    } else {
      console.warn('分类数据格式不正确:', categoriesData)
      categories.value = []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const editCategory = (category: Category) => {
  categoryForm.value = {
    name: category.name,
    description: category.description || '',
    image: category.image || '',
    id: category.id,
  }
  isEditing.value = true
  showCategoryDialog.value = true
}

// 打开创建对话框
const openCreateDialog = () => {
  resetCategoryForm()
  isEditing.value = false
  showCategoryDialog.value = true
}

// 重置分类表单
const resetCategoryForm = () => {
  categoryForm.value = {
    name: '',
    description: '',
    image: '',
    id: undefined,
  }
}

// 统一的表单提交处理
const handleFormSubmit = async () => {
  try {
    const isValid = await categoryFormRef.value?.validate()
    if (isValid) {
      formSubmitting.value = true

      if (isEditing.value) {
        // 编辑分类
        if (categoryForm.value.id) {
          const updateData: Partial<CategoryCreateData> = {
            name: categoryForm.value.name,
            description: categoryForm.value.description,
            image: categoryForm.value.image,
          }

          await updateCategory(categoryForm.value.id, updateData)
        }
      } else {
        // 创建分类
        const createData: CategoryCreateData = {
          name: categoryForm.value.name,
          description: categoryForm.value.description,
          image: categoryForm.value.image,
        }

        await createCategory(createData)
      }

      showCategoryDialog.value = false
      resetCategoryForm()
      loadCategories()
    }
  } catch (error) {
    console.error(isEditing.value ? '更新分类失败:' : '创建分类失败:', error)
  } finally {
    formSubmitting.value = false
  }
}

// 取消表单
const cancelForm = () => {
  showCategoryDialog.value = false
  resetCategoryForm()
}

// 图片错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/placeholder.png'
}

const deleteCategoryConfirm = (category: Category) => {
  if (confirm(`确定要删除分类 "${category.name}" 吗？`)) {
    handleDeleteCategory(category.id)
  }
}

const handleDeleteCategory = async (id: number) => {
  try {
    await deleteCategory(id)
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
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.filter-section {
  display: flex;
  gap: 1rem;
}

.filter-item {
  min-width: 0;
}

.search-input {
  width: 100%;
  border-radius: 25px;
}

.search-input :deep(.va-input__container) {
  border-radius: 25px;
  background: rgba(var(--va-background-secondary-rgb), 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  padding-right: 40px;
}

.search-input :deep(.va-input__container):hover {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
}

.search-input :deep(.va-input__container--focused) {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.15);
}

.categories-table {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow-x: auto;
}

.data-table {
  min-width: 600px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

/* 分类表单样式 */
.category-modal :deep(.va-modal__title) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.category-form {
  padding: 0 4px;
}

/* CSS Grid 布局 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field-full {
  width: 100%;
}

.form-field-full:not(:last-child) {
  margin-bottom: 1rem;
}

.form-field-full :deep(.va-input),
.form-field-full :deep(.va-textarea) {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-card {
  margin-bottom: 1.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section-title {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  color: #374151 !important;
}

.form-card :deep(.va-card__title) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
  margin: 0;
}

.form-card :deep(.va-card__content) {
  padding: 1.75rem 1.5rem;
}

.checkbox-container {
  padding-top: 0.5rem;
}

.active-checkbox {
  margin-bottom: 0.75rem;
}

.active-checkbox :deep(.va-checkbox__label) {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.checkbox-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.image-preview {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 0 0.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
}

.form-actions .va-button {
  min-width: 120px;
  height: 44px;
  font-size: 0.95rem;
  font-weight: 500;
}

/* 表单输入框样式增强 */
.category-form :deep(.va-input__container) {
  border-radius: 8px;
  transition: all 0.2s ease;
  min-height: 44px;
}

.category-form :deep(.va-input__container):hover {
  border-color: var(--va-primary);
}

.category-form :deep(.va-input__container--focused) {
  border-color: var(--va-primary);
  box-shadow: 0 0 0 3px rgba(var(--va-primary-rgb), 0.1);
}

.category-form :deep(.va-textarea__container) {
  border-radius: 8px;
}

.category-form :deep(.va-input) {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-section {
    flex-direction: column;
  }

  .categories-table {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .va-button {
    width: 100%;
  }

  .category-form {
    max-height: 60vh;
  }

  .form-card :deep(.va-card__content) {
    padding: 1rem;
  }
}

/* 滚动条样式 */
.category-form::-webkit-scrollbar {
  width: 6px;
}

.category-form::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.category-form::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.category-form::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
