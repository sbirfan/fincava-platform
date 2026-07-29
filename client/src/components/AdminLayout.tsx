import { useEffect } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.js';
import { fetchAdminDashboard } from '../lib/adminApi.js';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/lots', label: 'Lots' },
  { to: '/admin/buyers', label: 'Buyers' },
  { to: '/admin/requests', label: 'Requests' },
  { to: '/admin/market-intelligence', label: 'Market Intelligence' },
  { to: '/admin/alert-outreach', label: 'Alert Outreach' },
];

function navLinkClasses(isActive: boolean): string {
  return [
    'block px-3.5 py-2 rounded-fc-md text-sm font-medium transition-colors',
    isActive ? 'bg-fc-sage-soft text-fc-sage-deep' : 'text-fc-ink hover:bg-fc-paper-2',
  ].join(' ');
}

export default function AdminLayout() {
  const { status, markAuthenticated, markUnauthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== 'checking') return;
    fetchAdminDashboard()
      .then(() => markAuthenticated())
      .catch(() => markUnauthenticated());
  }, [status, markAuthenticated, markUnauthenticated]);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  if (status === 'checking') {
    return <div className="px-6 py-16 text-center text-sm text-fc-ink-3">Loading…</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-fc-paper text-fc-ink">
      <aside className="w-56 shrink-0 border-r border-fc-line bg-fc-white px-4 py-6 flex flex-col gap-1">
        <div className="px-3.5 pb-4 text-xs font-semibold uppercase tracking-wide text-fc-ink-3">
          FINCAVA Admin
        </div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => navLinkClasses(isActive)}
          >
            {link.label}
          </NavLink>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-2 text-left rounded-fc-md text-sm font-medium border border-fc-border-strong text-fc-ink hover:bg-fc-paper-2"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 min-w-0 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
