import { BUYER_TYPE, CONTACT_METHOD } from '@fincava/shared';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  fetchMyRequestHistory,
  updateMyProfile,
  type BuyerProfile,
  type RequestHistory,
} from '../lib/api.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  REPLIED: 'Replied',
  SAMPLE_SENT: 'Sample sent',
  QUOTED: 'Quoted',
  SOURCING: 'Sourcing',
  MATCHED: 'Matched',
  CLOSED: 'Closed',
};

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

function arrayToText(values: string[]): string {
  return values.join(', ');
}

function textToArray(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function Profile() {
  usePageTitle('My Profile');
  const { profile, loading, refresh } = useAuth();
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';

  const [form, setForm] = useState<Partial<BuyerProfile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<RequestHistory | null>(null);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  useEffect(() => {
    if (profile)
      fetchMyRequestHistory()
        .then(setHistory)
        .catch(() => setHistory(null));
  }, [profile]);

  if (loading) {
    return <p className="max-w-2xl mx-auto px-6 py-16 text-sm text-fc-ink-3">Loading…</p>;
  }

  if (!profile || !form) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-fc-ink-2 mb-4">Sign in to view your profile.</p>
        <Link to="/login" className="text-sm font-medium text-fc-sage-deep">
          Sign in or register
        </Link>
      </div>
    );
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateMyProfile({
        name: form.name ?? undefined,
        company: form.company ?? undefined,
        phone: form.phone ?? undefined,
        country: form.country ?? undefined,
        buyerType: (form.buyerType as BuyerProfile['buyerType']) ?? undefined,
        website: form.website ?? undefined,
        preferredContactMethod:
          (form.preferredContactMethod as BuyerProfile['preferredContactMethod']) ?? undefined,
        preferredVarieties: form.preferredVarieties,
        preferredProcesses: form.preferredProcesses,
        targetOrigins: form.targetOrigins,
        certificationsNeeded: form.certificationsNeeded,
        destinationCountries: form.destinationCountries,
        alertOptIn: form.alertOptIn,
        alertCompetitionLots: form.alertCompetitionLots,
        marketingOptIn: form.marketingOptIn,
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {isWelcome && (
        <div className="bg-fc-sage-soft rounded-fc-lg p-4 mb-6 text-sm text-fc-sage-deep">
          Welcome to FINCAVA. Your account is ready — full lot passports, pricing, and quote and
          sample requests are now unlocked. Add your sourcing preferences below to help us match you
          with the right lots.
        </div>
      )}

      <h1 className="font-display font-medium text-2xl text-fc-ink mb-1">My Profile</h1>
      <p className="text-sm text-fc-ink-3 mb-8">{profile.email}</p>

      <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-fc-ink">Company details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Name</label>
            <input
              className={inputClasses}
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Company</label>
            <input
              className={inputClasses}
              value={form.company ?? ''}
              onChange={(e) => set('company', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Phone</label>
            <input
              className={inputClasses}
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Country</label>
            <input
              className={inputClasses}
              value={form.country ?? ''}
              onChange={(e) => set('country', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Buyer type</label>
            <select
              className={inputClasses}
              value={form.buyerType ?? ''}
              onChange={(e) => set('buyerType', e.target.value)}
            >
              <option value="">Select…</option>
              {BUYER_TYPE.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Website</label>
            <input
              className={inputClasses}
              value={form.website ?? ''}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Preferred contact method</label>
            <select
              className={inputClasses}
              value={form.preferredContactMethod ?? ''}
              onChange={(e) => set('preferredContactMethod', e.target.value)}
            >
              <option value="">Select…</option>
              {CONTACT_METHOD.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-fc-ink mt-2">Sourcing preferences</h2>
        <p className="text-xs text-fc-ink-3 -mt-2">
          Comma-separated. Leave blank for no preference.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Varieties</label>
            <input
              className={inputClasses}
              value={arrayToText(form.preferredVarieties ?? [])}
              onChange={(e) => set('preferredVarieties', textToArray(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Processes</label>
            <input
              className={inputClasses}
              value={arrayToText(form.preferredProcesses ?? [])}
              onChange={(e) => set('preferredProcesses', textToArray(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Target origins</label>
            <input
              className={inputClasses}
              value={arrayToText(form.targetOrigins ?? [])}
              onChange={(e) => set('targetOrigins', textToArray(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Certifications needed</label>
            <input
              className={inputClasses}
              value={arrayToText(form.certificationsNeeded ?? [])}
              onChange={(e) => set('certificationsNeeded', textToArray(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-fc-ink-2">Destination countries</label>
            <input
              className={inputClasses}
              value={arrayToText(form.destinationCountries ?? [])}
              onChange={(e) => set('destinationCountries', textToArray(e.target.value))}
            />
          </div>
        </div>

        <h2 className="text-sm font-semibold text-fc-ink mt-2">Alerts and consent</h2>
        <p className="text-xs text-fc-ink-3 -mt-2">
          Lot alerts and general updates are separate — opt into either, both, or neither.
        </p>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2.5 text-sm text-fc-ink-2">
            <input
              type="checkbox"
              className="accent-fc-sage"
              checked={form.alertOptIn ?? false}
              onChange={(e) => set('alertOptIn', e.target.checked)}
            />
            Notify me by email when new lots match my sourcing preferences
          </label>
          <label className="flex items-center gap-2.5 text-sm text-fc-ink-2 pl-6">
            <input
              type="checkbox"
              className="accent-fc-sage"
              checked={form.alertCompetitionLots ?? false}
              onChange={(e) => set('alertCompetitionLots', e.target.checked)}
            />
            Also include competition-grade lots in those alerts
          </label>
          <label className="flex items-center gap-2.5 text-sm text-fc-ink-2">
            <input
              type="checkbox"
              className="accent-fc-sage"
              checked={form.marketingOptIn ?? false}
              onChange={(e) => set('marketingOptIn', e.target.checked)}
            />
            Send me occasional FINCAVA news and updates (unrelated to lot alerts)
          </label>
          {profile.consentTimestamp && (
            <p className="text-xs text-fc-ink-3">
              Consent last recorded: {new Date(profile.consentTimestamp).toLocaleString()}
            </p>
          )}
        </div>

        {saveError && <p className="text-sm text-fc-brick">{saveError}</p>}
        {saved && <p className="text-sm text-fc-sage-deep">Profile saved.</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-start px-6 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {history && (
        <div className="mt-8 flex flex-col gap-6">
          <RequestHistorySection
            title="Quote requests"
            emptyText="No quote requests yet."
            rows={history.rfqs.map((r) => ({
              id: r.id,
              primary: `${r.lotTitle} (${r.lotCode})`,
              secondary: `${r.requestedVolumeKg} kg · ${r.destinationCountry}`,
              status: r.status,
              createdAt: r.createdAt,
            }))}
          />
          <RequestHistorySection
            title="Sample requests"
            emptyText="No sample requests yet."
            rows={history.sampleRequests.map((r) => ({
              id: r.id,
              primary: `${r.lotTitle} (${r.lotCode})`,
              secondary: r.sampleDestination,
              status: r.status,
              createdAt: r.createdAt,
            }))}
          />
          <RequestHistorySection
            title="Sourcing requests"
            emptyText="No sourcing requests yet."
            rows={history.sourcingRequests.map((r) => ({
              id: r.id,
              primary: r.intendedUse.replaceAll('_', ' '),
              secondary: `${r.requestedVolumeKg} kg · ${r.destinationCountry}`,
              status: r.status,
              createdAt: r.createdAt,
            }))}
          />
        </div>
      )}
    </div>
  );
}

interface RequestHistoryRow {
  id: string;
  primary: string;
  secondary: string;
  status: string;
  createdAt: string;
}

function RequestHistorySection({
  title,
  emptyText,
  rows,
}: {
  title: string;
  emptyText: string;
  rows: RequestHistoryRow[];
}) {
  return (
    <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6">
      <h2 className="text-sm font-semibold text-fc-ink mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-fc-ink-3">{emptyText}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-fc-line-soft">
          {rows.map((row) => (
            <li
              key={row.id}
              className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div>
                <div className="text-sm font-medium text-fc-ink">{row.primary}</div>
                <div className="text-xs text-fc-ink-3">
                  {row.secondary} · {new Date(row.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-fc-pill bg-fc-paper-2 text-fc-ink-2 border border-fc-border-strong whitespace-nowrap">
                {STATUS_LABELS[row.status] ?? row.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
