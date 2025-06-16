import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_platform',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

export const pool = mysql.createPool(dbConfig)

// 获取数据库连接
export const getConnection = async () => {
  return await pool.getConnection()
}

// 初始化数据库表
export const initDatabase = async () => {
  try {
    // 首先连接到 MySQL 服务器（不指定数据库）
    const adminConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
    }

    const adminConnection = await mysql.createConnection(adminConfig)

    // 创建数据库（如果不存在）
    const dbName = process.env.DB_NAME || 'ecommerce_platform'
    await adminConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    )
    await adminConnection.end()

    // 现在连接到指定的数据库
    const connection = await pool.getConnection()

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // 创建商品分类表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        parent_id INT DEFAULT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `)

    // 创建商品表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        stock INT DEFAULT 0,
        category_id INT,
        brand VARCHAR(100),
        sku VARCHAR(100) UNIQUE,
        status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
        featured BOOLEAN DEFAULT FALSE,
        views INT DEFAULT 0,
        sales INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        rating_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `)

    // 创建商品图片表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // 创建轮播图表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        subtitle VARCHAR(300),
        image_url VARCHAR(255) NOT NULL,
        link_url VARCHAR(255),
        button_text VARCHAR(50) DEFAULT '立即查看',
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // 创建购物车表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `)

    // 创建订单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50),
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // 创建订单详情表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // 创建地址表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        province VARCHAR(50) NOT NULL,
        city VARCHAR(50) NOT NULL,
        district VARCHAR(50) NOT NULL,
        detail VARCHAR(255) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    connection.release()
    console.log('数据库表初始化完成')

    // 插入默认数据
    await seedDefaultBanners()
    await seedDefaultCategories()
    await seedDefaultProducts()
  } catch (error) {
    console.error('数据库初始化错误:', error)
  }
}

// 插入默认轮播图数据
const seedDefaultBanners = async () => {
  try {
    const connection = await pool.getConnection()

    // 检查是否已有数据
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM banners')
    const count = Array.isArray(existing) ? (existing[0] as { count: number }).count : 0

    if (count === 0) {
      // 插入示例轮播图数据
      const banners = [
        {
          title: '夏季大促销',
          subtitle: '精选商品 5折起，限时抢购',
          image_url:
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
          link_url: '/products',
          button_text: '立即抢购',
          sort_order: 1,
        },
        {
          title: '新品上市',
          subtitle: '潮流时尚，引领风尚',
          image_url:
            'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
          link_url: '/products?featured=true',
          button_text: '查看新品',
          sort_order: 2,
        },
        {
          title: '品质保证',
          subtitle: '正品承诺，假一赔十',
          image_url:
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
          link_url: '/products',
          button_text: '了解更多',
          sort_order: 3,
        },
      ]

      for (const banner of banners) {
        await connection.execute(
          `INSERT INTO banners (title, subtitle, image_url, link_url, button_text, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [
            banner.title,
            banner.subtitle,
            banner.image_url,
            banner.link_url,
            banner.button_text,
            banner.sort_order,
          ],
        )
      }

      console.log('默认轮播图数据初始化完成')
    }

    connection.release()
  } catch (error) {
    console.error('轮播图数据初始化失败:', error)
  }
}

// 插入默认分类数据
const seedDefaultCategories = async () => {
  try {
    const connection = await pool.getConnection()

    // 检查是否已有数据
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM categories')
    const count = Array.isArray(existing) ? (existing[0] as { count: number }).count : 0

    if (count === 0) {
      const categories = [
        {
          name: '智能家电',
          description: '让生活更智能的家电产品',
          image:
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 1,
        },
        {
          name: '数码产品',
          description: '最新的数码科技产品',
          image:
            'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 2,
        },
        {
          name: '服装鞋帽',
          description: '时尚潮流的服装配饰',
          image:
            'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 3,
        },
        {
          name: '美妆护肤',
          description: '美容护肤精品',
          image:
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 4,
        },
        {
          name: '运动户外',
          description: '运动健身装备',
          image:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 5,
        },
        {
          name: '家居生活',
          description: '家居装饰用品',
          image:
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          sort_order: 6,
        },
      ]

      for (const category of categories) {
        await connection.execute(
          `INSERT INTO categories (name, description, image, sort_order, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [category.name, category.description, category.image, category.sort_order],
        )
      }

      console.log('默认分类数据初始化完成')
    }

    connection.release()
  } catch (error) {
    console.error('分类数据初始化失败:', error)
  }
}

// 插入默认商品数据
const seedDefaultProducts = async () => {
  try {
    const connection = await pool.getConnection()

    // 检查是否已有数据
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM products')
    const count = Array.isArray(existing) ? (existing[0] as { count: number }).count : 0

    if (count === 0) {
      const products = [
        {
          name: 'iPhone 15 Pro',
          description: '最新款iPhone，搭载A17 Pro芯片，拍照更强，性能更优',
          price: 7999.0,
          original_price: 8999.0,
          stock: 50,
          category_id: 2,
          brand: 'Apple',
          sku: 'IP15P001',
          featured: true,
          sales: 128,
          rating: 4.8,
          rating_count: 245,
        },
        {
          name: '智能扫地机器人',
          description: '全自动清扫，智能规划路径，让清洁更简单',
          price: 1299.0,
          original_price: 1599.0,
          stock: 30,
          category_id: 1,
          brand: '小米',
          sku: 'SCAN001',
          featured: true,
          sales: 89,
          rating: 4.6,
          rating_count: 156,
        },
        {
          name: '无线蓝牙耳机',
          description: '高品质音效，长续航，降噪效果出色',
          price: 399.0,
          original_price: 499.0,
          stock: 100,
          category_id: 2,
          brand: 'Sony',
          sku: 'BT001',
          featured: true,
          sales: 342,
          rating: 4.7,
          rating_count: 589,
        },
        {
          name: '运动跑鞋',
          description: '轻便透气，专业缓震，适合各种运动场景',
          price: 299.0,
          stock: 80,
          category_id: 5,
          brand: 'Nike',
          sku: 'RUN001',
          featured: false,
          sales: 156,
          rating: 4.5,
          rating_count: 234,
        },
        {
          name: '智能手表',
          description: '健康监测，运动记录，智能提醒',
          price: 899.0,
          original_price: 1099.0,
          stock: 45,
          category_id: 2,
          brand: 'Apple',
          sku: 'SW001',
          featured: true,
          sales: 78,
          rating: 4.6,
          rating_count: 123,
        },
        {
          name: '护肤套装',
          description: '温和滋润，深层护理，适合各种肌肤',
          price: 199.0,
          stock: 60,
          category_id: 4,
          brand: '兰蔻',
          sku: 'SKIN001',
          featured: false,
          sales: 234,
          rating: 4.4,
          rating_count: 345,
        },
      ]

      for (const product of products) {
        await connection.execute(
          `INSERT INTO products (name, description, price, original_price, stock, category_id, brand, sku, featured, sales, rating, rating_count, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
          [
            product.name,
            product.description,
            product.price,
            product.original_price || null,
            product.stock,
            product.category_id,
            product.brand,
            product.sku,
            product.featured ? 1 : 0,
            product.sales,
            product.rating,
            product.rating_count,
          ],
        )
      }

      console.log('默认商品数据初始化完成')
    }

    connection.release()
  } catch (error) {
    console.error('商品数据初始化失败:', error)
  }
}
