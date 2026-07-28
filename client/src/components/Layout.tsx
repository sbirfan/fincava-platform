import { NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/lots', label: 'Available Lots' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function navLinkClasses(isActive: boolean): string {
  return [
    'px-3.5 py-2 rounded-fc-md text-sm font-medium transition-colors',
    isActive ? 'bg-fc-sage-soft text-fc-sage-deep' : 'text-fc-ink hover:bg-fc-paper-2',
  ].join(' ');
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-fc-paper text-fc-ink">
      <header className="border-b border-fc-line bg-fc-paper">
        <nav className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 px-6 py-3.5">
          <NavLink to="/" className="font-display text-xl font-medium text-fc-ink mr-4">
            FINCAVA
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
          <NavLink
            to="/login"
            className="px-4 py-2 rounded-fc-md text-sm font-medium border border-fc-border-strong text-fc-ink hover:bg-fc-paper-2"
          >
            Sign in
          </NavLink>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-fc-line bg-fc-paper-2">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap gap-x-10 gap-y-4 text-sm text-fc-ink-2">
          <span className="font-display text-base text-fc-ink">FINCAVA</span>
          <NavLink to="/lots" className="hover:text-fc-ink">
            Available Lots
          </NavLink>
          <NavLink to="/about" className="hover:text-fc-ink">
            About
          </NavLink>
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
