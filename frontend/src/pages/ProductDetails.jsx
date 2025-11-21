import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SpecialProductConfigurator from '../components/SpecialProductConfigurator';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicablePrice = () => {
    if (!product) return 0;

    // For clients, use wholesale pricing
    if (product.prixGros && product.prixGros.length > 0) {
      const sortedPrices = [...product.prixGros].sort((a, b) => b.minQuantity - a.minQuantity);
      const applicableTier = sortedPrices.find(tier => quantity >= tier.minQuantity);
      return applicableTier ? applicableTier.price : product.prixDetail;
    }

    return product.prixDetail || 0;
  };

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Adding to cart:', {
      product,
      selectedColor,
      quantity,
      price: getApplicablePrice()
    });
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn btn-gold mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (product.isSpecialProduct) {
    return <SpecialProductConfigurator product={product} />;
  }

  const mainImage = product.images && product.images.length > 0
    ? product.images[selectedImage]
    : '/placeholder-product.jpg';

  return (
    <div className="product-details-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Catalog
        </button>

        <div className="product-details-container">
          <div className="product-images-section">
            <div className="main-image-container">
              <img src={mainImage} alt={product.title} className="main-image" />
              {product.stock === 0 && (
                <div className="out-of-stock-overlay">Out of Stock</div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info-section">
            <h1 className="product-title">{product.title}</h1>

            <div className="product-category">
              {product.category?.name}
            </div>

            <div className="product-price-display">
              <span className="price-label">Prix en Gros</span>
              <span className="price-value">€{getApplicablePrice().toFixed(2)}</span>
              <span className="price-per-unit">per unit</span>
            </div>

            {product.prixGros && product.prixGros.length > 1 && (
              <div className="price-tiers">
                <h4>Volume Pricing:</h4>
                <ul>
                  {product.prixGros.map((tier, idx) => (
                    <li key={idx} className={quantity >= tier.minQuantity ? 'active' : ''}>
                      {tier.minQuantity}+ units: <strong>€{tier.price.toFixed(2)}</strong> each
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="color-selection">
                <h4>Available Colors:</h4>
                <div className="color-options">
                  {product.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className={`color-option ${selectedColor?.name === color.name ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: color.code }}
                      ></div>
                      <span className="color-name">{color.name}</span>
                      {color.stock !== undefined && (
                        <span className="color-stock">
                          {color.stock > 0 ? `${color.stock} in stock` : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="quantity-selection">
              <h4>Quantity:</h4>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="total-price">
              <span>Total:</span>
              <span className="total-value">
                €{(getApplicablePrice() * quantity).toFixed(2)}
              </span>
            </div>

            <button
              className="btn btn-gold btn-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || (selectedColor && selectedColor.stock === 0)}
              style={{ width: '100%' }}
            >
              <FiShoppingCart /> Add to Cart
            </button>

            {product.stock > 0 && product.stock < 10 && (
              <div className="stock-warning">
                Only {product.stock} items left in stock!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
