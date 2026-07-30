import { type FormEvent, useState } from 'react';
import { submitVerificationRequest } from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function Verification() {
  usePageTitle('Request Farm Verification');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      await submitVerificationRequest({
        requesterName: String(form.get('requesterName') ?? ''),
        requesterEmail: String(form.get('requesterEmail') ?? ''),
        requesterCompany: String(form.get('requesterCompany') ?? ''),
        requesterPhone: String(form.get('requesterPhone') ?? ''),
        country: String(form.get('country') ?? ''),
        regionOfInterest: String(form.get('regionOfInterest') ?? ''),
        farmOrLotOfInterest: String(form.get('farmOrLotOfInterest') ?? ''),
        message: String(form.get('message') ?? ''),
        // Honeypot — hidden from real visitors via the input's own styling.
        website: String(form.get('website') ?? ''),
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'done') {
    return (
      <div className="max-w-[680px] mx-auto px-6 md:px-8 py-16 text-center">
        <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Request received</h1>
        <p className="text-sm text-fc-ink-2 leading-relaxed text-left">
          We received your verification request. Within 5 business days, we&apos;ll review the
          location, farm, producer, or lot you named, confirm whether it&apos;s feasible and within
          our field coverage, and come back to you with a proposed scope, what we&apos;d document,
          deliverables, timing, and pricing — or a clarifying question if we need more detail first.
        </p>
        <p className="text-sm text-fc-ink-2 leading-relaxed text-left mt-3">
          That 5-business-day window covers this initial scoping and response, not completion of the
          fieldwork or report itself. If a request isn&apos;t one we can take on — for example, it
          falls outside our current field coverage — we&apos;ll tell you plainly rather than leave
          it open.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 md:px-8 py-12">
      <span className="inline-block text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-fc-pill bg-fc-sage-soft text-fc-sage-deep">
        Open to everyone · No account needed
      </span>
      <h1 className="font-display font-medium text-[30px] text-fc-ink mt-4 mb-3">
        Request farm verification
      </h1>
      <p className="text-sm text-fc-ink-2 leading-relaxed mb-4">
        Not every buyer is ready to place an order. FINCAVA offers fee-based farm, producer, origin,
        and lot verification — field visits, photography, documentation, and reporting — so you can
        evaluate a farm or lot before committing funds.
      </p>
      <p className="text-sm text-fc-ink-2 leading-relaxed mb-8">
        This is field verification and documentation, not certification, an audit, or a guarantee.
        FINCAVA is not an independent third party for this service — verification is one of our own
        revenue lines alongside coffee procurement and resale, and we may also stand to earn income
        from a lot's purchase — so every report is written to separate what we directly observed
        from what a producer told us and anything we couldn&apos;t confirm.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7 flex flex-col gap-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="requesterName">
              Name *
            </label>
            <input
              id="requesterName"
              name="requesterName"
              type="text"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="requesterEmail">
              Email *
            </label>
            <input
              id="requesterEmail"
              name="requesterEmail"
              type="email"
              required
              className={inputClasses}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="requesterCompany">
              Company *
            </label>
            <input
              id="requesterCompany"
              name="requesterCompany"
              type="text"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="requesterPhone">
              Phone
            </label>
            <input id="requesterPhone" name="requesterPhone" type="tel" className={inputClasses} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="country">
              Country
            </label>
            <input id="country" name="country" type="text" className={inputClasses} />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="regionOfInterest">
              Region of interest
            </label>
            <input
              id="regionOfInterest"
              name="regionOfInterest"
              type="text"
              placeholder="e.g. Santander, Boyacá"
              className={inputClasses}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-fc-ink-2" htmlFor="farmOrLotOfInterest">
            Farm or lot of interest
          </label>
          <input
            id="farmOrLotOfInterest"
            name="farmOrLotOfInterest"
            type="text"
            placeholder="If known"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-fc-ink-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="What would you like us to verify?"
            className={`${inputClasses} resize-y`}
          />
        </div>

        {/* Honeypot — hidden from real users (off-screen + unfocusable), not
            just visually hidden with display:none, since some bots skip
            display:none fields specifically. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {error && <p className="text-sm text-fc-brick">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="self-start px-6 py-3 rounded-fc-md text-[15px] font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  );
}
