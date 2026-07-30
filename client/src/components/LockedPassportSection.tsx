import { Link } from 'react-router-dom';

// The passport page's primary conversion mechanism — anonymous visitors see
// this instead of technical specs, pricing, and sample availability.
// Nothing is faked or blurred here: the server never sends gated fields to
// an anonymous request, so there is no real data to obscure.
export default function LockedPassportSection() {
  return (
    <div className="relative bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6 flex flex-col items-center text-center gap-2">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--fc-sage-deep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <p className="font-display text-base font-medium text-fc-ink">
        Sign in or register free to unlock
      </p>
      <p className="text-xs text-fc-ink-3">
        Full specs, exact pricing, and quote and sample requests
      </p>
      <Link
        to="/login"
        className="mt-2 inline-block px-5 py-2.5 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper"
      >
        Sign in or register
      </Link>
    </div>
  );
}
