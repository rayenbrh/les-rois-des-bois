import { useState, useEffect } from 'react';
import api from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div>
      <div className="flex-between mb-3">
        <h1>User Management</h1>
        <button className="btn btn-gold">Add User</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge">{user.role}</span></td>
                <td>{user.phone || '-'}</td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isActive ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => toggleActive(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-gold">Edit</button>
                  <button className="btn btn-sm btn-danger ml-1" onClick={() => deleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
