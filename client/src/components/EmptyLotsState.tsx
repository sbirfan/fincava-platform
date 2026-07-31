import { Link } from 'react-router-dom';

// Shown when there are zero visible lots in the entire catalog (not just
// zero matches for the current filters — see the filter-empty message in
// AvailableLots.tsx, which stays a separate, simpler in-place message since
// other lots do exist in that case). Styled after the site's existing
// gated-CTA card (see LockedPassportSection.tsx) rather than a new pattern.
export default function EmptyLotsState({ authenticated }: { authenticated: boolean }) {
  return (
    <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-8 md:p-10 flex flex-col items-center text-center gap-2">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--fc-sage-deep)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 8 12 3 3 8" />
        <path d="M21 8v8l-9 5-9-5V8" />
        <path d="M21 8 12 13 3 8" />
        <path d="M12 13v8" />
      </svg>
      <p className="font-display text-base font-medium text-fc-ink">No lots listed yet</p>
      <p className="text-xs text-fc-ink-3 max-w-[42ch]">
        FINCAVA is newly launched and actively sourcing its first Colombian lots. Submit a sourcing
        request and we&apos;ll follow up directly as inventory becomes available.
      </p>
      <Link
        to={authenticated ? '/sourcing-request' : '/login'}
        className="mt-2 inline-block px-5 py-2.5 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper"
      >
        Submit a Sourcing Request
      </Link>
    </div>
  );
}
