import { Navigate, Outlet } from 'react-router-dom';

// Example: Check if user is logged in (replace this with your actual logic)
const isLoggedIn = () => {
  return !!localStorage.getItem('user'); // Or use context/state
};

const ProtectedRoute = () => {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;