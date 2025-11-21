import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import '../styles/Catalog.css';

const ClientCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        isActive: true,
        ...(selectedCategory && { category: selectedCategory })
      };
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="catalog-page">
      <div className="container">
        <header className="catalog-header">
          <h1>Luxury Furniture Catalog</h1>
          <p>Discover our exclusive collection of premium furniture</p>
        </header>

        <div className="catalog-filters">
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category._id}
                className={`filter-btn ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '4rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="no-products">
                <p>No products found</p>
              </div>
            )}
          </div>
        )}

        {cart.length > 0 && (
          <Link to="/cart" className="floating-cart-btn">
            <span className="cart-count">{cart.length}</span>
            View Cart
          </Link>
        )}
      </div>
    </div>
  );
};

export default ClientCatalog;
