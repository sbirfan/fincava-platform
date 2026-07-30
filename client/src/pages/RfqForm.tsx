import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { fetchLot, submitRfq, type ApiLot } from '../lib/api.js';
import HoneypotField from '../components/HoneypotField.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function RfqForm() {
  const { lotCode } = useParams<{ lotCode: string }>();
  usePageTitle(lotCode ? `Request a Quote — ${lotCode}` : 'Request a Quote');
  const { profile, loading: authLoading } = useAuth();
  const [lot, setLot] = useState<ApiLot | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lotCode)
      fetchLot(lotCode)
        .then(setLot)
        .catch(() => setLot(null));
  }, [lotCode]);

  if (authLoading) return null;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-sm text-fc-ink-2 mb-4">Sign in to request a quote.</p>
        <Link to="/login" className="text-sm font-medium text-fc-sage-deep">
          Sign in or register
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="max-w-[680px] mx-auto px-6 md:px-8 py-16 text-center">
        <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Request received</h1>
        <p className="text-sm text-fc-ink-2 leading-relaxed text-left">
          Thank you for requesting a quote for lot {lotCode}. We&apos;ll review your requested
          volume, destination, preferred Incoterm, and delivery timing against this lot&apos;s
          current availability and commercial terms, and respond within 2 business days.
        </p>
        <p className="text-sm text-fc-ink-2 leading-relaxed text-left mt-3">
          Our response may include pricing and available volume, proposed terms, follow-up
          questions, or — if the lot can no longer meet your request — a direct explanation of why.
          Submitting this request does not reserve inventory or create a binding quotation.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lotCode) return;
    setStatus('submitting');
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      await submitRfq({
        lotCode,
        requestedVolumeKg: Number(form.get('requestedVolumeKg')),
        destinationCountry: String(form.get('destinationCountry') ?? ''),
        preferredIncoterm: String(form.get('preferredIncoterm') ?? '') || undefined,
        targetDeliveryTimeline: String(form.get('targetDeliveryTimeline') ?? '') || undefined,
        message: String(form.get('message') ?? '') || undefined,
        website: String(form.get('website') ?? ''),
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 md:px-8 py-12">
      <h1 className="font-display font-medium text-[28px] text-fc-ink mb-1">Request a quote</h1>
      <p className="text-sm text-fc-ink-3 mb-1">
        Lot {lotCode}
        {lot ? ` — ${lot.title}` : ''}
      </p>
      <p className="text-sm text-fc-ink-2 leading-relaxed mb-6">
        Tell us the volume and destination you need. We&apos;ll check this lot&apos;s current
        availability and commercial terms and respond within 2 business days — required fields are
        marked with an asterisk.
      </p>

      <div className="bg-fc-paper-2 rounded-fc-md px-4 py-3 mb-6 text-xs text-fc-ink-2">
        Submitting as <strong>{profile.name ?? profile.email}</strong>
        {profile.company ? `, ${profile.company}` : ''} ({profile.email})
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7 flex flex-col gap-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="requestedVolumeKg">
              Requested volume (kg) *
            </label>
            <input
              id="requestedVolumeKg"
              name="requestedVolumeKg"
              type="number"
              min="1"
              step="1"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="destinationCountry">
              Destination country *
            </label>
            <input
              id="destinationCountry"
              name="destinationCountry"
              type="text"
              required
              defaultValue={profile.country ?? ''}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="preferredIncoterm">
              Preferred Incoterm
            </label>
            <input
              id="preferredIncoterm"
              name="preferredIncoterm"
              type="text"
              placeholder="e.g. FOB, CIF"
              aria-describedby="preferredIncoterm-help"
              className={inputClasses}
            />
            <p id="preferredIncoterm-help" className="text-xs text-fc-ink-3 mt-1">
              The shipping term that defines where FINCAVA&apos;s responsibility for the coffee ends
              and yours begins (e.g. FOB origin port, CIF destination port). Leave blank if
              you&apos;re not sure — we&apos;ll propose terms with the quote.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="targetDeliveryTimeline">
              Target delivery timeline
            </label>
            <input
              id="targetDeliveryTimeline"
              name="targetDeliveryTimeline"
              type="text"
              placeholder="e.g. Within 6 weeks"
              className={inputClasses}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-fc-ink-2" htmlFor="message">
            Message
          </label>
          <textarea id="message" name="message" rows={4} className={`${inputClasses} resize-y`} />
        </div>

        <HoneypotField />

        {error && <p className="text-sm text-fc-brick">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="self-start px-6 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit quote request'}
        </button>
      </form>
    </div>
  );
}
