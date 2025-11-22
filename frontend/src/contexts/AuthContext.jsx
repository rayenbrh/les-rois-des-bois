import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
  try {
    console.log('Attempting login with:', email); // ADD THIS
    const { data } = await axios.post('/api/auth/login', { email, password });
    console.log('Login successful:', data); // ADD THIS

    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

    setUser(data);
    return { success: true };
  } catch (error) {
    console.error('Login error details:', error); // ADD THIS
    console.error('Error response:', error.response); // ADD THIS
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    isCommercial: user?.role === 'commercial',
    isPOS: user?.role === 'pos'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
