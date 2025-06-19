import express, { Request, Response } from 'express'
import { pool } from '../config/database'

const router = express.Router()

// 获取所有商品
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      category_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      featured,
      min_price,
      max_price,
    } = req.query

    // 确保参数类型正确
    const pageNum = parseInt(String(page)) || 1
    const limitNum = parseInt(String(limit)) || 12
    const categoryId = category_id ? parseInt(String(category_id)) : null

    let whereClause = 'WHERE p.status = ?'
    const queryParams: (string | number)[] = ['active']

    if (categoryId && !isNaN(categoryId)) {
      whereClause += ' AND p.category_id = ?'
      queryParams.push(categoryId)
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)'
      const searchTerm = String(search)
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`)
    }

    if (featured === 'true') {
      whereClause += ' AND p.featured = ?'
      queryParams.push(1)
    }

    // 价格筛选
    if (min_price && !isNaN(Number(min_price))) {
      whereClause += ' AND p.price >= ?'
      queryParams.push(Number(min_price))
    }

    if (max_price && !isNaN(Number(max_price))) {
      whereClause += ' AND p.price <= ?'
      queryParams.push(Number(max_price))
    }

    const validSortBy = ['price', 'sales', 'rating', 'created_at']
    const validSortOrder = ['ASC', 'DESC']
    const safeSortBy = validSortBy.includes(String(sort_by)) ? String(sort_by) : 'created_at'
    const safeSortOrder = validSortOrder.includes(String(sort_order).toUpperCase())
      ? String(sort_order).toUpperCase()
      : 'DESC'

    let orderByClause = ''
    switch (safeSortBy) {
      case 'price':
        orderByClause = `ORDER BY p.price ${safeSortOrder}`
        break
      case 'sales':
        orderByClause = `ORDER BY p.sales ${safeSortOrder}`
        break
      case 'rating':
        orderByClause = `ORDER BY p.rating ${safeSortOrder}`
        break
      default:
        orderByClause = `ORDER BY p.created_at ${safeSortOrder}`
    }

    const offset = (pageNum - 1) * limitNum

    const query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.stock,
        p.category_id,
        p.brand,
        p.sku,
        p.status,
        p.featured,
        p.views,
        p.sales,
        p.rating,
        p.rating_count,
        p.created_at,
        p.image,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT ${limitNum} OFFSET ${offset}
    `

    const [items] = await pool.execute(query, queryParams)

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `

    const [countResult] = await pool.execute(countQuery, queryParams)
    const total = Array.isArray(countResult) ? (countResult[0] as { total: number }).total : 0

    res.json({
      items,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('获取商品列表错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

// 获取商品详情
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      res.status(400).json({ message: '商品ID格式错误' })
      return
    }

    // 获取商品基本信息
    const [products] = await pool.execute(
      `
      SELECT
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = ?
    `,
      [productId, 'active'],
    )

    if (!Array.isArray(products) || products.length === 0) {
      res.status(404).json({ message: '商品不存在' })
      return
    }

    const product = products[0]

    // 更新浏览次数
    await pool.execute('UPDATE products SET views = views + 1 WHERE id = ?', [productId])

    res.json(product)
  } catch (error) {
    console.error('获取商品详情错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router
