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

export default router
