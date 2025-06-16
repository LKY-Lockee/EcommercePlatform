<template>
  <div class="checkout">
    <va-container>
      <h1 class="page-title">结算</h1>

      <va-row :gutter="24">
        <!-- 左侧：订单信息 -->
        <va-column :xs="12" :lg="8">
          <!-- 收货地址 -->
          <va-card class="section-card">
            <va-card-title>
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
                <p>请选择收货地址</p>
                <va-button @click="showAddressDialog = true"> 选择地址 </va-button>
              </div>
            </va-card-content>
          </va-card>

          <!-- 商品清单 -->
          <va-card class="section-card">
            <va-card-title>
              <va-icon name="shopping_cart" class="title-icon" />
              商品清单
            </va-card-title>
            <va-card-content>
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <va-avatar :src="item.image_url || '/placeholder.png'" size="small" square />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-meta">¥{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
                </div>
                <div class="item-total">¥{{ formatPrice(item.total_price) }}</div>
              </div>
            </va-card-content>
          </va-card>

          <!-- 支付方式 -->
          <va-card class="section-card">
            <va-card-title>
              <va-icon name="payment" class="title-icon" />
              支付方式
            </va-card-title>
            <va-card-content>
              <va-radio v-model="paymentMethod" :options="paymentOptions" value-by="value" />
            </va-card-content>
          </va-card>
        </va-column>

        <!-- 右侧：订单摘要 -->
        <va-column :xs="12" :lg="4">
          <va-card class="order-summary" sticky>
            <va-card-title>订单摘要</va-card-title>
            <va-card-content>
              <div class="summary-row">
                <span>商品金额</span>
                <span>¥{{ formatPrice(subtotal) }}</span>
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
                :loading="submitting"
                :disabled="!canSubmit"
                @click="handleSubmitOrder"
              >
                提交订单
              </va-button>
            </va-card-content>
          </va-card>
        </va-column>
      </va-row>
    </va-container>

    <!-- 地址选择对话框 -->
    <va-modal v-model="showAddressDialog" title="选择收货地址">
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
        <va-button @click="showAddressDialog = false"> 取消 </va-button>
        <va-button :disabled="!selectedAddress" @click="confirmAddress"> 确认 </va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
// import { useUserStore } from '@/stores/user'
import { getCart, type CartItem } from '@/api/cart'
import { createOrder } from '@/api/order'
import type { Address } from '@/api/user'

const router = useRouter()
const cartStore = useCartStore()
// const userStore = useUserStore()

const cartItems = ref<CartItem[]>([])
const addresses = ref<Address[]>([])
const selectedAddress = ref<Address | null>(null)
const paymentMethod = ref('alipay')
const submitting = ref(false)
const showAddressDialog = ref(false)

const paymentOptions = [
  { text: '支付宝', value: 'alipay' },
  { text: '微信支付', value: 'wechat' },
  { text: '银行卡', value: 'bankcard' },
]

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.total_price, 0)
})

const shippingFee = computed(() => {
  // 简单的运费计算：满100免运费
  return subtotal.value >= 100 ? 0 : 10
})

const total = computed(() => {
  return subtotal.value + shippingFee.value
})

const canSubmit = computed(() => {
  return selectedAddress.value && cartItems.value.length > 0 && !submitting.value
})

const loadCart = async () => {
  try {
    const response = await getCart()
    cartItems.value = response.data
  } catch (error) {
    console.error('加载购物车失败:', error)
  }
}

const loadAddresses = async () => {
  try {
    // TODO: 从 API 加载用户地址
    addresses.value = []
    // 模拟一些地址数据
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

    // 默认选择默认地址
    selectedAddress.value =
      addresses.value.find((addr) => addr.is_default) || addresses.value[0] || null
  } catch (error) {
    console.error('加载地址失败:', error)
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
      cart_items: cartItems.value.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }

    const response = await createOrder(orderData)

    // 清空购物车
    cartStore.clearCart()

    // 跳转到支付页面
    router.push(`/payment/${response.data.order.id}`)
  } catch (error) {
    console.error('创建订单失败:', error)
  } finally {
    submitting.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

onMounted(() => {
  loadCart()
  loadAddresses()
})
</script>

<style scoped>
.checkout {
  padding: 20px 0;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-title {
  text-align: center;
  margin-bottom: 32px;
  color: var(--va-primary);
}

.section-card {
  margin-bottom: 20px;
}

.title-icon {
  margin-right: 8px;
}

.address-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.address-item:hover {
  border-color: var(--va-primary);
}

.address-item.selected {
  border-color: var(--va-primary);
  background-color: rgba(var(--va-primary-rgb), 0.05);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.name {
  font-weight: 600;
}

.phone {
  color: var(--va-secondary);
}

.address-detail {
  color: var(--va-secondary);
  font-size: 14px;
}

.no-address {
  text-align: center;
  padding: 40px 0;
  color: var(--va-secondary);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  margin-left: 12px;
}

.item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 14px;
  color: var(--va-secondary);
}

.item-total {
  font-weight: 600;
  color: var(--va-primary);
}

.order-summary {
  position: sticky;
  top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
}

.total-amount {
  color: var(--va-primary);
}

.submit-btn {
  margin-top: 24px;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-list .address-item {
  margin-bottom: 12px;
}
</style>
