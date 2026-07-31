import { Routes, Route, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedPage from "./pages/ProtectedPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { getMe, syncUser, logoutRequest } from './api/auth';
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';
import { CurrentUserContext } from './context/CurrentUserContext';
import AllRoomsPage from "./pages/AllRoomsPage";

// App does two things:
//   1. maps every URL to a page
//   2. owns the ONE piece of state the whole app cares about: `user`
//
// `user` lives up here because several places need it — the Navbar shows your
// name, ProtectedRoute decides whether to let you through, ProtectedPage shows
// your row. It gets passed DOWN as props. Login and Signup get `setUser` so
// they can report back up after a successful login.
function App() {
  // The user row from OUR database. null = nobody is logged in.
  const [user, setUser] = useState(null);
  // True until our own "am I logged in?" cookie check has answered.
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  // Set if the Auth0 login worked but we couldn't get the matching row from
  // our database. Without this the app would sit on "Checking your session…"
  // forever, waiting for a `user` that is never coming.
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate()

  const {
    isAuthenticated: isAuth0User,
    user: auth0User,
    isLoading: isAuth0Loading,
    getAccessTokenSilently,
    logout: auth0Logout
  } = useAuth0();

  // On a page refresh, THREE things can be in flight at once, and
  // ProtectedRoute must not redirect while any of them is still running —
  // otherwise a logged-in user gets bounced to /login every time they hit F5:
  //
  //   1. our own cookie check (GET /auth/me)
  //   2. Auth0's SDK restoring its session from scratch
  //   3. for Auth0 users, fetching their row from OUR database
  //
  // The third clause is the subtle one. An Auth0 user has no cookie, so step 1
  // finishes almost instantly with user === null. Without waiting for the sync
  // below, there'd be a window where nothing is "loading" but nobody is logged
  // in either — and that window is exactly when the redirect fires.
  const isLoading = isCheckingSession || isAuth0Loading || (isAuth0User && !user && !authError);

  // ---------- 1. on page load: are we already logged in? ----------
  // Our JWT lives in an httpOnly cookie. That cookie survives a refresh, but
  // React state does NOT — so on every load we ask the server who we are.
  // GET /auth/me returns the user if the cookie is good, and 401s if it isn't.
  // A 401 here is the normal "not logged in" answer, not a bug.
  useEffect(() => {
    async function checkIfLoggedIn() {
      try {
        const me = await getMe(); // no token argument -> the cookie is used
        setUser(me);
      } catch {
        setUser(null); // no cookie, or it expired
      } finally {
        setIsCheckingSession(false);
      }
    }

    checkIfLoggedIn();
  }, []);

  // ---------- 2. after an Auth0 (OAuth) login ----------
  // Auth0 knows this person, but OUR database might not. POST /auth/auth0 runs
  // findOrCreate on the backend, so the first social login CREATES their row
  // and every login after that just returns it.
  useEffect(() => {
    if (!isAuth0User || !auth0User) return

    async function saveAuth0User() {
      try {
        const token = await getAccessTokenSilently();
        const dbUser = await syncUser(token, {
          username:
            auth0User.nickname ||
            auth0User.email?.split("@")[0] ||
            "Student",
          email: auth0User.email,
        });
        setUser(dbUser);
        setAuthError(null);
      } catch (error) {
        console.error('Could not sync user:', error.message);
        setAuthError(`Signed in with Auth0, but we couldn't load your account: ${error.message}`)
      }
    };

    saveAuth0User();
  }, [isAuth0User, auth0User, getAccessTokenSilently]);


  // ---------- logging out ----------
  // We can't delete an httpOnly cookie from JavaScript, so logging out HAS to
  // be a request to the server. If the user came in through Auth0, we send
  // them through Auth0's logout too.
  async function handleLogout() {
    try {
      await logoutRequest();
      navigate("/")
    } catch (error) {
      // Even if the request fails, still drop the user locally — staying
      // "logged in" on screen after clicking Log out is the worse outcome.
      console.error('Logout failed:', error.message);
    }

    setUser(null);
    setAuthError(null);

    if (isAuth0User) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }

  return (
    <CurrentUserContext.Provider value={{user, setUser}}>
      <Routes>
        <Route element={<Layout user={user} onLogout={handleLogout} authError={authError} />}>
          <Route path="/" element={<AllRoomsPage />} />
          <Route path='/login' element={<LoginPage setUser={setUser} />} />
          <Route path='/signup' element={<SignUpPage setUser={setUser} />} />
          <Route path='/create' element={<CreateRoomPage/>}/>
          <Route path='/room' element={<RoomPage/>}/>
          {/* Only reachable when logged in — ProtectedRoute redirects otherwise. */}

          <Route
            path='/protected'
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <ProtectedPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </CurrentUserContext.Provider> 
  );
}

export default App;
