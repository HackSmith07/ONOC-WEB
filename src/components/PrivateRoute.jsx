import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AppProvider'; 

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;
