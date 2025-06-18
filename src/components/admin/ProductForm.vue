<template>
  <va-form ref="form" @submit.prevent="handleSubmit">
    <va-row :gutter="16">
      <va-column :xs="12" :md="6">
        <va-input v-model="form.name" label="商品名称" :rules="[required]" required />
      </va-column>
      <va-column :xs="12" :md="6">
        <va-select
          v-model="form.category_id"
          label="商品分类"
          :options="categoryOptions"
          :rules="[required]"
          required
        />
      </va-column>
    </va-row>

    <va-row :gutter="16">
      <va-column :xs="12" :md="6">
        <va-input
          v-model="form.price"
          label="销售价格"
          type="number"
          :rules="[required, minValue]"
          required
        />
      </va-column>
      <va-column :xs="12" :md="6">
        <va-input v-model="form.original_price" label="原价" type="number" />
      </va-column>
    </va-row>

    <va-row :gutter="16">
      <va-column :xs="12" :md="6">
        <va-input
          v-model="form.stock"
          label="库存数量"
          type="number"
          :rules="[required, minValue]"
          required
        />
      </va-column>
      <va-column :xs="12" :md="6">
        <va-input v-model="form.brand" label="品牌" />
      </va-column>
    </va-row>

    <va-row :gutter="16">
      <va-column :xs="12" :md="6">
        <va-input v-model="form.sku" label="SKU" />
      </va-column>
      <va-column :xs="12" :md="6">
        <va-select v-model="form.status" label="状态" :options="statusOptions" />
      </va-column>
    </va-row>

    <va-checkbox v-model="form.featured" label="设为推荐商品" />

    <va-textarea v-model="form.description" label="商品描述" rows="4" />
  </va-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminProduct, Category } from '@/types'

interface Props {
  product?: Partial<AdminProduct>
  categories: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  product: () => ({}),
})

const emit = defineEmits<{
  submit: [data: Partial<AdminProduct>]
}>()

const form = ref<Partial<AdminProduct>>({
  name: '',
  description: '',
  price: 0,
  original_price: 0,
  stock: 0,
  category_id: 0,
  brand: '',
  sku: '',
  status: 'active',
  featured: false,
})

const formRef = ref()

const categoryOptions = computed(() =>
  props.categories.map((cat) => ({ text: cat.name, value: cat.id })),
)

const statusOptions = [
  { text: '启用', value: 'active' },
  { text: '禁用', value: 'inactive' },
  { text: '缺货', value: 'out_of_stock' },
]

const required = (value: unknown) => !!value || '此字段为必填项'
const minValue = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num >= 0 || '值不能小于0'
}

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      form.value = { ...newProduct }
    }
  },
  { immediate: true },
)

const validate = async () => {
  const isValid = await formRef.value?.validate()
  if (isValid) {
    return form.value
  }
  return null
}

const handleSubmit = () => {
  emit('submit', form.value)
}

defineExpose({
  validate,
})
</script>
