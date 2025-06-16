import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    email: string
    role: string
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: '访问被拒绝，需要登录' })
    return
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key',
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err) {
        res.status(403).json({ message: '无效的令牌' })
        return
      }
      req.user = decoded as { id: number; username: string; email: string; role: string }
      next()
    },
  )
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: '需要管理员权限' })
    return
  }
  next()
}

export { AuthRequest }
