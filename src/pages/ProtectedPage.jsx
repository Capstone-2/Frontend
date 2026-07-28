import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getProtected } from '../api/auth';

// A simple page to TEST the protected backend endpoint. ProtectedRoute makes
// sure you can only get here when logged in. The button then calls
// /api/protected with your Auth0 access token and shows what came back.
export default function ProtectedPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleTest() {
    setError(null);
    try {
      const token = await getAccessTokenSilently(); // the Auth0 access token
      const data = await getProtected(token); // send it to the backend
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1 className='mb-6 text-3xl font-semibold text-(--text-h)'>Protected</h1>
      <p className='mb-4'>You can only see this page while logged in.</p>

      <button
        onClick={handleTest}
        className='rounded-md bg-(--accent) px-4 py-2 font-medium text-white'
      >
        Call /api/protected
      </button>

      {error && <p className='mt-4 text-red-500'>{error}</p>}

      {result && (
        <pre className='mt-4 overflow-x-auto rounded-md border border-(--border) p-4 text-left text-sm'>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
