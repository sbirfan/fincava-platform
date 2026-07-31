import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { SHOW_OUR_STORY_PAGE } from '../lib/featureFlags.js';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/lots', label: 'Available Lots' },
  { to: '/about', label: 'About' },
  ...(SHOW_OUR_STORY_PAGE ? [{ to: '/our-story', label: 'Our Story' }] : []),
  { to: '/contact', label: 'Contact' },
];

function navLinkClasses(isActive: boolean): string {
  return [
    'px-3.5 py-2 rounded-fc-md text-sm font-medium transition-colors',
    isActive ? 'bg-fc-sage-soft text-fc-sage-deep' : 'text-fc-ink hover:bg-fc-paper-2',
  ].join(' ');
}

export default function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-fc-paper text-fc-ink">
      <header className="border-b border-fc-line bg-fc-paper">
        <nav className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 px-6 py-3.5">
          <NavLink to="/" className="mr-4 shrink-0 flex items-center gap-2">
            <img src="/images/fincava-logo.png" alt="FINCAVA" className="h-11 w-auto" />
            <span className="inline-flex items-center rounded-fc-pill bg-fc-sage-soft text-fc-sage-deep text-[10px] font-medium font-sans px-2 py-0.5">
              Beta
            </span>
          </NavLink>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => navLinkClasses(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
          <span className="flex-1" />
          {profile ? (
            <>
              <NavLink
                to="/profile"
                className="px-4 py-2 rounded-fc-md text-sm font-medium text-fc-ink hover:bg-fc-paper-2"
              >
                My Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-fc-md text-sm font-medium border border-fc-border-strong text-fc-ink hover:bg-fc-paper-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 rounded-fc-md text-sm font-medium border border-fc-border-strong text-fc-ink hover:bg-fc-paper-2"
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-fc-line bg-fc-paper-2">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap gap-x-10 gap-y-4 text-sm text-fc-ink-2">
          <img src="/images/fincava-logo.png" alt="FINCAVA" className="h-9 w-auto" />
          <NavLink to="/lots" className="hover:text-fc-ink">
            Available Lots
          </NavLink>
          <NavLink to="/about" className="hover:text-fc-ink">
            About
          </NavLink>
          {SHOW_OUR_STORY_PAGE && (
            <NavLink to="/our-story" className="hover:text-fc-ink">
              Our Story
            </NavLink>
          )}
          <NavLink to="/contact" className="hover:text-fc-ink">
            Contact
          </NavLink>
          <NavLink to="/verification" className="hover:text-fc-ink">
            Request Farm Verification
          </NavLink>
          <NavLink to="/privacy" className="hover:text-fc-ink">
            Privacy Policy
          </NavLink>
          <NavLink to="/terms" className="hover:text-fc-ink">
            Terms of Service
          </NavLink>
          <span className="w-full text-fc-ink-3 text-xs mt-2">
            &copy; {new Date().getFullYear()} FINCAVA. A Green Coffee Buyer Relationship Platform.
          </span>
        </div>
      </footer>
    </div>
  );
}
