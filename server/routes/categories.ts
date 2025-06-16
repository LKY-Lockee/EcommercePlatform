import express, { Request, Response } from 'express'
import { pool } from '../config/database'

const router = express.Router()

// 获取所有商品分类
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [categories] = await pool.execute(`
      SELECT * FROM categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC
    `)
    res.json(categories)
  } catch (error) {
    console.error('获取分类错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

// 获取分类详情
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
      [id],
    )

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(404).json({ message: '分类不存在' })
      return
    }

    res.json(categories[0])
  } catch (error) {
    console.error('获取分类详情错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router
