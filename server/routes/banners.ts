import express, { Request, Response } from 'express'
import { pool } from '../config/database'

const router = express.Router()

// 获取活跃的轮播图
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT
        id,
        title,
        subtitle,
        image_url,
        link_url,
        button_text,
        sort_order
      FROM banners
      WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY sort_order ASC, created_at DESC
    `

    const [banners] = await pool.execute(query)

    res.json(banners)
  } catch (error) {
    console.error('获取轮播图失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

// 获取轮播图详情
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const bannerId = parseInt(id)

    if (isNaN(bannerId)) {
      res.status(400).json({ message: '轮播图ID格式错误' })
      return
    }

    const query = `
      SELECT *
      FROM banners
      WHERE id = ? AND is_active = 1
    `

    const [banners] = await pool.execute(query, [bannerId])

    if (!Array.isArray(banners) || banners.length === 0) {
      res.status(404).json({ message: '轮播图不存在' })
      return
    }

    res.json(banners[0])
  } catch (error) {
    console.error('获取轮播图详情失败:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router
