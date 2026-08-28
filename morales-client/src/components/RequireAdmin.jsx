import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireAdmin = ({ children }) => {
  const { isAdmin, isSupplier, loading } = useAuth();
  if (loading) return <p className="p-8 text-sm text-zinc-600">Checking your session...</p>;
  return isAdmin || isSupplier ? children : <Navigate to="/" replace />;
};

export default RequireAdmin;
