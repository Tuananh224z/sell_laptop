const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const Tier = require('./models/Tier');

const categories = [
  { name: 'Laptop', slug: 'laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300' },
  { name: 'PC Gaming', slug: 'pc-gaming', image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=300' },
  { name: 'Màn hình', slug: 'man-hinh', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=300' },
  { name: 'Phụ kiện', slug: 'phu-kien', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=300' },
  { name: 'Linh kiện', slug: 'linh-kien', image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=300' },
];

const brands = [
  { name: 'ASUS', slug: 'asus', logo: 'https://cdn.worldvectorlogo.com/logos/asus-logo.svg' },
  { name: 'Dell', slug: 'dell', logo: 'https://cdn.worldvectorlogo.com/logos/dell-2.svg' },
  { name: 'Apple', slug: 'apple', logo: 'https://cdn.worldvectorlogo.com/logos/apple.svg' },
  { name: 'HP', slug: 'hp', logo: 'https://cdn.worldvectorlogo.com/logos/hp-2.svg' },
  { name: 'Logitech', slug: 'logitech', logo: 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg' },
  { name: 'Samsung', slug: 'samsung', logo: 'https://cdn.worldvectorlogo.com/logos/samsung.svg' },
];

const tiers = [
  { 
    name: 'Thành viên', 
    minPoints: 0, 
    discount: 0, 
    color: '#94a3b8', 
    icon: '👤',
    benefits: ['Tích điểm 1% trên mỗi đơn hàng', 'Ưu đãi sinh nhật 5%', 'Thông báo khuyến mãi sớm']
  },
  { 
    name: 'Hạng Bạc', 
    minPoints: 5000, 
    discount: 2, 
    color: '#64748b', 
    icon: '🥈',
    benefits: ['Tích điểm 1.5% trên mỗi đơn hàng', 'Ưu đãi sinh nhật 10%', 'Hỗ trợ ưu tiên', 'Miễn phí giao hàng đơn 1tr+']
  },
  { 
    name: 'Hạng Vàng', 
    minPoints: 20000, 
    discount: 5, 
    color: '#eab308', 
    icon: '🥇',
    benefits: ['Tích điểm 2% trên mỗi đơn hàng', 'Ưu đãi sinh nhật 15%', 'Hỗ trợ ưu tiên 24/7', 'Miễn phí giao hàng mọi đơn', 'Quà tặng hàng quý']
  },
  { 
    name: 'Hạng Kim cương', 
    minPoints: 50000, 
    discount: 10, 
    color: '#06b6d4', 
    icon: '💎',
    benefits: ['Tích điểm 3% trên mỗi đơn hàng', 'Ưu đãi sinh nhật 20%', 'Chuyên viên tư vấn riêng', 'Miễn phí giao hàng mọi đơn', 'Quà tặng hàng tháng', 'Ưu tiên trải nghiệm sản phẩm mới']
  },
];

const products = [
  {
    name: 'Laptop ASUS ROG Zephyrus G14 2024 GA403',
    slug: 'laptop-asus-rog-zephyrus-g14-2024',
    sku: 'ZEPH-G14-2024',
    shortDesc: 'Laptop gaming 14 inch mạnh mẽ nhất thế giới với màn hình OLED',
    description: 'ROG Zephyrus G14 2024 định nghĩa lại khái niệm laptop gaming di động. Với thiết kế nhôm nguyên khối siêu mỏng nhẹ nhưng mang trong mình cấu hình Ryzen 9 8000 series mới nhất.\n\nĐiểm nhấn lớn nhất chính là màn hình Nebula OLED 3K 120Hz với độ chính xác màu tuyệt đối, hỗ trợ G-Sync và thời gian đáp ứng 0.2ms. Hệ thống tản nhiệt ROG Intelligent Cooling giúp máy luôn mát mẻ dưới mọi tác vụ.',
    price: 38990000,
    comparePrice: 42990000,
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600'
    ],
    isFeatured: true,
    hasVariants: true,
    categoryName: 'Laptop',
    brandName: 'ASUS',
    variantOptions: [{ name: 'Cấu hình', values: ['RAM 16GB - SSD 512GB', 'RAM 32GB - SSD 1TB'] }],
    variants: [
      { label: 'RAM 16GB - SSD 512GB', sku: 'ZEPH-G14-16', price: 38990000, comparePrice: 42990000, isDefault: true, serials: [{ code: 'S1' }, { code: 'S2' }] },
      { label: 'RAM 32GB - SSD 1TB', sku: 'ZEPH-G14-32', price: 45990000, comparePrice: 49990000, serials: [{ code: 'S3' }] }
    ],
    specGroups: [
      { name: 'Vi xử lý', items: [{ key: 'CPU', value: 'AMD Ryzen 9 8945HS (8 nhân/16 luồng)' }, { key: 'Xung nhịp', value: 'Lên đến 5.2 GHz' }] },
      { name: 'Bộ nhớ & Lưu trữ', items: [{ key: 'RAM', value: '16GB LPDDR5X (Onboard)' }, { key: 'Ổ cứng', value: '512GB SSD NVMe PCIe 4.0' }] },
      { name: 'Màn hình', items: [{ key: 'Kích thước', value: '14 inch 3K (2880 x 1800) OLED' }, { key: 'Tần số quét', value: '120Hz' }] }
    ]
  },
  {
    name: 'MacBook Air M3 13 inch 2024',
    slug: 'macbook-air-m3-13-inch',
    sku: 'MBA-M3-13',
    shortDesc: 'Mỏng nhẹ, mạnh mẽ với chip M3 hoàn toàn mới',
    description: 'Chip M3 mang lại hiệu năng vượt trội cho MacBook Air. Thiết kế không quạt tản nhiệt giúp máy hoạt động hoàn toàn yên tĩnh.\n\nHỗ trợ xuất tối đa 2 màn hình rời khi đóng nắp máy. Thời lượng pin lên đến 18 giờ liên tục.',
    price: 27990000,
    comparePrice: 32990000,
    thumbnail: 'https://images.unsplash.com/photo-1517336714460-d502d992d9d9?q=80&w=600',
    images: ['https://images.unsplash.com/photo-1517336714460-d502d992d9d9?q=80&w=600'],
    isFeatured: true,
    hasVariants: false,
    categoryName: 'Laptop',
    brandName: 'Apple',
    serials: [{ code: 'A1' }, { code: 'A2' }, { code: 'A3' }],
    specGroups: [
      { name: 'Hiệu năng', items: [{ key: 'Chip', value: 'Apple M3 (8 nhân CPU, 8 nhân GPU)' }, { key: 'Neural Engine', value: '16 nhân' }] },
      { name: 'Thiết kế', items: [{ key: 'Trọng lượng', value: '1.24 kg' }, { key: 'Độ mỏng', value: '11.3 mm' }] }
    ]
  },
  {
    name: 'Chuột Logitech MX Master 3S Gray',
    slug: 'chuot-logitech-mx-master-3s',
    sku: 'MX3S',
    shortDesc: 'Chuột không dây tốt nhất cho dân văn phòng',
    description: 'Logitech MX Master 3S là biểu tượng của sự năng suất. Cảm biến 8000 DPI hoạt động trên mọi bề mặt, kể cả kính. Nút bấm Quiet Clicks giảm 90% tiếng ồn.\n\nBánh xe cuộn MagSpeed siêu nhanh giúp cuộn 1000 dòng trong 1 giây.',
    price: 2390000,
    comparePrice: 2890000,
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=600'],
    categoryName: 'Phụ kiện',
    brandName: 'Logitech',
    serials: [{ code: 'L1' }, { code: 'L2' }, { code: 'L3' }],
    // No specGroups here to test hiding logic
    specGroups: []
  },
  {
    name: 'VGA ASUS ROG Strix RTX 4090 24GB',
    slug: 'vga-asus-rog-strix-rtx-4090',
    sku: 'RTX4090-ROG',
    shortDesc: 'Card đồ họa mạnh nhất thế giới hiện nay',
    description: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X mang lại sức mạnh xử lý đồ họa chưa từng có. Thiết kế 3.5 slot với hệ thống quạt Axial-tech thế hệ mới tăng lưu lượng gió thêm 23%.\n\nKhung gia cố kim loại chắc chắn cùng đèn Aura Sync RGB rực rỡ.',
    price: 55000000,
    comparePrice: 60000000,
    thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=600'],
    categoryName: 'Linh kiện',
    brandName: 'ASUS',
    serials: [{ code: 'V1' }],
    specGroups: [
      { name: 'Kỹ thuật', items: [{ key: 'Nhân CUDA', value: '16384' }, { key: 'Xung nhịp OC', value: '2640 MHz' }] },
      { name: 'Bộ nhớ', items: [{ key: 'Dung lượng', value: '24GB GDDR6X' }, { key: 'Giao tiếp', value: '384-bit' }] }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Tier.deleteMany({});
    console.log('Cleared existing data');

    const createdCategories = await Category.insertMany(categories);
    const createdBrands = await Brand.insertMany(brands);
    await Tier.insertMany(tiers);

    const productsToInsert = products.map(p => {
      const cat = createdCategories.find(c => c.name === p.categoryName);
      const br = createdBrands.find(b => b.name === p.brandName);
      return { ...p, category: cat ? cat._id : null, brand: br ? br._id : null };
    });

    await Product.insertMany(productsToInsert);
    console.log(`Inserted ${productsToInsert.length} products`);

    console.log('Seed successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDB();
