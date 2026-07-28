import { Link } from 'react-router';

// Rendered by the "*" route in App.jsx when no other route matches.
export default function NotFoundPage() {
  return (
    <section className='text-center'>
      <h1 className='text-4xl font-semibold text-(--text-h)'>404</h1>
      <p className='mt-2'>That page doesn't exist.</p>
      <Link to='/' className='mt-4 inline-block text-(--accent)'>
        Go home
      </Link>
    </section>
  );
}
