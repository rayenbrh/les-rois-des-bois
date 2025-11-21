import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import '../styles/SpecialProductConfigurator.css';

const SpecialProductConfigurator = ({ product }) => {
  const navigate = useNavigate();
  const [selectedSubProducts, setSelectedSubProducts] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleSubProductSelect = (index, subProduct) => {
    setSelectedSubProducts({
      ...selectedSubProducts,
      [index]: subProduct
    });
  };

  const isConfigurationComplete = () => {
    return product.subProducts.every((_, idx) => selectedSubProducts[idx]);
  };

  const calculateTotalPrice = () => {
    let total = 0;
    Object.values(selectedSubProducts).forEach(subProduct => {
      total += subProduct.price || 0;
    });

    // Apply wholesale pricing if available
    if (product.prixGros && product.prixGros.length > 0) {
      const sortedPrices = [...product.prixGros].sort((a, b) => b.minQuantity - a.minQuantity);
      const applicableTier = sortedPrices.find(tier => quantity >= tier.minQuantity);
      if (applicableTier) {
        total = applicableTier.price;
      }
    }

    return total;
  };

  const getCombinedImage = () => {
    if (!isConfigurationComplete()) return null;

    // Generate key from selected subproduct IDs
    const selectedIds = Object.values(selectedSubProducts)
      .map(sp => sp._id)
      .sort()
      .join('-');

    // Check if there's a combined image for this configuration
    if (product.combinedImages && product.combinedImages[selectedIds]) {
      return product.combinedImages[selectedIds];
    }

    // Fall back to the first subproduct's image
    return Object.values(selectedSubProducts)[0]?.image;
  };

  const handleAddToCart = () => {
    if (!isConfigurationComplete()) {
      alert('Please select all components');
      return;
    }

    console.log('Adding configured product to cart:', {
      product,
      selectedSubProducts,
      quantity,
      totalPrice: calculateTotalPrice() * quantity
    });

    alert('Configured product added to cart!');
  };

  return (
    <div className="configurator-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Catalog
        </button>

        <h1 className="configurator-title">{product.title}</h1>
        <p className="configurator-subtitle">Configure your custom furniture</p>

        <div className="configurator-container">
          <div className="configurator-preview">
            <h3>Preview</h3>
            <div className="preview-image-container">
              {isConfigurationComplete() ? (
                <img
                  src={getCombinedImage()}
                  alt="Configured product"
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  <p>Select all components to see preview</p>
                </div>
              )}
            </div>

            <div className="configurator-summary">
              <h4>Selected Components:</h4>
              <ul className="selected-list">
                {product.subProducts.map((_, idx) => {
                  const selected = selectedSubProducts[idx];
                  return (
                    <li key={idx}>
                      <strong>Component {idx + 1}:</strong>{' '}
                      {selected ? selected.name : 'Not selected'}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="configurator-pricing">
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

              {isConfigurationComplete() && (
                <>
                  <div className="total-price">
                    <span>Price per unit:</span>
                    <span className="total-value">€{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="total-price grand-total">
                    <span>Total:</span>
                    <span className="total-value">
                      €{(calculateTotalPrice() * quantity).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <button
                className="btn btn-gold btn-lg"
                onClick={handleAddToCart}
                disabled={!isConfigurationComplete()}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          </div>

          <div className="configurator-options">
            {product.subProducts.map((subProductGroup, idx) => (
              <div key={idx} className="sub-product-group">
                <h3>Select Component {idx + 1}</h3>
                <p className="sub-product-description">
                  {subProductGroup.description || `Choose your preferred option`}
                </p>

                <div className="sub-product-options">
                  <div
                    className={`sub-product-option ${
                      selectedSubProducts[idx]?._id === subProductGroup._id ? 'selected' : ''
                    }`}
                    onClick={() => handleSubProductSelect(idx, subProductGroup)}
                  >
                    <div className="sub-product-image">
                      <img src={subProductGroup.image} alt={subProductGroup.name} />
                    </div>
                    <div className="sub-product-info">
                      <h4>{subProductGroup.name}</h4>
                      {subProductGroup.price > 0 && (
                        <span className="sub-product-price">
                          €{subProductGroup.price.toFixed(2)}
                        </span>
                      )}
                      {subProductGroup.stock !== undefined && (
                        <span className={`sub-product-stock ${subProductGroup.stock === 0 ? 'out' : ''}`}>
                          {subProductGroup.stock > 0
                            ? `${subProductGroup.stock} in stock`
                            : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialProductConfigurator;
