import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiShoppingCart, FiTrash2, FiCheck } from 'react-icons/fi';
import '../styles/POSSystem.css';

const POSSystem = () => {
  const [saleType, setSaleType] = useState(''); // 'detail' or 'gros'
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (saleType) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { isActive: true } });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getProductPrice = (product, quantity = 1) => {
    if (saleType === 'detail') {
      return product.prixDetail || 0;
    } else if (saleType === 'gros') {
      if (product.prixGros && product.prixGros.length > 0) {
        const sortedPrices = [...product.prixGros].sort((a, b) => b.minQuantity - a.minQuantity);
        const tier = sortedPrices.find(t => quantity >= t.minQuantity);
        return tier ? tier.price : product.prixDetail;
      }
      return product.prixDetail || 0;
    }
    return 0;
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);

    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 1);
    } else {
      const price = getProductPrice(product, 1);
      setCart([...cart, {
        product,
        quantity: 1,
        priceAtSale: price,
        totalPrice: price
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const price = getProductPrice(item.product, newQuantity);
        return {
          ...item,
          quantity: newQuantity,
          priceAtSale: price,
          totalPrice: price * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.2; // 20% tax
    const total = subtotal + tax - discount;

    return { subtotal, tax, total };
  };

  const handleCompleteSale = async () => {
    if (!saleType) {
      alert('Please select sale type (Détail or Gros)');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const { subtotal, tax, total } = calculateTotals();

    try {
      setLoading(true);

      const saleData = {
        saleType,
        items: cart.map(item => ({
          product: item.product._id,
          title: item.product.title,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
          totalPrice: item.totalPrice
        })),
        subtotal,
        discount,
        tax,
        total,
        paymentMethod
      };

      const { data } = await api.post('/sales', saleData);

      alert(`Sale completed! Sale Number: ${data.saleNumber}`);

      // Download receipt PDF
      window.open(`/api/pdf/receipt/${data._id}`, '_blank');

      // Reset cart
      setCart([]);
      setDiscount(0);
      setSaleType('');

    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Error completing sale');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { subtotal, tax, total } = calculateTotals();

  if (!saleType) {
    return (
      <div className="pos-page">
        <div className="container">
          <div className="sale-type-selection">
            <h1>Select Sale Type</h1>
            <p>Choose the pricing mode for this sale</p>

            <div className="sale-type-buttons">
              <button
                className="sale-type-btn"
                onClick={() => { setSaleType('detail'); fetchProducts(); }}
              >
                <h2>Vente en Détail</h2>
                <p>Retail pricing</p>
              </button>

              <button
                className="sale-type-btn"
                onClick={() => { setSaleType('gros'); fetchProducts(); }}
              >
                <h2>Vente en Gros</h2>
                <p>Wholesale pricing</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-page">
      <div className="pos-container">
        <div className="pos-products-section">
          <div className="pos-header">
            <h2>Products</h2>
            <div className="sale-type-badge">
              {saleType === 'detail' ? 'Détail' : 'Gros'}
            </div>
            <button className="btn btn-sm" onClick={() => setSaleType('')}>
              Change Type
            </button>
          </div>

          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="pos-products-grid">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="pos-product-card"
                onClick={() => addToCart(product)}
              >
                <div className="pos-product-image">
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.title} />
                  )}
                </div>
                <div className="pos-product-info">
                  <h4>{product.title}</h4>
                  <span className="pos-product-price">
                    €{getProductPrice(product).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart-section">
          <h2><FiShoppingCart /> Current Sale</h2>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.product._id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.product.title}</h4>
                    <span className="item-price">€{item.priceAtSale.toFixed(2)} each</span>
                  </div>

                  <div className="cart-item-controls">
                    <button
                      className="qty-btn-small"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn-small"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    €{item.totalPrice.toFixed(2)}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Tax (20%):</span>
              <span>€{tax.toFixed(2)}</span>
            </div>

            <div className="discount-row">
              <label>Discount:</label>
              <input
                type="number"
                className="discount-input"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="summary-row total-row">
              <span>Total:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-method">
            <label>Payment Method:</label>
            <select
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="check">Check</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <button
            className="btn btn-gold btn-lg"
            onClick={handleCompleteSale}
            disabled={loading || cart.length === 0}
            style={{ width: '100%' }}
          >
            <FiCheck /> Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSSystem;
