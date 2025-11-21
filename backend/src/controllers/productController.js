import Product from '../models/Product.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product stock (Admin only)
export const updateProductStock = async (req, res) => {
  try {
    const { stock, colorStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (colorStock && Array.isArray(colorStock)) {
      colorStock.forEach(({ name, stock }) => {
        const color = product.colors.find(c => c.name === name);
        if (color) {
          color.stock = stock;
        }
      });
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate price for product based on quantity and type
export const calculatePrice = async (req, res) => {
  try {
    const { productId, quantity, priceType } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let price = 0;

    if (priceType === 'detail') {
      price = product.prixDetail;
    } else if (priceType === 'gros') {
      // Find the applicable price tier
      const sortedPrices = product.prixGros.sort((a, b) => b.minQuantity - a.minQuantity);
      const applicableTier = sortedPrices.find(tier => quantity >= tier.minQuantity);
      price = applicableTier ? applicableTier.price : product.prixDetail;
    }

    res.json({ price, total: price * quantity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
