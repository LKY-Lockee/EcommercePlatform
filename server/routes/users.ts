import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()

// 用户注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, phone } = req.body

    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email],
    )

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      res.status(400).json({ message: '用户名或邮箱已存在' })
      return
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, phone],
    )

    const insertResult = result as { insertId: number }
    const userId = insertResult.insertId

    // 生成JWT token
    const token = jwt.sign(
      { id: userId, username, email, role: 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    res.status(201).json({
      message: '注册成功',
      user: { id: userId, username, email, role: 'user' },
      token,
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

// 用户登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    // 查找用户
    const [users] = await pool.execute(
      'SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ?',
      [username, username],
    )

    if (!Array.isArray(users) || users.length === 0) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }

    const user = users[0] as {
      id: number
      username: string
      email: string
      password: string
      role: string
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' },
    )

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

// 获取用户信息
router.get(
  '/profile',
  authenticateToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const [users] = await pool.execute(
        'SELECT id, username, email, phone, avatar, role, created_at FROM users WHERE id = ?',
        [req.user?.id],
      )

      if (!Array.isArray(users) || users.length === 0) {
        res.status(404).json({ message: '用户不存在' })
        return
      }

      res.json({ user: users[0] })
    } catch (error) {
      console.error('获取用户信息错误:', error)
      res.status(500).json({ message: '服务器内部错误' })
    }
  },
)

// 更新用户信息
router.put(
  '/profile',
  authenticateToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { username, email, phone, avatar } = req.body
      const userId = req.user?.id

      // 检查邮箱是否被其他用户使用
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId],
      )

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        res.status(400).json({ message: '邮箱已被其他用户使用' })
        return
      }

      // 更新用户信息
      await pool.execute(
        'UPDATE users SET username = ?, email = ?, phone = ?, avatar = ? WHERE id = ?',
        [username, email, phone, avatar, userId],
      )

      // 获取更新后的用户信息
      const [updatedUsers] = await pool.execute(
        'SELECT id, username, email, phone, avatar, role, created_at FROM users WHERE id = ?',
        [userId],
      )

      if (!Array.isArray(updatedUsers) || updatedUsers.length === 0) {
        res.status(404).json({ message: '用户不存在' })
        return
      }

      res.json({
        message: '用户信息更新成功',
        user: updatedUsers[0],
      })
    } catch (error) {
      console.error('更新用户信息错误:', error)
      res.status(500).json({ message: '服务器内部错误' })
    }
  },
)

// 修改密码
router.put(
  '/change-password',
  authenticateToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user?.id

      // 获取当前用户的密码
      const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId])

      if (!Array.isArray(users) || users.length === 0) {
        res.status(404).json({ message: '用户不存在' })
        return
      }

      const user = users[0] as { password: string }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        res.status(400).json({ message: '当前密码错误' })
        return
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // 更新密码
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId])

      res.json({ message: '密码修改成功' })
    } catch (error) {
      console.error('修改密码错误:', error)
      res.status(500).json({ message: '服务器内部错误' })
    }
  },
)

// 获取用户地址列表
router.get(
  '/addresses',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [addresses] = await pool.execute(
        'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
        [req.user?.id],
      )
      res.json(addresses)
    } catch (error) {
      console.error('获取地址列表失败:', error)
      res.status(500).json({ message: '获取地址列表失败' })
    }
  },
)

// 添加地址
router.post(
  '/addresses',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, phone, province, city, district, detail, is_default } = req.body

      if (!name || !phone || !province || !city || !district || !detail) {
        res.status(400).json({ message: '请填写完整的地址信息' })
        return
      }

      // 如果设为默认地址，先取消其他默认地址
      if (is_default) {
        await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user?.id])
      }

      const [result] = await pool.execute(
        'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user?.id, name, phone, province, city, district, detail, is_default ? 1 : 0],
      )

      const insertResult = result as { insertId: number }
      res.json({
        message: '地址添加成功',
        address: {
          id: insertResult.insertId,
          user_id: req.user?.id,
          name,
          phone,
          province,
          city,
          district,
          detail,
          is_default: !!is_default,
          created_at: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('添加地址失败:', error)
      res.status(500).json({ message: '添加地址失败' })
    }
  },
)

// 更新地址
router.put(
  '/addresses/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const { name, phone, province, city, district, detail, is_default } = req.body

      // 检查地址是否属于当前用户
      const [addresses] = await pool.execute(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user?.id],
      )

      if (!Array.isArray(addresses) || addresses.length === 0) {
        res.status(404).json({ message: '地址不存在' })
        return
      }

      // 如果设为默认地址，先取消其他默认地址
      if (is_default) {
        await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?', [
          req.user?.id,
          id,
        ])
      }

      await pool.execute(
        'UPDATE addresses SET name = ?, phone = ?, province = ?, city = ?, district = ?, detail = ?, is_default = ? WHERE id = ? AND user_id = ?',
        [name, phone, province, city, district, detail, is_default ? 1 : 0, id, req.user?.id],
      )

      res.json({ message: '地址更新成功' })
    } catch (error) {
      console.error('更新地址失败:', error)
      res.status(500).json({ message: '更新地址失败' })
    }
  },
)

// 删除地址
router.delete(
  '/addresses/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      const result = await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [
        id,
        req.user?.id,
      ])

      const deleteResult = result[0] as { affectedRows: number }
      if (deleteResult.affectedRows === 0) {
        res.status(404).json({ message: '地址不存在' })
        return
      }

      res.json({ message: '地址删除成功' })
    } catch (error) {
      console.error('删除地址失败:', error)
      res.status(500).json({ message: '删除地址失败' })
    }
  },
)

// 设置默认地址
router.put(
  '/addresses/:id/default',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params

      // 检查地址是否属于当前用户
      const [addresses] = await pool.execute(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user?.id],
      )

      if (!Array.isArray(addresses) || addresses.length === 0) {
        res.status(404).json({ message: '地址不存在' })
        return
      }

      // 取消其他默认地址
      await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user?.id])

      // 设置当前地址为默认
      await pool.execute('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [
        id,
        req.user?.id,
      ])

      res.json({ message: '默认地址设置成功' })
    } catch (error) {
      console.error('设置默认地址失败:', error)
      res.status(500).json({ message: '设置默认地址失败' })
    }
  },
)

export default router
