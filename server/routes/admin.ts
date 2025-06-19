import express, { Request, Response } from 'express'
import { pool } from '../config/database'
import { authenticateToken, requireAdmin } from '../middleware/auth'

// 类型定义
interface CountResult {
  count: number
}

interface RevenueResult {
  revenue: number | null
}

interface TotalResult {
  total: number
}

interface InsertResult {
  insertId: number
  affectedRows: number
}

const router = express.Router()

// 所有管理员路由都需要管理员权限
router.use(authenticateToken, requireAdmin)

// 获取管理员仪表板数据
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取统计数据
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "user"',
    )
    const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products')
    const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders')
    const [revenueResult] = await pool.execute(
      'SELECT SUM(total_amount) as revenue FROM orders WHERE payment_status = "paid"',
    )

    // 获取最近订单
    const [recentOrders] = await pool.execute(`
      SELECT o.*, u.username
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `)

    const stats = {
      users: (userCount as CountResult[])[0]?.count || 0,
      products: (productCount as CountResult[])[0]?.count || 0,
      orders: (orderCount as CountResult[])[0]?.count || 0,
      revenue: (revenueResult as RevenueResult[])[0]?.revenue || 0,
      recentOrders,
    }

    res.json(stats)
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    res.status(500).json({ message: '获取统计数据失败' })
  }
})

// 获取所有用户
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = 'SELECT id, username, email, phone, role, created_at FROM users'
    let countQuery = 'SELECT COUNT(*) as total FROM users'
    const params: (string | number)[] = []

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?'
      countQuery += ' WHERE username LIKE ? OR email LIKE ?'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)

    const [users] = await pool.execute(query, params)
    const [countResult] = await pool.execute(
      countQuery,
      search ? [`%${search}%`, `%${search}%`] : [],
    )

    res.json({
      users,
      pagination: {
        current: Number(page),
        total: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
        pageSize: Number(limit),
        totalItems: (countResult as TotalResult[])[0].total,
      },
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ message: '获取用户列表失败' })
  }
})

// 删除用户
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 不能删除管理员
    const [userRows] = await pool.execute('SELECT role FROM users WHERE id = ?', [id])
    const users = userRows as Array<{ role: string }>

    if (users.length === 0) {
      res.status(404).json({ message: '用户不存在' })
      return
    }

    if (users[0].role === 'admin') {
      res.status(403).json({ message: '不能删除管理员账户' })
      return
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id])
    res.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({ message: '删除用户失败' })
  }
})

// 获取所有商品
router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '', category = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      `
    let countQuery = 'SELECT COUNT(*) as total FROM products p'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      conditions.push(`p.name LIKE ?`)
      params.push(`%${search}%`)
    }

    if (category) {
      conditions.push(`p.category_id = ?`)
      params.push(category as string)
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(` AND `)
      query += whereClause
      countQuery += whereClause
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    params.push(String(limit), String(offset))

    const [items] = await pool.execute(query, params)
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2))

    res.json({
      items,
      pagination: {
        current: Number(page),
        total: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
        pageSize: Number(limit),
        totalItems: (countResult as TotalResult[])[0].total,
      },
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.status(500).json({ message: '获取商品列表失败' })
  }
})

// 创建商品
router.post('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category_id, stock, images } = req.body

    if (!name || !price || !category_id) {
      res.status(400).json({ message: '商品名称、价格和分类为必填项' })
      return
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, category_id, stock, images) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, stock || 0, JSON.stringify(images || [])],
    )

    res.status(201).json({
      message: '商品创建成功',
      id: (result as InsertResult).insertId,
    })
  } catch (error) {
    console.error('创建商品失败:', error)
    res.status(500).json({ message: '创建商品失败' })
  }
})

// 更新商品
router.put('/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, price, category_id, stock, images } = req.body

    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ?, images = ? WHERE id = ?',
      [name, description, price, category_id, stock, JSON.stringify(images || []), id],
    )

    res.json({ message: '商品更新成功' })
  } catch (error) {
    console.error('更新商品失败:', error)
    res.status(500).json({ message: '更新商品失败' })
  }
})

// 删除商品
router.delete('/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await pool.execute('DELETE FROM products WHERE id = ?', [id])
    res.json({ message: '商品删除成功' })
  } catch (error) {
    console.error('删除商品失败:', error)
    res.status(500).json({ message: '删除商品失败' })
  }
})

// 获取所有订单
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = `
      SELECT o.*, u.username, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    let countQuery = 'SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (status) {
      conditions.push('o.status = ?')
      params.push(status as string)
    }

    if (search) {
      conditions.push('(o.order_number LIKE ? OR u.username LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ')
      query += whereClause
      countQuery += whereClause
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), offset)

    const [orders] = await pool.execute(query, params)
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2))

    res.json({
      orders,
      pagination: {
        current: Number(page),
        total: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
        pageSize: Number(limit),
        totalItems: (countResult as TotalResult[])[0].total,
      },
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({ message: '获取订单列表失败' })
  }
})

// 更新订单状态
router.put('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      res.status(400).json({ message: '状态不能为空' })
      return
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id])
    res.json({ message: '订单状态更新成功' })
  } catch (error) {
    console.error('更新订单状态失败:', error)
    res.status(500).json({ message: '更新订单状态失败' })
  }
})

export default router
