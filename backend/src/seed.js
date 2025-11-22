// backend/src/seed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Sale from './models/Sale.js';
import connectDB from './config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Sale.deleteMany({});

    // Create Users - NO MANUAL HASHING, let the model do it
    console.log('Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@lesroisdubois.com',
      password: 'password123', // Plain password - model will hash it
      role: 'admin',
      phone: '+33 1 23 45 67 89',
      isActive: true
    });

    const commercial = await User.create({
      name: 'Jean Dupont',
      email: 'commercial@lesroisdubois.com',
      password: 'password123',
      role: 'commercial',
      phone: '+33 1 23 45 67 90',
      isActive: true
    });

    const posUser = await User.create({
      name: 'POS User',
      email: 'pos@lesroisdubois.com',
      password: 'password123',
      role: 'pos',
      phone: '+33 1 23 45 67 91',
      isActive: true
    });

    const client1 = await User.create({
      name: 'Marie Laurent',
      email: 'marie.laurent@example.com',
      password: 'password123',
      role: 'client',
      phone: '+33 6 12 34 56 78',
      address: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      assignedCommercial: commercial._id,
      isActive: true
    });

    const client2 = await User.create({
      name: 'Pierre Martin',
      email: 'pierre.martin@example.com',
      password: 'password123',
      role: 'client',
      phone: '+33 6 98 76 54 32',
      address: {
        street: '456 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France'
      },
      assignedCommercial: commercial._id,
      isActive: true
    });

    const client3 = await User.create({
      name: 'Sophie Bernard',
      email: 'sophie.bernard@example.com',
      password: 'password123',
      role: 'client',
      phone: '+33 6 11 22 33 44',
      address: {
        street: '789 Boulevard Saint-Germain',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France'
      },
      isActive: true
    });

    // Assign clients to commercial
    commercial.assignedClients = [client1._id, client2._id];
    await commercial.save();

    console.log('✓ Users created');

    // Create Categories
    console.log('Creating categories...');
    const categories = await Category.create([
      {
        name: 'Tables',
        description: 'Elegant dining and coffee tables crafted from premium wood',
        isActive: true
      },
      {
        name: 'Chairs',
        description: 'Comfortable and stylish seating solutions',
        isActive: true
      },
      {
        name: 'Sofas',
        description: 'Luxury sofas and lounges for ultimate comfort',
        isActive: true
      },
      {
        name: 'Bedroom',
        description: 'Premium beds, wardrobes, and bedroom furniture',
        isActive: true
      },
      {
        name: 'Storage',
        description: 'Elegant cabinets, shelves, and storage solutions',
        isActive: true
      },
      {
        name: 'Lighting',
        description: 'Designer lamps and lighting fixtures',
        isActive: true
      }
    ]);

    console.log('✓ Categories created');

    // Create Standard Products
    console.log('Creating products...');
    const products = await Product.create([
      {
        title: 'Royal Oak Dining Table',
        description: 'Handcrafted solid oak dining table with elegant finish. Seats 6-8 people comfortably. Perfect for family gatherings and dinner parties.',
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
          'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800'
        ],
        stock: 15,
        colors: [
          { name: 'Natural Oak', code: '#D4A574', stock: 8 },
          { name: 'Dark Walnut', code: '#5C4033', stock: 7 }
        ],
        prixDetail: 1299.99,
        prixGros: [
          { minQuantity: 1, price: 999.99 },
          { minQuantity: 5, price: 899.99 },
          { minQuantity: 10, price: 799.99 }
        ],
        isActive: true,
        tags: ['dining', 'table', 'oak', 'luxury'],
        sku: 'ROD-001'
      },
      {
        title: 'Versailles Velvet Sofa',
        description: 'Luxurious 3-seater sofa upholstered in premium velvet fabric. Features solid wood frame and high-density foam cushions for superior comfort.',
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800'
        ],
        stock: 8,
        colors: [
          { name: 'Royal Blue', code: '#1E3A8A', stock: 3 },
          { name: 'Emerald Green', code: '#059669', stock: 3 },
          { name: 'Burgundy', code: '#7C2D12', stock: 2 }
        ],
        prixDetail: 2499.99,
        prixGros: [
          { minQuantity: 1, price: 1999.99 },
          { minQuantity: 3, price: 1799.99 },
          { minQuantity: 5, price: 1599.99 }
        ],
        isActive: true,
        tags: ['sofa', 'velvet', 'luxury', 'seating'],
        sku: 'VVS-001'
      },
      {
        title: 'Monaco Leather Armchair',
        description: 'Premium Italian leather armchair with ergonomic design. Perfect for reading corners or executive offices.',
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'
        ],
        stock: 25,
        colors: [
          { name: 'Cognac Brown', code: '#8B4513', stock: 12 },
          { name: 'Black', code: '#000000', stock: 13 }
        ],
        prixDetail: 899.99,
        prixGros: [
          { minQuantity: 1, price: 699.99 },
          { minQuantity: 6, price: 599.99 },
          { minQuantity: 12, price: 499.99 }
        ],
        isActive: true,
        tags: ['chair', 'leather', 'armchair'],
        sku: 'MLA-001'
      },
      {
        title: 'Crystal Chandelier Collection',
        description: 'Stunning crystal chandelier with gold-plated finish. Features 12 LED bulbs and adjustable height.',
        category: categories[5]._id,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'
        ],
        stock: 12,
        colors: [
          { name: 'Gold', code: '#FFD700', stock: 7 },
          { name: 'Silver', code: '#C0C0C0', stock: 5 }
        ],
        prixDetail: 1599.99,
        prixGros: [
          { minQuantity: 1, price: 1299.99 },
          { minQuantity: 3, price: 1099.99 }
        ],
        isActive: true,
        tags: ['lighting', 'chandelier', 'crystal'],
        sku: 'CCC-001'
      },
      {
        title: 'Emperor Bedroom Set',
        description: 'Complete bedroom set including king-size bed, two nightstands, and dresser. Crafted from solid mahogany.',
        category: categories[3]._id,
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'
        ],
        stock: 5,
        colors: [
          { name: 'Mahogany', code: '#C04000', stock: 3 },
          { name: 'Cherry Wood', code: '#8B4513', stock: 2 }
        ],
        prixDetail: 4999.99,
        prixGros: [
          { minQuantity: 1, price: 3999.99 },
          { minQuantity: 2, price: 3499.99 }
        ],
        isActive: true,
        tags: ['bedroom', 'bed', 'set', 'luxury'],
        sku: 'EBS-001'
      },
      {
        title: 'Parisian Coffee Table',
        description: 'Modern coffee table with tempered glass top and marble base. Adds elegance to any living room.',
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800'
        ],
        stock: 20,
        colors: [
          { name: 'White Marble', code: '#F5F5F5', stock: 12 },
          { name: 'Black Marble', code: '#2C2C2C', stock: 8 }
        ],
        prixDetail: 699.99,
        prixGros: [
          { minQuantity: 1, price: 549.99 },
          { minQuantity: 5, price: 479.99 },
          { minQuantity: 10, price: 399.99 }
        ],
        isActive: true,
        tags: ['coffee table', 'modern', 'marble'],
        sku: 'PCT-001'
      },
      {
        title: 'Windsor Storage Cabinet',
        description: 'Elegant storage cabinet with multiple compartments and soft-close doors. Perfect for dining rooms or living spaces.',
        category: categories[4]._id,
        images: [
          'https://images.unsplash.com/photo-1595428773647-d9c56c68d1e4?w=800'
        ],
        stock: 10,
        colors: [
          { name: 'White Oak', code: '#F5DEB3', stock: 5 },
          { name: 'Espresso', code: '#3D2817', stock: 5 }
        ],
        prixDetail: 1199.99,
        prixGros: [
          { minQuantity: 1, price: 949.99 },
          { minQuantity: 3, price: 849.99 }
        ],
        isActive: true,
        tags: ['storage', 'cabinet'],
        sku: 'WSC-001'
      }
    ]);

    console.log('✓ Standard products created');

    // Create Special/Configurable Products
    console.log('Creating special products...');
    await Product.create({
      title: 'Custom Designer Lamp',
      description: 'Create your perfect lamp by selecting the base and lampshade. Mix and match to suit your style.',
      category: categories[5]._id,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'
      ],
      stock: 0,
      isSpecialProduct: true,
      subProducts: [
        {
          name: 'Modern Metal Base - Gold',
          image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
          stock: 15,
          price: 150
        },
        {
          name: 'Classic Wooden Base - Walnut',
          image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
          stock: 20,
          price: 120
        },
        {
          name: 'Minimalist Ceramic Base - White',
          image: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400',
          stock: 18,
          price: 130
        }
      ],
      prixDetail: 349.99,
      prixGros: [
        { minQuantity: 1, price: 279.99 },
        { minQuantity: 5, price: 249.99 }
      ],
      isActive: true,
      tags: ['lamp', 'custom', 'configurable'],
      sku: 'CDL-001'
    });

    console.log('✓ Special products created');

    // Create Sample Orders
    console.log('Creating sample orders...');
    
    const order1 = new Order({
      client: client1._id,
      commercial: commercial._id,
      items: [
        {
          product: products[0]._id,
          title: products[0].title,
          quantity: 2,
          color: { name: 'Natural Oak', code: '#D4A574' },
          priceAtOrder: 999.99,
          totalPrice: 1999.98
        }
      ],
      subtotal: 1999.98,
      tax: 399.99,
      total: 2399.97,
      status: 'delivered',
      isPaid: true,
      paidAt: new Date('2024-01-15'),
      shippingAddress: client1.address
    });
    await order1.save();

    const order2 = new Order({
      client: client2._id,
      commercial: commercial._id,
      items: [
        {
          product: products[1]._id,
          title: products[1].title,
          quantity: 1,
          priceAtOrder: 1999.99,
          totalPrice: 1999.99
        }
      ],
      subtotal: 1999.99,
      tax: 399.99,
      total: 2399.98,
      status: 'in_progress',
      isPaid: false,
      shippingAddress: client2.address
    });
    await order2.save();

    console.log('✓ Sample orders created');

    // Create Sample POS Sales
    console.log('Creating sample POS sales...');
    
    const sale1 = new Sale({
      posUser: posUser._id,
      saleType: 'detail',
      items: [
        {
          product: products[2]._id,
          title: products[2].title,
          quantity: 1,
          priceAtSale: 899.99,
          totalPrice: 899.99
        }
      ],
      subtotal: 899.99,
      tax: 179.99,
      total: 1079.98,
      paymentMethod: 'card'
    });
    await sale1.save();

    console.log('✓ Sample POS sales created');

    // Summary
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Categories: ${await Category.countDocuments()}`);
    console.log(`   Products: ${await Product.countDocuments()}`);
    console.log(`   Orders: ${await Order.countDocuments()}`);
    console.log(`   POS Sales: ${await Sale.countDocuments()}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:      admin@lesroisdubois.com / password123');
    console.log('   Commercial: commercial@lesroisdubois.com / password123');
    console.log('   POS User:   pos@lesroisdubois.com / password123');
    console.log('   Client 1:   marie.laurent@example.com / password123');
    console.log('   Client 2:   pierre.martin@example.com / password123');
    console.log('   Client 3:   sophie.bernard@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();