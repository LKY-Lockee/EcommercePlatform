import express, { Response } from 'express'
import { pool } from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()

// 获取用户地址列表
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        user_id,
        name,
        phone,
        province,
        city,
        district,
        detail,
        is_default,
        created_at,
        updated_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `,
      [req.user!.id],
    )

    res.json(rows)
  } catch (error) {
    console.error('获取地址列表失败:', error)
    res.status(500).json({ message: '获取地址列表失败' })
  }
})

// 获取地址详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const [rows] = await pool.execute('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [
      id,
      req.user!.id,
    ])

    const addresses = rows as Array<{
      id: number
      user_id: number
      name: string
      phone: string
      province: string
      city: string
      district: string
      detail: string
      is_default: boolean
      created_at: string
      updated_at: string
    }>

    if (addresses.length === 0) {
      res.status(404).json({ message: '地址不存在' })
      return
    }

    res.json(addresses[0])
  } catch (error) {
    console.error('获取地址详情失败:', error)
    res.status(500).json({ message: '获取地址详情失败' })
  }
})

// 创建地址
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, province, city, district, detail, is_default = false } = req.body

    if (!name || !phone || !province || !city || !district || !detail) {
      res.status(400).json({ message: '地址信息不完整' })
      return
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // 如果设置为默认地址，先将其他地址设为非默认
      if (is_default) {
        await connection.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [
          req.user!.id,
        ])
      }

      // 创建新地址
      const [result] = await connection.execute(
        `
        INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [req.user!.id, name, phone, province, city, district, detail, is_default],
      )

      const addressId = (result as { insertId: number }).insertId

      // 获取新创建的地址
      const [addressRows] = await connection.execute('SELECT * FROM addresses WHERE id = ?', [
        addressId,
      ])

      await connection.commit()
      connection.release()

      res.status(201).json({
        message: '地址创建成功',
        address: (addressRows as unknown[])[0],
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('创建地址失败:', error)
    res.status(500).json({ message: '创建地址失败' })
  }
})

// 更新地址
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, phone, province, city, district, detail, is_default = false } = req.body

    if (!name || !phone || !province || !city || !district || !detail) {
      res.status(400).json({ message: '地址信息不完整' })
      return
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // 验证地址是否存在
      const [existingRows] = await connection.execute(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user!.id],
      )

      if ((existingRows as unknown[]).length === 0) {
        res.status(404).json({ message: '地址不存在' })
        return
      }

      // 如果设置为默认地址，先将其他地址设为非默认
      if (is_default) {
        await connection.execute(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
          [req.user!.id, id],
        )
      }

      // 更新地址
      await connection.execute(
        `
        UPDATE addresses
        SET name = ?, phone = ?, province = ?, city = ?, district = ?, detail = ?, is_default = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `,
        [name, phone, province, city, district, detail, is_default, id, req.user!.id],
      )

      // 获取更新后的地址
      const [addressRows] = await connection.execute('SELECT * FROM addresses WHERE id = ?', [id])

      await connection.commit()
      connection.release()

      res.json({
        message: '地址更新成功',
        address: (addressRows as unknown[])[0],
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('更新地址失败:', error)
    res.status(500).json({ message: '更新地址失败' })
  }
})

// 删除地址
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const [result] = await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [
      id,
      req.user!.id,
    ])

    const affectedRows = (result as { affectedRows: number }).affectedRows
    if (affectedRows === 0) {
      res.status(404).json({ message: '地址不存在' })
      return
    }

    res.json({ message: '地址删除成功' })
  } catch (error) {
    console.error('删除地址失败:', error)
    res.status(500).json({ message: '删除地址失败' })
  }
})

// 设置默认地址
router.put(
  '/:id/default',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // 验证地址是否存在
        const [existingRows] = await connection.execute(
          'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
          [id, req.user!.id],
        )

        if ((existingRows as unknown[]).length === 0) {
          res.status(404).json({ message: '地址不存在' })
          return
        }

        // 将所有地址设为非默认
        await connection.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [
          req.user!.id,
        ])

        // 设置指定地址为默认
        await connection.execute(
          'UPDATE addresses SET is_default = TRUE, updated_at = NOW() WHERE id = ? AND user_id = ?',
          [id, req.user!.id],
        )

        await connection.commit()
        connection.release()

        res.json({ message: '默认地址设置成功' })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error('设置默认地址失败:', error)
      res.status(500).json({ message: '设置默认地址失败' })
    }
  },
)

export default router
