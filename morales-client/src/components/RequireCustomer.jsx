import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireCustomer = ({ children }) => {
  const { user, isAdmin, isSupplier, loading } = useAuth();
  if (loading) return <p className="p-8 text-sm text-zinc-600">Checking your session...</p>;
  if (!user) return <Navigate to="/auth/signin" replace />;
  return isAdmin || isSupplier ? <Navigate to="/" replace /> : children;
};

export default RequireCustomer;
