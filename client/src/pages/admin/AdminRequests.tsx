import { REQUEST_STATUS, SOURCING_STATUS, VERIFICATION_STATUS } from '@fincava/shared';
import { useEffect, useState } from 'react';
import {
  fetchAdminLots,
  fetchAdminRequests,
  updateAdminRequest,
  type AdminLot,
  type AdminRequestType,
  type AdminRfqRow,
  type AdminSampleRow,
  type AdminSourcingRow,
  type AdminVerificationRow,
} from '../../lib/adminApi.js';
import { usePageTitle } from '../../lib/usePageTitle.js';

type AnyRow = AdminRfqRow | AdminSampleRow | AdminSourcingRow | AdminVerificationRow;

const TABS: Array<{ type: AdminRequestType; label: string }> = [
  { type: 'rfq', label: 'RFQ' },
  { type: 'sample', label: 'Sample' },
  { type: 'sourcing', label: 'Sourcing' },
  { type: 'verification', label: 'Verification' },
];

const STATUS_OPTIONS: Record<AdminRequestType, readonly string[]> = {
  rfq: REQUEST_STATUS,
  sample: REQUEST_STATUS,
  sourcing: SOURCING_STATUS,
  verification: VERIFICATION_STATUS,
};

function rowSummary(type: AdminRequestType, row: AnyRow): string {
  if (type === 'rfq') {
    const r = row as AdminRfqRow;
    return `${r.buyerCompany ?? r.buyerEmail} — ${r.lotCode} — ${r.requestedVolumeKg}kg — ${r.destinationCountry}`;
  }
  if (type === 'sample') {
    const r = row as AdminSampleRow;
    return `${r.buyerCompany ?? r.buyerEmail} — ${r.lotCode} — ${r.sampleDestination}`;
  }
  if (type === 'sourcing') {
    const r = row as AdminSourcingRow;
    return `${r.buyerCompany ?? r.buyerEmail} — ${r.intendedUse} — ${r.requestedVolumeKg}kg — ${r.destinationCountry}`;
  }
  const r = row as AdminVerificationRow;
  return `${r.requesterCompany} (${r.requesterEmail}) — ${r.farmOrLotOfInterest ?? 'general inquiry'}`;
}

export default function AdminRequests() {
  usePageTitle('Admin — Requests');
  const [tab, setTab] = useState<AdminRequestType>('rfq');
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [lots, setLots] = useState<AdminLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    fetchAdminLots()
      .then(setLots)
      .catch(() => setLots([]));
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    fetchAdminRequests<AnyRow>(tab)
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    setExpandedId(null);
  }, [tab]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateAdminRequest(tab, id, { status });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function startEditingNotes(row: AnyRow) {
    setExpandedId(row.id);
    setNotesDraft(row.internalNotes ?? '');
  }

  async function saveNotes(id: string) {
    try {
      await updateAdminRequest(tab, id, { internalNotes: notesDraft });
      setExpandedId(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleLotLink(id: string, lotId: string) {
    const field = tab === 'sourcing' ? 'matchedLotId' : 'linkedLotId';
    try {
      await updateAdminRequest(tab, id, { [field]: lotId || null });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <div>
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-6">Requests</h1>

      <div className="flex gap-2 mb-6 border-b border-fc-line">
        {TABS.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => setTab(t.type)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              tab === t.type
                ? 'border-fc-sage-deep text-fc-sage-deep'
                : 'border-transparent text-fc-ink-3 hover:text-fc-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-fc-ink-3">Loading…</p>}

      {!loading && !error && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white divide-y divide-fc-line">
          {rows.length === 0 && (
            <p className="px-4 py-6 text-sm text-fc-ink-3 text-center">No {tab} requests yet.</p>
          )}
          {rows.map((row) => (
            <div key={row.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm min-w-0 flex-1">
                  <p className="text-fc-ink truncate">{rowSummary(tab, row)}</p>
                  <p className="text-xs text-fc-ink-3">
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
                <select
                  className="text-sm border border-fc-border-strong rounded-fc-md px-2 py-1.5 bg-fc-paper"
                  value={row.status}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                >
                  {STATUS_OPTIONS[tab].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {(tab === 'sourcing' || tab === 'verification') && (
                  <select
                    className="text-sm border border-fc-border-strong rounded-fc-md px-2 py-1.5 bg-fc-paper"
                    value={
                      (tab === 'sourcing'
                        ? (row as AdminSourcingRow).matchedLotId
                        : (row as AdminVerificationRow).linkedLotId) ?? ''
                    }
                    onChange={(e) => handleLotLink(row.id, e.target.value)}
                  >
                    <option value="">No linked lot</option>
                    {lots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.lotCode}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => startEditingNotes(row)}
                  className="text-xs text-fc-sage-deep underline underline-offset-2 shrink-0"
                >
                  Notes
                </button>
              </div>

              {expandedId === row.id && (
                <div className="mt-3">
                  <textarea
                    className="w-full text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2 box-border"
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveNotes(row.id)}
                      className="text-xs bg-fc-sage-deep text-fc-white px-3 py-1.5 rounded-fc-md"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="text-xs text-fc-ink-2 underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
