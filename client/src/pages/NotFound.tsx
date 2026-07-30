import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page Not Found');
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Page not found</h1>
      <p className="text-sm text-fc-ink-2 mb-6">This page doesn&apos;t exist yet, or has moved.</p>
      <Link to="/" className="text-sm font-medium text-fc-sage-deep">
        Back to home
      </Link>
    </div>
  );
}
