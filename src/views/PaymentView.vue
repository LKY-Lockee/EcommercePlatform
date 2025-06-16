<template>
  <div class="payment">
    <va-container>
      <div class="payment-container">
        <va-card class="payment-card">
          <va-card-content>
            <div class="payment-header">
              <va-icon name="payment" size="large" color="primary" />
              <h2>订单支付</h2>
            </div>

            <div v-if="order" class="order-info">
              <div class="info-row">
                <span class="label">订单号：</span>
                <span class="value">{{ order.order_number }}</span>
              </div>
              <div class="info-row">
                <span class="label">支付金额：</span>
                <span class="amount">¥{{ formatPrice(order.total_amount) }}</span>
              </div>
              <div class="info-row">
                <span class="label">支付方式：</span>
                <span class="value">{{ getPaymentMethodText(order.payment_method) }}</span>
              </div>
            </div>

            <div class="payment-section">
              <h3>请选择支付方式</h3>
              <div class="payment-methods">
                <div
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="payment-method"
                  :class="{ active: selectedMethod === method.value }"
                  @click="selectedMethod = method.value"
                >
                  <va-icon :name="method.icon" size="large" />
                  <span>{{ method.name }}</span>
                </div>
              </div>
            </div>

            <div class="payment-actions">
              <va-button preset="secondary" @click="goBack"> 返回订单 </va-button>
              <va-button :loading="paying" @click="handlePay"> 立即支付 </va-button>
            </div>
          </va-card-content>
        </va-card>

        <!-- 支付成功对话框 -->
        <va-modal
          v-model="showSuccessDialog"
          title="支付成功"
          :closeable="false"
          hide-default-actions
        >
          <div class="success-content">
            <va-icon name="check_circle" size="4rem" color="success" />
            <h3>支付成功！</h3>
            <p>您的订单已支付完成，我们将尽快为您发货。</p>
          </div>
          <template #footer>
            <va-button @click="goToOrders"> 查看订单 </va-button>
            <va-button @click="goToHome"> 继续购物 </va-button>
          </template>
        </va-modal>
      </div>
    </va-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, payOrder, type Order } from '@/api/order'

const route = useRoute()
const router = useRouter()

const order = ref<Order | null>(null)
const selectedMethod = ref('alipay')
const paying = ref(false)
const showSuccessDialog = ref(false)

const paymentMethods = [
  { value: 'alipay', name: '支付宝', icon: 'account_balance_wallet' },
  { value: 'wechat', name: '微信支付', icon: 'payment' },
  { value: 'bankcard', name: '银行卡', icon: 'credit_card' },
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

    // 模拟支付延迟
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await payOrder(order.value.id)

    showSuccessDialog.value = true
  } catch (error) {
    console.error('支付失败:', error)
  } finally {
    paying.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

const getPaymentMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bankcard: '银行卡',
  }
  return methodMap[method] || method
}

const goBack = () => {
  router.go(-1)
}

const goToOrders = () => {
  router.push('/user/orders')
}

const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.payment {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 0;
  display: flex;
  align-items: center;
}

.payment-container {
  max-width: 600px;
  margin: 0 auto;
}

.payment-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 32px;
}

.payment-header h2 {
  margin: 16px 0 0 0;
  color: var(--va-primary);
}

.order-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--va-secondary);
}

.value {
  font-weight: 500;
}

.amount {
  font-size: 20px;
  font-weight: bold;
  color: var(--va-primary);
}

.payment-section h3 {
  margin-bottom: 20px;
  color: var(--va-text-primary);
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method:hover {
  border-color: var(--va-primary);
}

.payment-method.active {
  border-color: var(--va-primary);
  background-color: rgba(var(--va-primary-rgb), 0.05);
}

.payment-method span {
  margin-top: 8px;
  font-weight: 500;
}

.payment-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-content h3 {
  margin: 16px 0 8px 0;
  color: var(--va-success);
}

.success-content p {
  color: var(--va-secondary);
  margin-bottom: 0;
}
</style>
