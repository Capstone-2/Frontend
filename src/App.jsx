import { Routes, Route } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedPage from './pages/ProtectedPage';
import ProtectedRoute from './components/ProtectedRoute';
import { syncUser } from './api/auth';

// App maps every URL to a page. It ALSO handles the auth "sync": once Auth0
// says we're logged in, we make sure the user exists in our own database.
function App() {
  const {
    isAuthenticated,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();

  // Our database's record for the logged-in user. This is separate from
  // `auth0User` (which is the profile Auth0 gives us). We keep it here so any
  // page could use it later.
  const [currentUser, setCurrentUser] = useState(null);

  // When Auth0 confirms the user is logged in, sync them into our database.
  // The backend's /auth/auth0 route uses findOrCreate, so a single call both
  // CREATES the user the first time and RETURNS the existing row after that —
  // exactly the "store them if they don't already exist" behavior we want.
  useEffect(() => {
    if (!isAuthenticated || !auth0User) return;

    const sync = async () => {
      try {
        const token = await getAccessTokenSilently();
        const dbUser = await syncUser(token, {
          username: auth0User.nickname || auth0User.email?.split('@')[0],
        });
        setCurrentUser(dbUser);
      } catch (err) {
        console.error('Could not sync user:', err.message);
      }
    };

    sync();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/tasks' element={<TasksPage />} />
        <Route path='/tasks/:id' element={<TaskDetailPage />} />
        {/* Only reachable when logged in — ProtectedRoute redirects otherwise. */}
        <Route
          path='/protected'
          element={
            <ProtectedRoute>
              <ProtectedPage />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
