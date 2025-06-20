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

interface CategoryRow {
  id: number
  name: string
  description?: string
  image?: string
  created_at: string
}

interface OrderRow {
  id: number
  order_number: string
  user_id: number
  status: string
  total_amount: number
  created_at: string
  username?: string
  email?: string
  avatar?: string
}

interface UserRow {
  role: string
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
    const params: string[] = []

    if (search) {
      query += ' WHERE username LIKE ? OR email LIKE ?'
      countQuery += ' WHERE username LIKE ? OR email LIKE ?'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(String(limit), String(offset))

    const [items] = await pool.execute(query, params)
    const [countResult] = await pool.execute(
      countQuery,
      search ? [`%${search}%`, `%${search}%`] : [],
    )

    res.json({
      items,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: (countResult as TotalResult[])[0].total,
        total_pages: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
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
    const users = userRows as UserRow[]

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
    const { page = 1, limit = 20, search = '', category_id = '' } = req.query
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

    if (category_id) {
      conditions.push(`p.category_id = ?`)
      params.push(category_id as string)
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
        current_page: Number(page),
        per_page: Number(limit),
        total: (countResult as TotalResult[])[0].total,
        total_pages: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
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
    const { name, description, price, category_id, stock, image } = req.body

    if (!name || !price || !category_id) {
      res.status(400).json({ message: '商品名称、价格和分类为必填项' })
      return
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, category_id, stock, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, stock || 0, image],
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
    const {
      name,
      description,
      price,
      original_price,
      stock,
      category_id,
      brand,
      sku,
      featured,
      image,
    } = req.body

    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, stock = ?, category_id = ?, brand = ?, sku = ?, featured = ?, image = ? WHERE id = ?',
      [
        name,
        description,
        price,
        original_price,
        stock,
        category_id,
        brand,
        sku,
        featured,
        image,
        id,
      ],
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
      SELECT o.*, u.username, u.email, u.avatar
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    let countQuery = 'SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id'
    const conditions: string[] = []
    const params: string[] = []

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
    params.push(String(limit), String(offset))

    const [orders] = await pool.execute(query, params)
    const [countResult] = await pool.execute(countQuery, params.slice(0, -2))

    // 格式化订单数据，将用户信息组装为对象
    const formattedOrders = (orders as OrderRow[]).map((order) => {
      const { username, email, avatar, ...orderData } = order
      return {
        ...orderData,
        user: {
          username,
          email,
          avatar,
        },
      }
    })

    res.json({
      items: formattedOrders,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total: (countResult as TotalResult[])[0].total,
        total_pages: Math.ceil((countResult as TotalResult[])[0].total / Number(limit)),
      },
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({ message: '获取订单列表失败' })
  }
})

// 获取订单详情
router.get('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const [orders] = await pool.execute(
      `
      SELECT o.*, u.username, u.email, u.avatar
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [id],
    )

    const orderList = orders as OrderRow[]
    if (orderList.length === 0) {
      res.status(404).json({ message: '订单不存在' })
      return
    }

    const order = orderList[0]
    const { username, email, avatar, ...orderData } = order
    const orderWithUser = {
      ...orderData,
      user: {
        username,
        email,
        avatar,
      },
    }

    res.json(orderWithUser)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    res.status(500).json({ message: '获取订单详情失败' })
  }
})

// 更新订单
router.put('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      res.status(400).json({ message: '状态不能为空' })
      return
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id])

    // 返回更新后的订单信息
    const [orders] = await pool.execute(
      `
      SELECT o.*, u.username, u.email, u.avatar
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [id],
    )

    const orderList = orders as OrderRow[]
    if (orderList.length === 0) {
      res.status(404).json({ message: '订单不存在' })
      return
    }

    const order = orderList[0]
    const { username, email, avatar, ...orderData } = order
    const orderWithUser = {
      ...orderData,
      user: {
        username,
        email,
        avatar,
      },
    }

    res.json(orderWithUser)
  } catch (error) {
    console.error('更新订单失败:', error)
    res.status(500).json({ message: '更新订单失败' })
  }
})

// 删除订单
router.delete('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 检查订单是否存在
    const [existingOrders] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id])

    if ((existingOrders as OrderRow[]).length === 0) {
      res.status(404).json({ message: '订单不存在' })
      return
    }

    await pool.execute('DELETE FROM orders WHERE id = ?', [id])
    res.json({ message: '订单删除成功' })
  } catch (error) {
    console.error('删除订单失败:', error)
    res.status(500).json({ message: '删除订单失败' })
  }
})

