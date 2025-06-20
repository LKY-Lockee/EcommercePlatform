import express from 'express'
import { Response } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { getConnection } from '../config/database.js'

const router = express.Router()

// 获取购物车
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `
      SELECT *
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `,
      [req.user!.id],
    )

    connection.release()
    res.json(rows)
  } catch (error) {
    console.error('获取购物车失败:', error)
    res.status(500).json({ message: '获取购物车失败' })
  }
})

// 添加到购物车
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, quantity = 1 } = req.body

    if (!product_id) {
      res.status(400).json({ message: '商品ID不能为空' })
      return
    }

    const connection = await getConnection()

    // 检查商品是否存在且有库存
    const [productRows] = await connection.execute('SELECT id, stock FROM products WHERE id = ?', [
      product_id,
    ])

    const products = productRows as Array<{ id: number; stock: number }>
    if (products.length === 0) {
      connection.release()
      res.status(404).json({ message: '商品不存在' })
      return
    }

    const product = products[0]
    if (product.stock < quantity) {
      connection.release()
      res.status(400).json({ message: '库存不足' })
      return
    }

    // 检查购物车中是否已有该商品
    const [existingRows] = await connection.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user!.id, product_id],
    )

    const existingItems = existingRows as Array<{ id: number; quantity: number }>
    if (existingItems.length > 0) {
      // 更新数量
      const existingItem = existingItems[0]
      const newQuantity = existingItem.quantity + quantity

      if (newQuantity > product.stock) {
        connection.release()
        res.status(400).json({ message: '超出库存数量' })
        return
      }

      await connection.execute('UPDATE cart SET quantity = ? WHERE id = ?', [
        newQuantity,
        existingItem.id,
      ])
    } else {
      // 新增到购物车
      await connection.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user!.id, product_id, quantity],
      )
    }

    connection.release()
    res.json({ message: '添加到购物车成功' })
  } catch (error) {
    console.error('添加购物车失败:', error)
    res.status(500).json({ message: '添加购物车失败' })
  }
})

// 更新购物车商品数量
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (quantity <= 0) {
      res.status(400).json({ message: '数量必须大于0' })
      return
    }

    const connection = await getConnection()

    // 检查购物车项是否属于当前用户
    const [cartRows] = await connection.execute(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.product_id = ? AND c.user_id = ?',
      [id, req.user!.id],
    )

    const cartItems = cartRows as Array<{ stock: number }>
    if (cartItems.length === 0) {
      connection.release()
      res.status(404).json({ message: '购物车项不存在' })
      return
    }

    const cartItem = cartItems[0]
    if (quantity > cartItem.stock) {
      connection.release()
      res.status(400).json({ message: '超出库存数量' })
      return
    }

    await connection.execute('UPDATE cart SET quantity = ? WHERE product_id = ?', [quantity, id])

    connection.release()
    res.json({ message: '更新成功' })
  } catch (error) {
    console.error('更新购物车失败:', error)
    res.status(500).json({ message: '更新购物车失败' })
  }
})

// 删除购物车商品
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const connection = await getConnection()

    const result = await connection.execute('DELETE FROM cart WHERE product_id = ? AND user_id = ?', [
      id,
      req.user!.id,
    ])

    connection.release()

    const deleteResult = result[0] as { affectedRows: number }
    if (deleteResult.affectedRows === 0) {
      res.status(404).json({ message: '购物车项不存在' })
      return
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除购物车项失败:', error)
    res.status(500).json({ message: '删除购物车项失败' })
  }
})

// 清空购物车
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await getConnection()

    await connection.execute('DELETE FROM cart WHERE user_id = ?', [req.user!.id])

    connection.release()
    res.json({ message: '购物车已清空' })
  } catch (error) {
    console.error('清空购物车失败:', error)
    res.status(500).json({ message: '清空购物车失败' })
  }
})

export default router
