import { type FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { fetchLot, submitSampleRequest, type ApiLot } from '../lib/api.js';
import HoneypotField from '../components/HoneypotField.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function SampleRequestForm() {
  const { lotCode } = useParams<{ lotCode: string }>();
  const { profile, loading: authLoading } = useAuth();
  const [lot, setLot] = useState<ApiLot | null>(null);
  const [lotLoading, setLotLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lotCode) return;
    fetchLot(lotCode)
      .then(setLot)
      .catch(() => setLot(null))
      .finally(() => setLotLoading(false));
  }, [lotCode]);

  if (authLoading || lotLoading) return null;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-sm text-fc-ink-2 mb-4">Sign in to request a sample.</p>
        <Link to="/login" className="text-sm font-medium text-fc-sage-deep">
          Sign in / Register
        </Link>
      </div>
    );
  }

  // Server-side enforcement is the real gate — this is just the matching
  // client-side reflection of it, so the button doesn't even appear (or
  // shows an explanation) when samples aren't offered for this lot.
  if (!lot || !lot.sampleAvailable) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-sm text-fc-ink-2 mb-4">
          Samples aren&apos;t currently available for this lot.
        </p>
        <Link to={`/lots/${lotCode}`} className="text-sm font-medium text-fc-sage-deep">
          Back to lot
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="max-w-[680px] mx-auto px-6 md:px-8 py-16 text-center">
        <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Request received</h1>
        <p className="text-sm text-fc-ink-2">
          We received your sample request for lot {lotCode}. We respond within 2 business days.
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
      await submitSampleRequest({
        lotCode,
        sampleDestination: String(form.get('sampleDestination') ?? ''),
        courierAccount: String(form.get('courierAccount') ?? '') || undefined,
        evaluationTimeline: String(form.get('evaluationTimeline') ?? '') || undefined,
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
      <h1 className="font-display font-medium text-[28px] text-fc-ink mb-1">Request a Sample</h1>
      <p className="text-sm text-fc-ink-3 mb-6">
        Lot {lotCode} — {lot.title}
      </p>

      <div className="bg-fc-paper-2 rounded-fc-md px-4 py-3 mb-6 text-xs text-fc-ink-2">
        Submitting as <strong>{profile.name ?? profile.email}</strong>
        {profile.company ? `, ${profile.company}` : ''} ({profile.email})
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7 flex flex-col gap-4"
      >
        <div>
          <label className="text-sm font-semibold text-fc-ink" htmlFor="sampleDestination">
            Sample destination *
          </label>
          <textarea
            id="sampleDestination"
            name="sampleDestination"
            rows={2}
            required
            placeholder="Shipping address for the sample"
            className={`${inputClasses} resize-y`}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="courierAccount">
              Courier account
            </label>
            <input
              id="courierAccount"
              name="courierAccount"
              type="text"
              placeholder="e.g. FedEx account #"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="evaluationTimeline">
              Evaluation timeline
            </label>
            <input
              id="evaluationTimeline"
              name="evaluationTimeline"
              type="text"
              placeholder="e.g. Within 2 weeks of arrival"
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
          {status === 'submitting' ? 'Submitting…' : 'Submit Sample Request'}
        </button>
      </form>
    </div>
  );
}
