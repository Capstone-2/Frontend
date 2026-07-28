import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.jsx';

const authConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email',
  },
};

// Fail loudly if the Auth0 env vars are missing, instead of silently breaking
// login later. Copy .env.example to .env and fill in your VITE_AUTH0_* values.
if (!authConfig.domain || !authConfig.clientId || !authConfig.authorizationParams.audience) {
  throw new Error('Missing Auth0 env vars — copy .env.example to .env and set your VITE_AUTH0_* values.');
}

// BrowserRouter turns on client-side routing for the whole app, so moving
// between pages doesn't reload the browser.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider {...authConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
);
