import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  deleteAdminBuyer,
  fetchAdminBuyer,
  updateAdminBuyerNotes,
  type AdminBuyerDetail as AdminBuyerDetailData,
} from '../../lib/adminApi.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function AdminBuyerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<AdminBuyerDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAdminBuyer(id)
      .then((b) => {
        setBuyer(b);
        setNotes(b.internalNotes ?? '');
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [id]);

  async function handleSaveNotes() {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateAdminBuyerNotes(id, notes);
      setBuyer(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteAdminBuyer(id);
      navigate('/admin/buyers');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!buyer) return <p className="text-sm text-fc-ink-3">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-1">{buyer.email}</h1>
      <p className="text-sm text-fc-ink-3 mb-6">
        {buyer.name ?? '—'} · {buyer.company ?? '—'} · {buyer.country ?? '—'}
      </p>

      <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-fc-ink mb-3">Profile & preferences</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-fc-ink-3">Buyer type</dt>
            <dd>{buyer.buyerType ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Phone</dt>
            <dd>{buyer.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Preferred varieties</dt>
            <dd>{buyer.preferredVarieties.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Preferred processes</dt>
            <dd>{buyer.preferredProcesses.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Target origins</dt>
            <dd>{buyer.targetOrigins.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Certifications needed</dt>
            <dd>{buyer.certificationsNeeded.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Alert opt-in</dt>
            <dd>{buyer.alertOptIn ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Alert on competition lots</dt>
            <dd>{buyer.alertCompetitionLots ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Marketing opt-in</dt>
            <dd>{buyer.marketingOptIn ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-xs text-fc-ink-3">Consent timestamp</dt>
            <dd>
              {buyer.consentTimestamp ? new Date(buyer.consentTimestamp).toLocaleString() : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-fc-ink mb-3">Internal notes (admin-only)</h2>
        <textarea
          className={inputClasses}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSaveNotes}
          disabled={saving}
          className="mt-3 bg-fc-sage-deep text-fc-white text-sm font-medium px-4 py-2 rounded-fc-md hover:bg-fc-sage-deep/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>

      <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-fc-ink mb-3">RFQs ({buyer.rfqs.length})</h2>
        {buyer.rfqs.length === 0 && <p className="text-sm text-fc-ink-3">None.</p>}
        {buyer.rfqs.map((r) => (
          <div key={r.id} className="text-sm border-t border-fc-line first:border-t-0 py-2">
            {r.lotCode} — {r.requestedVolumeKg}kg — {r.destinationCountry} —{' '}
            <strong>{r.status}</strong>
          </div>
        ))}

        <h2 className="text-sm font-semibold text-fc-ink mb-3 mt-5">
          Sample requests ({buyer.sampleRequests.length})
        </h2>
        {buyer.sampleRequests.length === 0 && <p className="text-sm text-fc-ink-3">None.</p>}
        {buyer.sampleRequests.map((r) => (
          <div key={r.id} className="text-sm border-t border-fc-line first:border-t-0 py-2">
            {r.lotCode} — {r.sampleDestination} — <strong>{r.status}</strong>
          </div>
        ))}

        <h2 className="text-sm font-semibold text-fc-ink mb-3 mt-5">
          Sourcing requests ({buyer.sourcingRequests.length})
        </h2>
        {buyer.sourcingRequests.length === 0 && <p className="text-sm text-fc-ink-3">None.</p>}
        {buyer.sourcingRequests.map((r) => (
          <div key={r.id} className="text-sm border-t border-fc-line first:border-t-0 py-2">
            {r.intendedUse} — {r.requestedVolumeKg}kg — {r.destinationCountry} —{' '}
            <strong>{r.status}</strong>
          </div>
        ))}
      </div>

      <div className="border border-red-200 rounded-fc-lg bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-800 mb-2">Delete buyer</h2>
        <p className="text-xs text-red-700 mb-3">
          Irreversible. Hard-deletes this profile and cascades to all their RFQs, sample requests,
          sourcing requests, and sessions.
        </p>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-sm text-red-700 border border-red-300 rounded-fc-md px-4 py-2 hover:bg-red-100"
          >
            Delete buyer
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-800">Are you sure? This cannot be undone.</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm bg-red-600 text-white rounded-fc-md px-4 py-2 hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-sm text-fc-ink-2 underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
