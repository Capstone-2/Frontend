import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router';

// A route guard. Wrap any <Route>'s element in <ProtectedRoute> to require login.
// - While Auth0 is still checking the session, show a loading line.
// - If the user is NOT logged in, redirect them to the home page.
// - If they ARE logged in, render the page (children).
export default function ProtectedRoute({ user, isLoading, children }) {
  const location = useLocation()

  if (isLoading) return <p>Checking your session…</p>;
  if (!user) return <Navigate to='/login' state={{ from: location.pathname }} replace />;

  return children;
}
