import express, { Response } from 'express'
import { pool } from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()

// 创建订单
router.post(
  '/create',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { shipping_address, payment_method, cart_items } = req.body

      if (!shipping_address || !cart_items || cart_items.length === 0) {
        res.status(400).json({ message: '订单信息不完整' })
        return
      }

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // 计算总金额并验证库存
        let total_amount = 0
        const orderItems: Array<{
          product_id: number
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }> = []

        for (const item of cart_items) {
          const [productRows] = await connection.execute(
            'SELECT id, name, price, stock FROM products WHERE id = ?',
            [item.product_id],
          )

          const products = productRows as Array<{
            id: number
            name: string
            price: number
            stock: number
          }>
          if (products.length === 0) {
            throw new Error(`商品ID ${item.product_id} 不存在`)
          }

          const product = products[0]
          if (product.stock < item.quantity) {
            throw new Error(`商品 ${product.name} 库存不足`)
          }

          const subtotal = product.price * item.quantity
          total_amount += subtotal

          orderItems.push({
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            quantity: item.quantity,
            subtotal,
          })
        }

        // 生成订单号
        const order_number = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5)

        // 创建订单
        const [orderResult] = await connection.execute(
          'INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
          [req.user!.id, order_number, 'pending', total_amount, shipping_address, payment_method],
        )

        const orderId = (orderResult as { insertId: number }).insertId

        // 创建订单详情
        for (const item of orderItems) {
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
            [
              orderId,
              item.product_id,
              item.product_name,
              item.product_price,
              item.quantity,
              item.subtotal,
            ],
          )

          // 减少库存
          await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [
            item.quantity,
            item.product_id,
          ])
        }

        await connection.commit()
        connection.release()

        res.status(201).json({
            id: orderId,
            order_number,
            total_amount,
            status: 'pending',
        })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      res.status(500).json({ message: error instanceof Error ? error.message : '创建订单失败' })
    }
  },
)

// 获取用户订单列表
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 获取订单基本信息
    const [orderRows] = await pool.execute(
      `
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [req.user!.id],
    )

    const orders = orderRows as Array<{
      id: number
      order_number: string
      status: string
      total_amount: number
      shipping_address: string
      payment_method: string
      payment_status: string
      created_at: string
    }>

    // 为每个订单获取订单项目
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [
          order.id,
        ])
        return {
          ...order,
          items: itemRows,
        }
      }),
    )

    res.json(ordersWithItems)
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({ message: '获取订单列表失败' })
  }
})

// 获取订单详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 获取订单基本信息
    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      id,
      req.user!.id,
    ])

    const orders = orderRows as Array<{
      id: number
      order_number: string
      status: string
      total_amount: number
      created_at: string
      items?: unknown[]
    }>
    if (orders.length === 0) {
      res.status(404).json({ message: '订单不存在' })
      return
    }

    // 获取订单详情
    const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [id])

    const order = orders[0]
    order.items = itemRows as unknown[]

    res.json(order)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    res.status(500).json({ message: '获取订单详情失败' })
  }
})

// 取消订单
router.put(
  '/:id/cancel',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // 检查订单状态
        const [orderRows] = await connection.execute(
          'SELECT status FROM orders WHERE id = ? AND user_id = ?',
          [id, req.user!.id],
        )

        const orders = orderRows as Array<{ status: string }>
        if (orders.length === 0) {
          throw new Error('订单不存在')
        }

        const order = orders[0]
        if (order.status !== 'pending') {
          throw new Error('只能取消待支付的订单')
        }

        // 恢复库存
        const [itemRows] = await connection.execute(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [id],
        )

        const items = itemRows as Array<{ product_id: number; quantity: number }>
        for (const item of items) {
          await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [
            item.quantity,
            item.product_id,
          ])
        }

        // 更新订单状态
        await connection.execute('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id])

        await connection.commit()
        connection.release()

        res.json({ message: '订单已取消' })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      res.status(500).json({ message: error instanceof Error ? error.message : '取消订单失败' })
    }
  },
)

// 模拟支付
router.put(
  '/:id/pay',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      // 检查订单状态
      const [orderRows] = await pool.execute(
        'SELECT status FROM orders WHERE id = ? AND user_id = ?',
        [id, req.user!.id],
      )

      const orders = orderRows as Array<{ status: string }>
      if (orders.length === 0) {
        res.status(404).json({ message: '订单不存在' })
        return
      }

      const order = orders[0]
      if (order.status !== 'pending') {
        res.status(400).json({ message: '订单状态不正确' })
        return
      }

      // 更新订单状态
      await pool.execute('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [
        'paid',
        'paid',
        id,
      ])

      // 支付成功后清空购物车
      await pool.execute('DELETE FROM cart WHERE user_id = ?', [req.user!.id])

      res.json({ message: '支付成功' })
    } catch (error) {
      console.error('支付失败:', error)
      res.status(500).json({ message: '支付失败' })
    }
  },
)

// 确认收货
router.put(
  '/:id/confirm',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      // 检查订单状态
      const [orderRows] = await pool.execute(
        'SELECT status FROM orders WHERE id = ? AND user_id = ?',
        [id, req.user!.id],
      )

      const orders = orderRows as Array<{ status: string }>
      if (orders.length === 0) {
        res.status(404).json({ message: '订单不存在' })
        return
      }

      const order = orders[0]
      if (order.status !== 'shipped') {
        res.status(400).json({ message: '只能确认收货已发货的订单' })
        return
      }

      // 更新订单状态
      await pool.execute('UPDATE orders SET status = ? WHERE id = ?', ['delivered', id])

      res.json({ message: '确认收货成功' })
    } catch (error) {
      console.error('确认收货失败:', error)
      res.status(500).json({ message: '确认收货失败' })
    }
  },
)

export default router
