<template>
  <div class="addresses-view">
    <div class="addresses-header">
      <h2 class="page-title">收货地址</h2>
      <va-button @click="showAddDialog = true">
        <va-icon name="add" />
        添加地址
      </va-button>
    </div>

    <!-- 地址列表 -->
    <div class="addresses-list">
      <div v-if="loading" class="loading-state">
        <va-progress-circle indeterminate />
        <p>加载中...</p>
      </div>

      <div v-else-if="addresses.length === 0" class="empty-state">
        <va-icon name="location_on" size="3rem" color="secondary" />
        <h3>暂无收货地址</h3>
        <p>添加您的第一个收货地址</p>
      </div>

      <va-card
        v-else
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'default-address': address.is_default }"
      >
        <va-card-content>
          <div class="address-header">
            <div class="address-info">
              <div class="contact-info">
                <span class="contact-name">{{ address.name }}</span>
                <span class="contact-phone">{{ address.phone }}</span>
              </div>
              <va-chip v-if="address.is_default" color="primary" size="small"> 默认 </va-chip>
            </div>
            <div class="address-actions">
              <va-button flat size="small" @click="editAddress(address)">编辑</va-button>
              <va-button
                flat
                size="small"
                color="danger"
                :loading="deleteLoading === address.id"
                @click="handleDeleteAddress(address.id)"
              >
                删除
              </va-button>
            </div>
          </div>

          <div class="address-detail">
            {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
          </div>

          <div v-if="!address.is_default" class="address-footer">
            <va-button
              flat
              size="small"
              :loading="defaultLoading === address.id"
              @click="handleSetDefaultAddress(address.id)"
            >
              设为默认
            </va-button>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- 添加/编辑地址对话框 -->
    <va-modal v-model="showAddDialog" size="medium" hide-default-actions>
      <template #header>
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? '编辑收货地址' : '添加收货地址' }}</h3>
        </div>
      </template>

      <div class="modal-content">
        <va-form ref="formRef">
          <div class="form-grid">
            <va-input v-model="addressForm.name" label="收货人姓名" :rules="[required]" outline />
            <va-input
              v-model="addressForm.phone"
              label="手机号"
              :rules="[required, phoneRule]"
              outline
            />
          </div>

          <div class="form-grid">
            <va-select
              v-model="addressForm.province"
              label="省份"
              :options="provinces"
              :rules="[required]"
              outline
              @update:model-value="onProvinceChange"
            />
            <va-select
              v-model="addressForm.city"
              label="城市"
              :options="cities"
              :rules="[required]"
              outline
              @update:model-value="onCityChange"
            />
            <va-select
              v-model="addressForm.district"
              label="区县"
              :options="districts"
              :rules="[required]"
              outline
            />
          </div>

          <va-textarea
            v-model="addressForm.detail"
            label="详细地址"
            :rules="[required]"
            outline
            :autosize="true"
            placeholder="请输入详细地址，如街道、门牌号等"
          />

          <div class="form-footer">
            <va-checkbox v-model="addressForm.is_default" label="设为默认地址" />
          </div>
        </va-form>
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button @click="resetForm">取消</va-button>
          <va-button
            color="primary"
            :loading="saveLoading"
            :disabled="!isFormValid"
            @click="handleSaveAddress"
          >
            {{ isEditing ? '更新' : '保存' }}
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress as deleteAddressAPI,
  setDefaultAddress as setDefaultAddressAPI,
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  type Address,
  type CreateAddressData,
} from '@/api/address'

const showAddDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const loading = ref(false)
const saveLoading = ref(false)
const deleteLoading = ref<number | null>(null)
const defaultLoading = ref<number | null>(null)
const formRef = ref()

const addresses = ref<Address[]>([])
const provinces = ref<string[]>([])
const cities = ref<string[]>([])
const districts = ref<string[]>([])

const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
})

// 验证规则
const required = (value: unknown) => !!value || '此字段是必填的'
const phoneRule = (value: string) => /^1[3-9]\d{9}$/.test(value) || '请输入有效的手机号'

