import { useState, useEffect } from 'react';
import api from '../../utils/api';

const CommercialClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/users/commercial/clients');
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: '4rem 0' }}><div className="spinner"></div></div>;

  return (
    <div>
      <h1 className="mb-3">My Clients</h1>

      {clients.length === 0 ? (
        <p>No clients assigned</p>
      ) : (
        <div className="grid grid-3">
          {clients.map(client => (
            <div key={client._id} className="card">
              <h3>{client.name}</h3>
              <p className="mb-1"><strong>Email:</strong> {client.email}</p>
              {client.phone && <p className="mb-1"><strong>Phone:</strong> {client.phone}</p>}
              <p className="mt-2"><strong>Status:</strong> <span className={client.isActive ? 'text-success' : 'text-danger'}>{client.isActive ? 'Active' : 'Inactive'}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommercialClients;
