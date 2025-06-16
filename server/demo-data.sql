-- 创建演示数据

-- 插入管理员用户
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@ecommerce.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 插入商品分类
INSERT INTO categories (name, description, image, sort_order) VALUES 
('电子产品', '各种电子设备和配件', 'https://via.placeholder.com/200x200?text=电子产品', 1),
('服装鞋帽', '时尚服装和鞋帽配饰', 'https://via.placeholder.com/200x200?text=服装鞋帽', 2),
('家居用品', '家庭生活必需品', 'https://via.placeholder.com/200x200?text=家居用品', 3),
('运动户外', '运动健身和户外用品', 'https://via.placeholder.com/200x200?text=运动户外', 4),
('美妆个护', '美容化妆和个人护理', 'https://via.placeholder.com/200x200?text=美妆个护', 5),
('食品饮料', '各类食品和饮料', 'https://via.placeholder.com/200x200?text=食品饮料', 6),
('图书文具', '图书教育和办公文具', 'https://via.placeholder.com/200x200?text=图书文具', 7),
('母婴用品', '婴幼儿和孕妇用品', 'https://via.placeholder.com/200x200?text=母婴用品', 8);

-- 插入商品
INSERT INTO products (name, description, price, original_price, stock, category_id, brand, sku, featured, rating, rating_count, sales) VALUES 

-- 电子产品
('Apple iPhone 15 Pro Max', 'Apple最新款旗舰手机，搭载A17 Pro芯片，支持5G网络，拍照效果极佳', 9999.00, 10999.00, 50, 1, 'Apple', 'IP15PM001', TRUE, 4.8, 256, 89),
('华为 MatePad Pro 12.6', '华为高端平板电脑，2K屏幕，麒麟9000E处理器', 4999.00, 5499.00, 30, 1, '华为', 'HWMP126', TRUE, 4.6, 128, 45),
('小米 13 Ultra', '小米影像旗舰，徕卡光学镜头，骁龙8 Gen 2处理器', 5999.00, 6499.00, 40, 1, '小米', 'MI13U001', TRUE, 4.7, 189, 156),
('MacBook Air M2', 'Apple M2芯片，13.6英寸液体视网膜显示屏', 8999.00, 9999.00, 25, 1, 'Apple', 'MBAM2001', TRUE, 4.9, 94, 67),

-- 服装鞋帽
('优衣库男士羽绒服', '轻便保暖，多色可选，适合秋冬季节', 399.00, 499.00, 100, 2, '优衣库', 'UQ2023YR', FALSE, 4.5, 312, 234),
('Nike Air Max 270', 'Nike经典气垫跑鞋，舒适透气，多种配色', 899.00, 999.00, 80, 2, 'Nike', 'NAM270', TRUE, 4.4, 567, 456),
('Adidas三叶草卫衣', '经典三叶草logo，纯棉材质，时尚百搭', 599.00, 699.00, 60, 2, 'Adidas', 'AD3LCW', FALSE, 4.3, 189, 123),

-- 家居用品
('戴森V15无线吸尘器', '强劲吸力，激光显尘，智能感应', 3999.00, 4499.00, 20, 3, '戴森', 'DYV15001', TRUE, 4.7, 89, 67),
('小米电饭煲3L', '智能预约，多种烹饪模式，3L容量适合小家庭', 299.00, 399.00, 150, 3, '小米', 'MIRC3L', FALSE, 4.2, 234, 189),
('宜家北欧风餐桌', '简约现代设计，环保材质，适合现代家庭', 1299.00, 1599.00, 15, 3, '宜家', 'IKEA2023', FALSE, 4.6, 45, 23),

-- 运动户外
('Nike Air Jordan 1', '经典篮球鞋，复刻版本，街头潮流必备', 1299.00, 1499.00, 35, 4, 'Nike', 'NAJ1001', TRUE, 4.8, 456, 389),
('李宁运动套装', '透气速干，适合运动健身，多种尺码', 399.00, 499.00, 120, 4, '李宁', 'LN2023ST', FALSE, 4.1, 167, 134),

-- 美妆个护
('兰蔻小黑瓶精华', '经典抗衰老精华，改善肌肤质感', 1080.00, 1280.00, 50, 5, '兰蔻', 'LC2023XH', TRUE, 4.7, 234, 156),
('SK-II神仙水', '明星产品，改善肌肤状态，提亮肤色', 1690.00, 1890.00, 30, 5, 'SK-II', 'SK2SXS', TRUE, 4.9, 189, 134),

