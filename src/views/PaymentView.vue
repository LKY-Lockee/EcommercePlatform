<template>
  <div class="payment">
    <div class="payment-container">
      <div class="page-header">
        <h1 class="page-title">订单支付</h1>
        <p class="page-subtitle">请确认订单信息并完成支付</p>
      </div>

      <div class="payment-content">
        <!-- 订单信息卡片 -->
        <va-card class="order-card">
          <va-card-title class="section-title">
            <va-icon name="receipt_long" class="title-icon" />
            订单信息
          </va-card-title>
          <va-card-content class="section-content">
            <div v-if="order" class="order-info">
              <div class="info-item">
                <span class="label">订单号</span>
                <span class="value">{{ order.order_number }}</span>
              </div>
              <div class="info-item">
                <span class="label">收货地址</span>
                <span class="value">{{ order.shipping_address }}</span>
              </div>
              <div class="info-item amount-item">
                <span class="label">支付金额</span>
                <span class="amount">¥{{ formatPrice(order.total_amount) }}</span>
              </div>
            </div>
          </va-card-content>
        </va-card>

        <!-- 支付方式选择 -->
        <va-card class="payment-card">
          <va-card-title class="section-title">
            <va-icon name="payment" class="title-icon" />
            选择支付方式
          </va-card-title>
          <va-card-content class="section-content">
            <div class="payment-methods">
              <div
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-method"
                :class="{ active: selectedMethod === method.value }"
                @click="selectedMethod = method.value"
              >
                <div class="method-icon">
                  <va-icon :name="method.icon" size="2rem" />
                </div>
                <div class="method-info">
                  <span class="method-name">{{ method.name }}</span>
                  <span class="method-desc">{{ method.description }}</span>
                </div>
                <div class="method-check">
                  <va-icon
                    v-if="selectedMethod === method.value"
                    name="check_circle"
                    color="primary"
                  />
                  <va-icon v-else name="radio_button_unchecked" color="secondary" />
                </div>
              </div>
            </div>
          </va-card-content>
        </va-card>

        <!-- 支付按钮 -->
        <div class="payment-actions">
          <va-button preset="secondary" size="large" @click="goBack">
            <va-icon name="arrow_back" />
            返回订单
          </va-button>
          <va-button
            color="primary"
            size="large"
            :loading="paying"
            :disabled="!order"
            @click="handlePay"
          >
            <va-icon name="payment" />
            立即支付 ¥{{ order ? formatPrice(order.total_amount) : '0.00' }}
          </va-button>
        </div>
      </div>

      <!-- 支付成功对话框 -->
      <va-modal
        v-model="showSuccessDialog"
        title=""
        :closeable="false"
        hide-default-actions
        :no-dismiss="true"
        size="small"
      >
        <div class="success-content">
          <div class="success-icon">
            <va-icon name="check_circle" size="4rem" color="success" />
          </div>
          <h3 class="success-title">支付成功！</h3>
          <p class="success-message">您的订单已支付完成，我们将尽快为您发货。</p>
          <div class="success-order-info">
            <span>订单号：{{ order?.order_number }}</span>
          </div>
        </div>
        <template #footer>
          <div class="success-actions">
            <va-button preset="secondary" @click="goToHome">
              <va-icon name="home" />
              继续购物
            </va-button>
            <va-button color="primary" @click="goToOrders">
              <va-icon name="receipt_long" />
              查看订单
            </va-button>
          </div>
        </template>
      </va-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, payOrder } from '@/api/order'
import type { Order } from '@/types'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const order = ref<Order | null>(null)
const selectedMethod = ref('alipay')
const paying = ref(false)
const showSuccessDialog = ref(false)

const paymentMethods = [
  {
    value: 'alipay',
    name: '支付宝',
    icon: 'account_balance_wallet',
    description: '推荐有支付宝账户的用户使用',
  },
  {
    value: 'wechat',
    name: '微信支付',
    icon: 'payment',
    description: '微信用户首选支付方式',
  },
  {
    value: 'bankcard',
    name: '银行卡',
    icon: 'credit_card',
    description: '支持各大银行储蓄卡及信用卡',
  },
]

const loadOrder = async () => {
  try {
    const orderId = parseInt(route.params.id as string)
    const response = await getOrderDetail(orderId)
    order.value = response.data
  } catch (error) {
    console.error('加载订单失败:', error)
    router.push('/user/orders')
  }
}

const handlePay = async () => {
  if (!order.value) return

  try {
    paying.value = true
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await payOrder(order.value.id)
    await cartStore.getCart()
    showSuccessDialog.value = true
  } catch (error) {
    console.error('支付失败:', error)
  } finally {
    paying.value = false
  }
}

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const goBack = () => router.go(-1)
const goToOrders = () => router.push('/user/orders')
const goToHome = () => router.push('/')

onMounted(loadOrder)
</script>

<style scoped>
.payment {
  min-height: 100vh;
  padding: 2rem 0;
}

.payment-container {
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

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.order-card,
.payment-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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

.section-content {
  padding: 2rem;
}

.title-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  color: var(--va-primary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item.amount-item {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--va-primary);
}

.label {
  color: var(--va-text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.value {
  font-weight: 500;
  color: var(--va-text-primary);
  max-width: 60%;
  text-align: right;
  word-break: break-word;
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--va-danger);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.payment-method:hover {
  border-color: var(--va-primary);
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.15);
}

.payment-method.active {
  border-color: var(--va-primary);
  background: rgba(var(--va-primary-rgb), 0.03);
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.2);
}

.method-icon {
  margin-right: 1rem;
  color: var(--va-primary);
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.method-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--va-text-primary);
}

.method-desc {
  font-size: 0.9rem;
  color: var(--va-text-secondary);
}

.method-check {
  margin-left: 1rem;
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.payment-actions .va-button {
  min-width: 140px;
  font-weight: 600;
  border-radius: 8px;
}

.success-content {
  text-align: center;
  padding: 2rem 1rem;
}

.success-icon {
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--va-success);
}

.success-message {
  color: var(--va-text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.success-order-info {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--va-text-secondary);
  margin-bottom: 1rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.success-actions .va-button {
  min-width: 120px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-container {
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

  .payment-method {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .method-icon {
    margin-right: 0;
    margin-bottom: 0.75rem;
  }

  .method-check {
    margin-left: 0;
    margin-top: 0.75rem;
  }

  .payment-actions {
    flex-direction: column;
  }

  .payment-actions .va-button {
    width: 100%;
  }

  .success-actions {
    flex-direction: column;
  }

  .success-actions .va-button {
    width: 100%;
  }

  .value {
    max-width: 50%;
    font-size: 0.9rem;
  }

  .amount {
    font-size: 1.25rem;
  }
}
</style>
