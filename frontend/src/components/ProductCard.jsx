import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images && product.images.length > 0
    ? product.images[imageIndex]
    : '/placeholder-product.jpg';

  // Get the wholesale price (gros) - take the first tier or detail price
  const displayPrice = product.prixGros && product.prixGros.length > 0
    ? product.prixGros[0].price
    : product.prixDetail;

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`} className="product-image-container">
        <img
          src={mainImage}
          alt={product.title}
          className={`product-image ${isHovered ? 'zoomed' : ''}`}
        />
        {product.isSpecialProduct && (
          <span className="special-badge">Configurable</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </Link>

      <div className="product-info">
        <h3 className="product-title">
          <Link to={`/product/${product._id}`}>{product.title}</Link>
        </h3>

        <p className="product-description">
          {product.description.substring(0, 80)}...
        </p>

        {product.colors && product.colors.length > 0 && (
          <div className="product-colors">
            {product.colors.slice(0, 5).map((color, idx) => (
              <span
                key={idx}
                className="color-dot"
                style={{ backgroundColor: color.code }}
                title={color.name}
              ></span>
            ))}
            {product.colors.length > 5 && (
              <span className="color-more">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            <span className="price-label">Prix en Gros</span>
            <span className="price-value">€{displayPrice?.toFixed(2)}</span>
          </div>

          <Link to={`/product/${product._id}`} className="btn btn-outline-gold btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
