import { DELIVERY_WINDOW, INTENDED_USE, VOLUME_FLEXIBILITY } from '@fincava/shared';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { submitSourcingRequest } from '../lib/api.js';
import HoneypotField from '../components/HoneypotField.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

const INTENDED_USE_LABELS: Record<string, string> = {
  HOUSE_BLEND: 'House blend',
  SINGLE_ORIGIN: 'Single origin',
  ESPRESSO_BLEND: 'Espresso blend',
  COMPETITION: 'Competition',
  PRIVATE_LABEL: 'Private label',
  RESALE_DISTRIBUTION: 'Resale / distribution',
  OTHER: 'Other / open to suggestions',
};

const VOLUME_FLEXIBILITY_LABELS: Record<string, string> = {
  EXACT: 'Exact volume needed',
  APPROXIMATE: 'Approximate',
  FLEXIBLE: 'Flexible / open to suggestions',
};

const DELIVERY_WINDOW_LABELS: Record<string, string> = {
  ASAP: 'As soon as possible',
  WITHIN_1_MONTH: 'Within 1 month',
  WITHIN_3_MONTHS: 'Within 3 months',
  NEXT_HARVEST: 'Next harvest',
  FLEXIBLE: 'Flexible / open to suggestions',
};

function parseList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export default function SourcingRequestForm() {
  const { profile, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (authLoading) return null;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-sm text-fc-ink-2 mb-4">Sign in to submit a sourcing request.</p>
        <Link to="/login" className="text-sm font-medium text-fc-sage-deep">
          Sign in / Register
        </Link>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="max-w-[680px] mx-auto px-6 md:px-8 py-16 text-center">
        <h1 className="font-display font-medium text-2xl text-fc-ink mb-3">Request received</h1>
        <p className="text-sm text-fc-ink-2">
          We received your sourcing request. We&apos;ll search our network of Colombian cooperatives
          and farms and respond within 10 business days with available options — or let you know if
          we can&apos;t match your requirements right now.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    const form = new FormData(e.currentTarget);
    const minCupScore = String(form.get('minCupScore') ?? '').trim();
    const maxBudgetPerKg = String(form.get('maxBudgetPerKg') ?? '').trim();
    try {
      await submitSourcingRequest({
        intendedUse: String(form.get('intendedUse') ?? ''),
        varietyPreferences: parseList(String(form.get('varietyPreferences') ?? '')),
        processPreferences: parseList(String(form.get('processPreferences') ?? '')),
        minCupScore: minCupScore ? Number(minCupScore) : undefined,
        requestedVolumeKg: Number(form.get('requestedVolumeKg')),
        volumeFlexibility: String(form.get('volumeFlexibility') ?? ''),
        targetDeliveryWindow: String(form.get('targetDeliveryWindow') ?? ''),
        destinationCountry: String(form.get('destinationCountry') ?? ''),
        altitudePreference: String(form.get('altitudePreference') ?? '') || undefined,
        regionPreferences: parseList(String(form.get('regionPreferences') ?? '')),
        certificationsNeeded: parseList(String(form.get('certificationsNeeded') ?? '')),
        maxBudgetPerKg: maxBudgetPerKg ? Number(maxBudgetPerKg) : undefined,
        additionalNotes: String(form.get('additionalNotes') ?? '') || undefined,
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
      <h1 className="font-display font-medium text-[28px] text-fc-ink mb-3">
        Can&apos;t find what you need?
      </h1>
      <p className="text-sm text-fc-ink-2 leading-relaxed mb-6">
        Tell us what you&apos;re looking for. We&apos;ll search our network of Colombian
        cooperatives and farms and respond within 10 business days with available options — or let
        you know if we can&apos;t match your requirements right now.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7 flex flex-col gap-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="intendedUse">
              Intended use *
            </label>
            <select
              id="intendedUse"
              name="intendedUse"
              required
              defaultValue=""
              className={inputClasses}
            >
              <option value="" disabled>
                Select…
              </option>
              {INTENDED_USE.map((v) => (
                <option key={v} value={v}>
                  {INTENDED_USE_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
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
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="volumeFlexibility">
              Volume flexibility *
            </label>
            <select
              id="volumeFlexibility"
              name="volumeFlexibility"
              required
              defaultValue="FLEXIBLE"
              className={inputClasses}
            >
              {VOLUME_FLEXIBILITY.map((v) => (
                <option key={v} value={v}>
                  {VOLUME_FLEXIBILITY_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="targetDeliveryWindow">
              Target delivery window *
            </label>
            <select
              id="targetDeliveryWindow"
              name="targetDeliveryWindow"
              required
              defaultValue="FLEXIBLE"
              className={inputClasses}
            >
              {DELIVERY_WINDOW.map((v) => (
                <option key={v} value={v}>
                  {DELIVERY_WINDOW_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
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

        <p className="text-xs text-fc-ink-3 -mb-2">
          The fields below are optional — leave blank for no preference.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="varietyPreferences">
              Variety preferences
            </label>
            <input
              id="varietyPreferences"
              name="varietyPreferences"
              type="text"
              placeholder="Comma-separated, e.g. Caturra, Geisha"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="processPreferences">
              Process preferences
            </label>
            <input
              id="processPreferences"
              name="processPreferences"
              type="text"
              placeholder="Comma-separated, e.g. Washed, Honey"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="regionPreferences">
              Region preferences
            </label>
            <input
              id="regionPreferences"
              name="regionPreferences"
              type="text"
              placeholder="Comma-separated"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="certificationsNeeded">
              Certifications needed
            </label>
            <input
              id="certificationsNeeded"
              name="certificationsNeeded"
              type="text"
              placeholder="Comma-separated"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="minCupScore">
              Minimum cup score
            </label>
            <input
              id="minCupScore"
              name="minCupScore"
              type="number"
              min="0"
              max="100"
              step="0.25"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2" htmlFor="altitudePreference">
              Altitude preference
            </label>
            <input
              id="altitudePreference"
              name="altitudePreference"
              type="text"
              placeholder="e.g. 1,700m+"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-fc-ink-2" htmlFor="maxBudgetPerKg">
            Max budget per kg
          </label>
          <input
            id="maxBudgetPerKg"
            name="maxBudgetPerKg"
            type="number"
            min="0"
            step="0.01"
            className={inputClasses}
          />
          <p className="text-xs text-fc-ink-3 mt-1">
            Helps us narrow the search — kept confidential, never shared with producers.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-fc-ink-2" htmlFor="additionalNotes">
            Additional notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={4}
            placeholder="Flavor goals, packaging needs, exclusivity, past lots you've loved, constraints…"
            className={`${inputClasses} resize-y`}
          />
        </div>

        <HoneypotField />

        {error && <p className="text-sm text-fc-brick">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="self-start px-6 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit Sourcing Request'}
        </button>
      </form>
    </div>
  );
}