-- 食品饮料
('茅台飞天53度', '国酒茅台，收藏佳品，送礼首选', 2599.00, 2899.00, 10, 6, '茅台', 'MT2023FT', FALSE, 4.9, 89, 45),
('三只松鼠坚果礼盒', '精选坚果，营养健康，包装精美', 168.00, 199.00, 200, 6, '三只松鼠', 'SZS2023', FALSE, 4.3, 567, 456),

-- 图书文具
('《活着》余华著', '经典文学作品，深度思考人生意义', 39.80, 49.80, 300, 7, '作家出版社', 'HZ2023YH', FALSE, 4.8, 1234, 987),
('得力文具套装', '学生办公必备，质量可靠，性价比高', 89.00, 109.00, 250, 7, '得力', 'DL2023WJ', FALSE, 4.2, 345, 267),

-- 母婴用品
('好奇金装纸尿裤', '超薄透气，柔软亲肤，婴儿首选', 199.00, 229.00, 100, 8, '好奇', 'HQ2023JZ', FALSE, 4.6, 456, 234),
('飞利浦新安怡奶瓶', '防胀气设计，安全材质，宝宝喜爱', 158.00, 188.00, 80, 8, '飞利浦', 'FLP2023NP', FALSE, 4.5, 234, 156);

-- 插入商品图片
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES 
-- iPhone 15 Pro Max
(1, 'https://via.placeholder.com/400x400?text=iPhone+15+Pro+Max', TRUE, 1),
(1, 'https://via.placeholder.com/400x400?text=iPhone+15+Pro+Max+2', FALSE, 2),
(1, 'https://via.placeholder.com/400x400?text=iPhone+15+Pro+Max+3', FALSE, 3),

-- 华为 MatePad Pro
(2, 'https://via.placeholder.com/400x400?text=MatePad+Pro', TRUE, 1),
(2, 'https://via.placeholder.com/400x400?text=MatePad+Pro+2', FALSE, 2),

-- 小米 13 Ultra
(3, 'https://via.placeholder.com/400x400?text=Mi+13+Ultra', TRUE, 1),
(3, 'https://via.placeholder.com/400x400?text=Mi+13+Ultra+2', FALSE, 2),

-- MacBook Air M2
(4, 'https://via.placeholder.com/400x400?text=MacBook+Air+M2', TRUE, 1),

-- 优衣库羽绒服
(5, 'https://via.placeholder.com/400x400?text=Uniqlo+Down+Jacket', TRUE, 1),

-- Nike Air Max 270
(6, 'https://via.placeholder.com/400x400?text=Nike+Air+Max+270', TRUE, 1),
(6, 'https://via.placeholder.com/400x400?text=Nike+Air+Max+270+2', FALSE, 2),

-- Adidas卫衣
(7, 'https://via.placeholder.com/400x400?text=Adidas+Hoodie', TRUE, 1),

-- 戴森吸尘器
(8, 'https://via.placeholder.com/400x400?text=Dyson+V15', TRUE, 1),
(8, 'https://via.placeholder.com/400x400?text=Dyson+V15+2', FALSE, 2),

-- 小米电饭煲
(9, 'https://via.placeholder.com/400x400?text=Mi+Rice+Cooker', TRUE, 1),

-- 宜家餐桌
(10, 'https://via.placeholder.com/400x400?text=IKEA+Table', TRUE, 1),

-- Nike Air Jordan 1
(11, 'https://via.placeholder.com/400x400?text=Air+Jordan+1', TRUE, 1),
(11, 'https://via.placeholder.com/400x400?text=Air+Jordan+1+2', FALSE, 2),

-- 李宁运动套装
(12, 'https://via.placeholder.com/400x400?text=Li-Ning+Sports+Set', TRUE, 1),

-- 兰蔻精华
(13, 'https://via.placeholder.com/400x400?text=Lancome+Serum', TRUE, 1),

-- SK-II神仙水
(14, 'https://via.placeholder.com/400x400?text=SK-II+Essence', TRUE, 1),

-- 茅台
(15, 'https://via.placeholder.com/400x400?text=Moutai', TRUE, 1),

-- 三只松鼠
(16, 'https://via.placeholder.com/400x400?text=Three+Squirrels', TRUE, 1),

-- 《活着》
(17, 'https://via.placeholder.com/400x400?text=Book+Alive', TRUE, 1),

-- 得力文具
(18, 'https://via.placeholder.com/400x400?text=Deli+Stationery', TRUE, 1),

-- 好奇纸尿裤
(19, 'https://via.placeholder.com/400x400?text=Huggies+Diapers', TRUE, 1),

-- 飞利浦奶瓶
(20, 'https://via.placeholder.com/400x400?text=Philips+Bottle', TRUE, 1);
