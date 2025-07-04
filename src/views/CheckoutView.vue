<template>
  <div class="checkout">
    <div class="checkout-container">
      <div class="page-header">
        <h1 class="page-title">订单结算</h1>
        <p class="page-subtitle">请确认您的订单信息并选择支付方式</p>
      </div>

      <!-- 收货地址 -->
      <va-card class="section-card">
        <va-card-title class="section-title">
          <va-icon name="location_on" class="title-icon" />
          收货地址
        </va-card-title>
        <va-card-content>
          <div v-if="selectedAddress" class="address-item selected">
            <div class="address-header">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
            </div>
            <div class="address-detail">
              {{ selectedAddress.province }} {{ selectedAddress.city }}
              {{ selectedAddress.district }} {{ selectedAddress.detail }}
            </div>
            <va-button preset="secondary" size="small" @click="showAddressDialog = true">
              更换地址
            </va-button>
          </div>
          <div v-else class="no-address">
            <va-icon name="location_off" size="2rem" color="secondary" />
            <p>请选择收货地址</p>
            <va-button @click="showAddressDialog = true"> 选择地址 </va-button>
          </div>
        </va-card-content>
      </va-card>

      <!-- 商品清单 -->
      <va-card class="section-card">
        <va-card-title class="section-title">
          <va-icon name="shopping_cart" class="title-icon" />
          商品清单
          <span class="item-count">(共{{ cartStore.selectedItems.length }}件商品)</span>
        </va-card-title>
        <va-card-content class="section-content">
          <div v-for="item in cartStore.selectedItems" :key="item.id" class="cart-item">
            <va-avatar :src="item.image" size="large" square />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-meta">
                ¥{{ formatPrice(Number(item.price)) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="item-total">¥{{ formatPrice(Number(item.price) * item.quantity) }}</div>
          </div>
        </va-card-content>
      </va-card>

      <!-- 订单摘要 -->
      <va-card class="order-summary" sticky>
        <va-card-title class="section-title">订单摘要</va-card-title>
        <va-card-content class="section-content">
          <div class="summary-row">
            <span>商品金额</span>
            <span>¥{{ formatPrice(cartStore.totalAmount) }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span>¥{{ formatPrice(shippingFee) }}</span>
          </div>
          <va-divider />
          <div class="summary-row total">
            <span>总计</span>
            <span class="total-amount">¥{{ formatPrice(total) }}</span>
          </div>

          <va-button
            class="submit-btn"
            block
            size="large"
            :loading="submitting"
            :disabled="!canSubmit"
            @click="handleSubmitOrder"
          >
            提交订单
          </va-button>
        </va-card-content>
      </va-card>
    </div>

    <!-- 地址选择对话框 -->
    <va-modal v-model="showAddressDialog" hide-default-actions>
      <template #header>
        <div class="modal-header">
          <h3 class="modal-title">选择收货地址</h3>
        </div>
      </template>
      <div class="address-list">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          :class="{ selected: selectedAddress?.id === address.id }"
          @click="selectAddress(address)"
        >
          <div class="address-header">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
            <va-chip v-if="address.is_default" color="primary" small>默认</va-chip>
          </div>
          <div class="address-detail">
            {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <va-button @click="showAddressDialog = false"> 取消 </va-button>
          <va-button :disabled="!selectedAddress" @click="confirmAddress"> 确认 </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api/order'
import { getUserAddresses } from '@/api/user'
import type { Address } from '@/types'

const router = useRouter()
const cartStore = useCartStore()

const addresses = ref<Address[]>([])
const selectedAddress = ref<Address | null>(null)
const paymentMethod = ref('alipay')
const submitting = ref(false)
const showAddressDialog = ref(false)

const shippingFee = computed(() => (cartStore.totalAmount >= 100 ? 0 : 10))

const total = computed(() => cartStore.totalAmount + shippingFee.value)

const canSubmit = computed(
  () => selectedAddress.value && cartStore.selectedItems.length > 0 && !submitting.value,
)

const loadAddresses = async () => {
  try {
    const response = await getUserAddresses()
    addresses.value = response.data
    selectedAddress.value =
      addresses.value.find((addr: Address) => addr.is_default) || addresses.value[0] || null
  } catch (error) {
    console.error('加载地址失败:', error)
    addresses.value = [
      {
        id: 1,
        user_id: 1,
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '三里屯街道工人体育场北路',
        is_default: true,
        created_at: new Date().toISOString(),
      },
    ]
    selectedAddress.value = addresses.value[0] || null
  }
}

const selectAddress = (address: Address) => {
  selectedAddress.value = address
}

const confirmAddress = () => {
  showAddressDialog.value = false
}

const handleSubmitOrder = async () => {
  if (!canSubmit.value) return

  try {
    submitting.value = true

    const orderData = {
      shipping_address: `${selectedAddress.value!.name} ${selectedAddress.value!.phone} ${selectedAddress.value!.province} ${selectedAddress.value!.city} ${selectedAddress.value!.district} ${selectedAddress.value!.detail}`,
      payment_method: paymentMethod.value,
      cart_items: cartStore.selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }

    const response = await createOrder(orderData)
    console.log(response.data)
    router.push(`/payment/${response.data.id}`)
  } catch (error) {
    console.error('创建订单失败:', error)
  } finally {
    submitting.value = false
  }
}

const formatPrice = (price: number) => {
  return price.toFixed(2)
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  padding: 2rem 0;
}

.checkout-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--va-text-secondary);
  margin: 0;
  font-weight: 400;
}

.section-card {
  margin-bottom: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
  display: flex;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.title-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  color: var(--va-primary);
}

.item-count {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--va-text-secondary);
}

.section-content {
  padding: 2rem;
}

.address-item {
  padding: 1rem;
  margin-top: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.address-item:hover {
  border-color: var(--va-primary);
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.15);
}

.address-item.selected {
  border-color: var(--va-primary);
  background-color: rgba(var(--va-primary-rgb), 0.03);
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.15);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--va-text-primary);
}

.phone {
  color: var(--va-text-secondary);
  font-size: 0.95rem;
}

.address-detail {
  color: var(--va-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.address-detail:not(:last-child) {
  margin-bottom: 1rem;
}

.no-address {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--va-text-secondary);
}

.no-address .va-icon {
  margin-bottom: 1rem;
}

.no-address p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.cart-item:first-child {
  padding-top: 0;
}

.cart-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.item-info {
  flex: 1;
  margin-left: 1rem;
}

.item-name {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--va-text-primary);
  line-height: 1.4;
}

.item-meta {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.item-total {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--va-primary);
}

.order-summary {
  position: sticky;
  top: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  padding-top: 1rem;
}

.total-amount {
  color: var(--va-danger);
  font-weight: 700;
}

.submit-btn {
  margin-top: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.75rem;
}

.modal-header {
  padding: 0.5rem 0.5rem 0 0.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-list .address-item {
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-container {
    padding: 0 0.75rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
    padding: 1rem 1rem 0 1rem;
  }

  .cart-item {
    flex-direction: column;
    text-align: center;
    padding: 1rem 0;
  }

  .item-info {
    margin: 0.75rem 0;
  }

  .order-summary {
    position: static;
    margin-top: 1rem;
  }
}
</style>
