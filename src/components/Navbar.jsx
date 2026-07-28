import { NavLink } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';

// NavLink is like an <a> tag but for client-side routing: it navigates without
// a full page reload, and it tells us when its route is active so we can style it.
export default function Navbar() {
  // The Auth0 hook gives us the login/logout actions and the current auth state.
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } =
    useAuth0();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--text-h)]'
    }`;

  return (
    <header className='border-b border-(--border)'>
      <nav className='mx-auto flex max-w-3xl items-center gap-2 px-4 py-3'>
        <NavLink
          to='/'
          className='mr-auto text-lg font-semibold text-(--text-h)'
        >
          Capstone
        </NavLink>
        {/* `end` makes "Home" active only on "/" exactly, not on every route. */}
        <NavLink to='/' end className={linkClass}>
          Home
        </NavLink>
        <NavLink to='/tasks' className={linkClass}>
          Tasks
        </NavLink>
        {/* Only show the protected link once the user is logged in. */}
        {isAuthenticated && (
          <NavLink to='/protected' className={linkClass}>
            Protected
          </NavLink>
        )}

        {/* Auth controls: a Log in button, or the user's name + Log out. */}
        {isLoading ? null : isAuthenticated ? (
          <>
            <span className='px-2 text-sm text-(--text)'>
              {user?.name || user?.email}
            </span>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className='rounded-md px-3 py-2 text-sm font-medium hover:text-(--text-h)'
            >
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className='rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-white'
          >
            Log in
          </button>
        )}
      </nav>
    </header>
  );
}
