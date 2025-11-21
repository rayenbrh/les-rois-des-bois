import { useState, useEffect } from 'react';
import api from '../../utils/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', formData);
      setShowForm(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>Category Management</h1>
        <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-3 p-3">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-gold">Create Category</button>
        </form>
      )}

      <div className="grid grid-3">
        {categories.map(category => (
          <div key={category._id} className="card">
            <h3>{category.name}</h3>
            <p>{category.description || 'No description'}</p>
            <div className="flex gap-1 mt-2">
              <button className="btn btn-sm btn-outline-gold">Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(category._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
