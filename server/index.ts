import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './config/database'
import usersRouter from './routes/users'
import categoriesRouter from './routes/categories'
import productsRouter from './routes/products'
import cartRouter from './routes/cart'
import ordersRouter from './routes/orders'
import addressesRouter from './routes/addresses'
import adminRouter from './routes/admin'
import bannersRouter from './routes/banners'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use('/uploads', express.static('server/uploads'))

// 路由
app.use('/api/users', usersRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/addresses', addressesRouter)
app.use('/api/admin', adminRouter)
app.use('/api/banners', bannersRouter)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '服务运行正常' })
})

// 错误处理中间件
import { Request, Response, NextFunction } from 'express'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: '服务器内部错误' })
})

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`)
    })
  } catch (error) {
    console.error('启动服务器失败:', error)
    process.exit(1)
  }
}

startServer()
