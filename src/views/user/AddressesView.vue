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
      <div v-if="addresses.length === 0" class="empty-state">
        <va-icon name="location_on" size="3rem" color="secondary" />
        <h3>暂无收货地址</h3>
        <p>添加您的第一个收货地址</p>
      </div>

      <va-card
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'default-address': address.isDefault }"
      >
        <va-card-content>
          <div class="address-header">
            <div class="address-info">
              <div class="contact-info">
                <span class="contact-name">{{ address.name }}</span>
                <span class="contact-phone">{{ address.phone }}</span>
              </div>
              <va-chip v-if="address.isDefault" text="默认" color="primary" size="small" />
            </div>
            <div class="address-actions">
              <va-button flat size="small" @click="editAddress(address)">编辑</va-button>
              <va-button flat size="small" color="danger" @click="deleteAddress(address.id)">
                删除
              </va-button>
            </div>
          </div>

          <div class="address-detail">
            {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
          </div>

          <div v-if="!address.isDefault" class="address-footer">
            <va-button flat size="small" @click="setDefaultAddress(address.id)">
              设为默认
            </va-button>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- 添加/编辑地址对话框 -->
    <va-modal
      v-model="showAddDialog"
      title="添加收货地址"
      size="medium"
      @ok="saveAddress"
      @cancel="resetForm"
    >
      <va-form>
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
          />
          <va-select
            v-model="addressForm.city"
            label="城市"
            :options="cities"
            :rules="[required]"
            outline
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
          placeholder="请输入详细地址，如街道、门牌号等"
        />

        <va-checkbox v-model="addressForm.isDefault" label="设为默认地址" />
      </va-form>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const showAddDialog = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

// 模拟地址数据
const addresses = ref<Address[]>([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '三里屯街道123号',
    isDefault: true,
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴金融中心456号',
    isDefault: false,
  },
])

// 模拟省市区数据
const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省']
const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市']
const districts = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '福田区']

// 验证规则
const required = (value: unknown) => !!value || '此字段是必填的'

const phoneRule = (value: string) => {
  const phonePattern = /^1[3-9]\d{9}$/
  return phonePattern.test(value) || '请输入有效的手机号'
}

const resetForm = () => {
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  }
  isEditing.value = false
  editingId.value = null
}

const editAddress = (address: Address) => {
  addressForm.value = { ...address }
  isEditing.value = true
  editingId.value = address.id
  showAddDialog.value = true
}

const saveAddress = () => {
  if (isEditing.value && editingId.value) {
    const index = addresses.value.findIndex((addr) => addr.id === editingId.value)
    if (index > -1) {
      addresses.value[index] = { ...addressForm.value, id: editingId.value }
    }
  } else {
    const newAddress: Address = {
      ...addressForm.value,
      id: Date.now(),
    }
    addresses.value.push(newAddress)
  }

  if (addressForm.value.isDefault) {
    addresses.value.forEach((addr) => {
      if (addr.id !== editingId.value) {
        addr.isDefault = false
      }
    })
  }

  showAddDialog.value = false
  resetForm()
}

const deleteAddress = (addressId: number) => {
  const index = addresses.value.findIndex((addr) => addr.id === addressId)
  if (index > -1) {
    addresses.value.splice(index, 1)
  }
}

const setDefaultAddress = (addressId: number) => {
  addresses.value.forEach((addr) => {
    addr.isDefault = addr.id === addressId
  })
}

onMounted(() => {
  // 初始化数据
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
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
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
  margin-bottom: 1rem;
}

.address-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--va-background-border);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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
}
</style>
