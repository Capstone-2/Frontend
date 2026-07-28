import { Outlet } from 'react-router';
import Navbar from './Navbar';

// Layout is the frame every page shares: navbar on top, page below.
// <Outlet /> is the slot where the matched child route renders.
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col text-left">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
