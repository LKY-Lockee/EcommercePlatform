import { pool } from '../config/database'

export const seedBanners = async () => {
  try {
    const connection = await pool.getConnection()

    // 清空现有数据（可选）
    await connection.execute('DELETE FROM banners')

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
      {
        title: '智能家居',
        subtitle: '科技改变生活，智能引领未来',
        image_url:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400',
        link_url: '/products?category_id=1',
        button_text: '探索智能',
        sort_order: 4,
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

    connection.release()
    console.log('轮播图数据初始化完成')
  } catch (error) {
    console.error('轮播图数据初始化失败:', error)
  }
}

// 如果直接运行此文件，则执行种子数据
if (import.meta.url.endsWith(process.argv[1])) {
  seedBanners().then(() => {
    process.exit(0)
  })
}
