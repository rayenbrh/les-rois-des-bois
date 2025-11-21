import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientCatalog from './pages/ClientCatalog';
import POSSystem from './pages/POSSystem';
import CommercialDashboard from './pages/CommercialDashboard';
import ProductDetails from './pages/ProductDetails';
import OrderDetails from './pages/OrderDetails';
import Credits from './pages/Credits';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute><NavbarWrapper /></PrivateRoute>}>
                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute roles={['admin']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Client Routes */}
                <Route
                  path="/catalog"
                  element={
                    <PrivateRoute roles={['client']}>
                      <ClientCatalog />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <PrivateRoute roles={['client', 'admin', 'pos']}>
                      <ProductDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/credits"
                  element={
                    <PrivateRoute roles={['client', 'admin', 'commercial']}>
                      <Credits />
                    </PrivateRoute>
                  }
                />

                {/* POS Routes */}
                <Route
                  path="/pos"
                  element={
                    <PrivateRoute roles={['pos', 'admin']}>
                      <POSSystem />
                    </PrivateRoute>
                  }
                />

                {/* Commercial Routes */}
                <Route
                  path="/commercial/*"
                  element={
                    <PrivateRoute roles={['commercial']}>
                      <CommercialDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Common Routes */}
                <Route
                  path="/order/:id"
                  element={
                    <PrivateRoute>
                      <OrderDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Default redirect based on role */}
                <Route path="/" element={<RoleBasedRedirect />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

const NavbarWrapper = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'client':
      return <Navigate to="/catalog" replace />;
    case 'pos':
      return <Navigate to="/pos" replace />;
    case 'commercial':
      return <Navigate to="/commercial" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