// 更新订单状态 (保留旧接口兼容性)
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

// ===== 分类管理 =====

// 获取所有分类
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const [categories] = await pool.execute(`
      SELECT id, name, description, image, created_at
      FROM categories
      ORDER BY created_at DESC
    `)

    res.json(categories)
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.status(500).json({ message: '获取分类列表失败' })
  }
})

// 创建分类
router.post('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image } = req.body

    if (!name) {
      res.status(400).json({ message: '分类名称为必填项' })
      return
    }

    // 检查分类名称是否已存在
    const [existingCategories] = await pool.execute('SELECT id FROM categories WHERE name = ?', [
      name,
    ])

    if ((existingCategories as CategoryRow[]).length > 0) {
      res.status(400).json({ message: '分类名称已存在' })
      return
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
      [name, description || '', image || ''],
    )

    // 获取新创建的分类
    const [newCategory] = await pool.execute('SELECT * FROM categories WHERE id = ?', [
      (result as InsertResult).insertId,
    ])

    res.status(201).json({
      message: '分类创建成功',
      category: (newCategory as CategoryRow[])[0],
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    res.status(500).json({ message: '创建分类失败' })
  }
})

// 更新分类
router.put('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, description, image } = req.body

    if (!name) {
      res.status(400).json({ message: '分类名称为必填项' })
      return
    }

    // 检查分类是否存在
    const [existingCategory] = await pool.execute('SELECT id FROM categories WHERE id = ?', [id])

    if ((existingCategory as CategoryRow[]).length === 0) {
      res.status(404).json({ message: '分类不存在' })
      return
    }

    // 检查分类名称是否已被其他分类使用
    const [duplicateCategories] = await pool.execute(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name, id],
    )

    if ((duplicateCategories as CategoryRow[]).length > 0) {
      res.status(400).json({ message: '分类名称已存在' })
      return
    }

    await pool.execute('UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?', [
      name,
      description || '',
      image || '',
      id,
    ])

    // 获取更新后的分类
    const [updatedCategory] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id])

    res.json({
      message: '分类更新成功',
      category: (updatedCategory as CategoryRow[])[0],
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({ message: '更新分类失败' })
  }
})

// 删除分类
router.delete('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 检查分类是否存在
    const [existingCategory] = await pool.execute('SELECT id, name FROM categories WHERE id = ?', [
      id,
    ])

    if ((existingCategory as CategoryRow[]).length === 0) {
      res.status(404).json({ message: '分类不存在' })
      return
    }

    // 检查是否有商品使用了这个分类
    const [productsUsingCategory] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id],
    )

    if ((productsUsingCategory as CountResult[])[0].count > 0) {
      res.status(400).json({
        message: '该分类下还有商品，无法删除。请先将商品移至其他分类。',
      })
      return
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id])
    res.json({ message: '分类删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({ message: '删除分类失败' })
  }
})

// 批量删除分类
router.post('/categories/batch-delete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: '请提供要删除的分类ID列表' })
      return
    }

    // 检查是否有商品使用了这些分类
    const placeholders = ids.map(() => '?').join(',')
    const [productsUsingCategories] = await pool.execute(
      `SELECT COUNT(*) as count FROM products WHERE category_id IN (${placeholders})`,
      ids,
    )

    if ((productsUsingCategories as CountResult[])[0].count > 0) {
      res.status(400).json({
        message: '所选分类中有分类包含商品，无法删除。请先移动相关商品。',
      })
      return
    }

    await pool.execute(`DELETE FROM categories WHERE id IN (${placeholders})`, ids)

    res.json({ message: `成功删除 ${ids.length} 个分类` })
  } catch (error) {
    console.error('批量删除分类失败:', error)
    res.status(500).json({ message: '批量删除分类失败' })
  }
})

// 获取分类详情
router.get('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const [category] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id])

    if ((category as CategoryRow[]).length === 0) {
      res.status(404).json({ message: '分类不存在' })
      return
    }

    res.json((category as CategoryRow[])[0])
  } catch (error) {
    console.error('获取分类详情失败:', error)
    res.status(500).json({ message: '获取分类详情失败' })
  }
})

export default router
