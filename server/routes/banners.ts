import express, { Request, Response } from 'express'
import { pool } from '../config/database'

const router = express.Router()

// 获取活跃的轮播图
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT *
      FROM banners
      ORDER BY id ASC, created_at DESC
    `

    const [banners] = await pool.execute(query)

    res.json(banners)
  } catch (error) {
    console.error('获取轮播图失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router
