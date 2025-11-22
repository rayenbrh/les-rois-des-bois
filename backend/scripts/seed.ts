import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Category, SubProduct, Product } from '../src/models';
import { UserRole } from '../src/types';
import logger from '../src/utils/logger';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/les-rois-des-bois';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      SubProduct.deleteMany({}),
      Product.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      email: 'admin@lesroisdebois.com',
      passwordHash: 'Admin123!', // Will be hashed by pre-save hook
      name: 'Administrator',
      role: UserRole.ADMIN,
      phone: '+216 71 123 456',
      locale: 'ar',
      isActive: true,
    });
    logger.info('Created admin user');

    // Create Commercial User
    const commercial = await User.create({
      email: 'commercial@lesroisdebois.com',
      passwordHash: 'Commercial123!',
      name: 'Ahmed Ben Ali',
      role: UserRole.COMMERCIAL,
      phone: '+216 71 234 567',
      locale: 'ar',
      isActive: true,
    });
    logger.info('Created commercial user');

    // Create Client Users
    await User.create({
      email: 'client1@example.com',
      passwordHash: 'Client123!',
      name: 'محمد الطرابلسي',
      role: UserRole.CLIENT,
      phone: '+216 71 345 678',
      address: 'تونس العاصمة، تونس',
      locale: 'ar',
      assignedCommercial: commercial._id,
      isActive: true,
    });

    await User.create({
      email: 'client2@example.com',
      passwordHash: 'Client123!',
      name: 'فاطمة السعيدي',
      role: UserRole.CLIENT,
      phone: '+216 71 456 789',
      address: 'صفاقس، تونس',
      locale: 'ar',
      assignedCommercial: commercial._id,
      isActive: true,
    });
    logger.info('Created client users');

    // Create Store User
    await User.create({
      email: 'store@lesroisdebois.com',
      passwordHash: 'Store123!',
      name: 'متجر تونس المركزي',
      role: UserRole.STORE,
      phone: '+216 71 567 890',
      locale: 'ar',
      isActive: true,
    });
    logger.info('Created store user');

    // Create Categories
    const furnitureCategory = await Category.create({
      name: {
        ar: 'الأثاث',
        en: 'Furniture',
        fr: 'Meubles',
      },
      slug: 'furniture',
    });

    const tablesCategory = await Category.create({
      name: {
        ar: 'الطاولات',
        en: 'Tables',
        fr: 'Tables',
      },
      slug: 'tables',
      parentId: furnitureCategory._id,
    });

    const chairsCategory = await Category.create({
      name: {
        ar: 'الكراسي',
        en: 'Chairs',
        fr: 'Chaises',
      },
      slug: 'chairs',
      parentId: furnitureCategory._id,
    });

    const lampsCategory = await Category.create({
      name: {
        ar: 'المصابيح',
        en: 'Lamps',
        fr: 'Lampes',
      },
      slug: 'lamps',
    });
    logger.info('Created categories');

    // Create SubProducts (components for special products)
    const woodenLeg1 = await SubProduct.create({
      title: {
        ar: 'أرجل خشبية كلاسيكية',
        en: 'Classic Wooden Legs',
      },
      sku: 'LEG-WOOD-001',
      extraPrice: 50,
      stock: 100,
    });

    const woodenLeg2 = await SubProduct.create({
      title: {
        ar: 'أرجل خشبية حديثة',
        en: 'Modern Wooden Legs',
      },
      sku: 'LEG-WOOD-002',
      extraPrice: 75,
      stock: 80,
    });

    const tableTop1 = await SubProduct.create({
      title: {
        ar: 'سطح طاولة بلوط',
        en: 'Oak Table Top',
      },
      sku: 'TOP-OAK-001',
      extraPrice: 200,
      stock: 50,
    });

    const tableTop2 = await SubProduct.create({
      title: {
        ar: 'سطح طاولة جوز',
        en: 'Walnut Table Top',
      },
      sku: 'TOP-WALNUT-001',
      extraPrice: 250,
      stock: 40,
    });
    logger.info('Created sub-products');

    // Create Standard Products
    await Product.create({
      title: {
        ar: 'كرسي خشبي كلاسيكي',
        en: 'Classic Wooden Chair',
        fr: 'Chaise en bois classique',
      },
      description: {
        ar: 'كرسي خشبي عالي الجودة مصنوع يدوياً من الخشب الطبيعي',
        en: 'High-quality handcrafted wooden chair made from natural wood',
      },
      sku: 'CHAIR-001',
      images: [],
      variants: [
        {
          colorName: { ar: 'بني غامق', en: 'Dark Brown' },
          sku: 'CHAIR-001-BROWN',
          stock: 50,
        },
        {
          colorName: { ar: 'بني فاتح', en: 'Light Brown' },
          sku: 'CHAIR-001-LIGHT',
          stock: 30,
        },
      ],
      price: {
        retail: 150,
      },
      bulkPrices: [
        { minQty: 10, price: 135 },
        { minQty: 50, price: 120 },
      ],
      cost: 80,
      categories: [chairsCategory._id],
      isSpecial: false,
      stockPolicy: 'byVariant',
      createdBy: admin._id,
    });

    await Product.create({
      title: {
        ar: 'مصباح طاولة عصري',
        en: 'Modern Table Lamp',
        fr: 'Lampe de table moderne',
      },
      description: {
        ar: 'مصباح طاولة أنيق بتصميم عصري مع قاعدة خشبية',
        en: 'Elegant table lamp with modern design and wooden base',
      },
      sku: 'LAMP-001',
      images: [],
      variants: [],
      price: {
        retail: 89.99,
      },
      bulkPrices: [
        { minQty: 5, price: 79.99 },
        { minQty: 20, price: 69.99 },
      ],
      cost: 45,
      categories: [lampsCategory._id],
      isSpecial: false,
      stockPolicy: 'byProduct',
      createdBy: admin._id,
    });

    // Create Special Product (customizable table)
    await Product.create({
      title: {
        ar: 'طاولة قابلة للتخصيص',
        en: 'Customizable Table',
        fr: 'Table personnalisable',
      },
      description: {
        ar: 'طاولة فريدة يمكنك تخصيصها بأرجل وسطح من اختيارك',
        en: 'Unique table that you can customize with your choice of legs and top',
      },
      sku: 'TABLE-CUSTOM-001',
      images: [],
      variants: [],
      price: {
        retail: 500, // Base price
      },
      bulkPrices: [
        { minQty: 5, price: 450 },
        { minQty: 10, price: 400 },
      ],
      cost: 200,
      categories: [tablesCategory._id],
      isSpecial: true,
      specialConfig: {
        components: [
          {
            name: 'legs',
            subProductIds: [woodenLeg1._id, woodenLeg2._id],
          },
          {
            name: 'top',
            subProductIds: [tableTop1._id, tableTop2._id],
          },
        ],
        combinationImages: [],
        compositeGeneration: 'manual',
      },
      stockPolicy: 'byComponent',
      createdBy: admin._id,
    });
    logger.info('Created products');

    logger.info('✅ Seed data created successfully!');
    logger.info('\n📝 Sample Accounts:');
    logger.info('Admin: admin@lesroisdebois.com / Admin123!');
    logger.info('Commercial: commercial@lesroisdebois.com / Commercial123!');
    logger.info('Client 1: client1@example.com / Client123!');
    logger.info('Client 2: client2@example.com / Client123!');
    logger.info('Store: store@lesroisdebois.com / Store123!');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