// 计算表单是否有效
const isFormValid = computed(() => {
  const form = addressForm.value
  return !!(
    form.name &&
    form.phone &&
    phoneRule(form.phone) === true &&
    form.province &&
    form.city &&
    form.district &&
    form.detail
  )
})

// 加载地址列表
const loadAddresses = async () => {
  loading.value = true
  try {
    const response = await getAddresses()
    addresses.value = response.data || []
  } catch {
    addresses.value = []
  } finally {
    loading.value = false
  }
}

// 加载省份列表
const loadProvinces = async () => {
  try {
    provinces.value = await getProvinces()
  } catch {
    // Error handled by API layer
  }
}

// 省份改变时加载城市
const onProvinceChange = async (province: string) => {
  addressForm.value.city = ''
  addressForm.value.district = ''
  cities.value = []
  districts.value = []

  if (province) {
    try {
      cities.value = await getCitiesByProvince(province)
    } catch {
      // Error handled by API layer
    }
  }
}

// 城市改变时加载区县
const onCityChange = async (city: string) => {
  addressForm.value.district = ''
  districts.value = []

  if (city) {
    try {
      districts.value = await getDistrictsByCity(city)
    } catch {
      // Error handled by API layer
    }
  }
}

// 重置表单
const resetForm = () => {
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    is_default: false,
  }
  cities.value = []
  districts.value = []
  isEditing.value = false
  editingId.value = null
  showAddDialog.value = false
}

// 编辑地址
const editAddress = async (address: Address) => {
  addressForm.value = { ...address }

  // 加载对应的城市和区县
  if (address.province) {
    cities.value = await getCitiesByProvince(address.province)
  }
  if (address.city) {
    districts.value = await getDistrictsByCity(address.city)
  }

  isEditing.value = true
  editingId.value = address.id
  showAddDialog.value = true
}

// 保存地址
const handleSaveAddress = async () => {
  if (!isFormValid.value) return

  saveLoading.value = true
  try {
    const addressData: CreateAddressData = {
      name: addressForm.value.name,
      phone: addressForm.value.phone,
      province: addressForm.value.province,
      city: addressForm.value.city,
      district: addressForm.value.district,
      detail: addressForm.value.detail,
      is_default: addressForm.value.is_default,
    }

    if (isEditing.value && editingId.value) {
      await updateAddress(editingId.value, addressData)
    } else {
      await createAddress(addressData)
    }

    await loadAddresses()
    resetForm()
  } catch {
    // Error handled by API layer
  } finally {
    saveLoading.value = false
  }
}

// 删除地址
const handleDeleteAddress = async (addressId: number) => {
  deleteLoading.value = addressId
  try {
    await deleteAddressAPI(addressId)
    await loadAddresses()
  } catch {
    // Error handled by API layer
  } finally {
    deleteLoading.value = null
  }
}

// 设置默认地址
const handleSetDefaultAddress = async (addressId: number) => {
  defaultLoading.value = addressId
  try {
    await setDefaultAddressAPI(addressId)
    await loadAddresses()
  } catch {
    // Error handled by API layer
  } finally {
    defaultLoading.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadAddresses(), loadProvinces()])
})
</script>

<style scoped>
.addresses-view {
  max-width: 800px;
}

.addresses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--va-text-primary);
}

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--va-text-primary);
}

.empty-state p {
  color: var(--va-text-secondary);
}

.address-card {
  transition: box-shadow 0.3s ease;
}

.address-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.address-card.default-address {
  border: 2px solid var(--va-primary);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.contact-phone {
  color: var(--va-text-secondary);
  font-size: 0.9rem;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
}

.address-detail {
  color: var(--va-text-primary);
  line-height: 1.5;
}

.address-footer {
  padding-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 模态框样式优化 */
.modal-header {
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.modal-content {
  padding: 1.5rem 0.5rem 0.5rem 0.5rem;
}

.form-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-start;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .addresses-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .address-header {
    flex-direction: column;
    gap: 1rem;
  }

  .address-actions {
    justify-content: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 1rem 1rem 0 1rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer .va-button {
    width: 100%;
  }
}
</style>
