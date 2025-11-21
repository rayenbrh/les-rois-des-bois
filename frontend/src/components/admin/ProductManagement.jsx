import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>Product Management</h1>
        <button className="btn btn-gold">Add Product</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Prix Détail</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>{product.category?.name}</td>
                <td>{product.stock}</td>
                <td>€{product.prixDetail?.toFixed(2)}</td>
                <td>{product.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-gold">Edit</button>
                  <button className="btn btn-sm btn-danger ml-1" onClick={() => deleteProduct(product._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
