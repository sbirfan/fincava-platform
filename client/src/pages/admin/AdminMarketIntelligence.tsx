import { useEffect, useState } from 'react';
import {
  createMarketIntelligence,
  deleteMarketIntelligence,
  fetchAdminLots,
  fetchMarketIntelligence,
  updateMarketIntelligence,
  type AdminLot,
  type MarketIntelligenceNote,
} from '../../lib/adminApi.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

const EMPTY_DRAFT = {
  lotId: '',
  variety: '',
  process: '',
  targetMarkets: '',
  demandTrend: '',
  estimatedRateLowPerKg: '',
  estimatedRateHighPerKg: '',
  currency: 'USD',
  comparableOfferings: '',
  suggestedBuyerCategories: '',
  pricingRecommendation: '',
  researchSource: '',
  internalNotes: '',
};

function numOrUndefined(v: string): number | undefined {
  const trimmed = v.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

export default function AdminMarketIntelligence() {
  const [notes, setNotes] = useState<MarketIntelligenceNote[]>([]);
  const [lots, setLots] = useState<AdminLot[]>([]);
  const [filterVariety, setFilterVariety] = useState('');
  const [filterLotId, setFilterLotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAdminLots()
      .then(setLots)
      .catch(() => setLots([]));
  }, []);

  function load() {
    setLoading(true);
    fetchMarketIntelligence({
      variety: filterVariety || undefined,
      lotId: filterLotId || undefined,
    })
      .then(setNotes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [filterVariety, filterLotId]);

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(note: MarketIntelligenceNote) {
    setDraft({
      lotId: note.lotId ?? '',
      variety: note.variety ?? '',
      process: note.process ?? '',
      targetMarkets: note.targetMarkets ?? '',
      demandTrend: note.demandTrend ?? '',
      estimatedRateLowPerKg: note.estimatedRateLowPerKg ?? '',
      estimatedRateHighPerKg: note.estimatedRateHighPerKg ?? '',
      currency: note.currency,
      comparableOfferings: note.comparableOfferings ?? '',
      suggestedBuyerCategories: note.suggestedBuyerCategories ?? '',
      pricingRecommendation: note.pricingRecommendation ?? '',
      researchSource: note.researchSource ?? '',
      internalNotes: note.internalNotes ?? '',
    });
    setEditingId(note.id);
    setShowForm(true);
  }

  async function handleSave() {
    const payload = {
      lotId: draft.lotId || undefined,
      variety: draft.variety || undefined,
      process: draft.process || undefined,
      targetMarkets: draft.targetMarkets || undefined,
      demandTrend: draft.demandTrend || undefined,
      estimatedRateLowPerKg: numOrUndefined(draft.estimatedRateLowPerKg),
      estimatedRateHighPerKg: numOrUndefined(draft.estimatedRateHighPerKg),
      currency: draft.currency,
      comparableOfferings: draft.comparableOfferings || undefined,
      suggestedBuyerCategories: draft.suggestedBuyerCategories || undefined,
      pricingRecommendation: draft.pricingRecommendation || undefined,
      researchSource: draft.researchSource || undefined,
      internalNotes: draft.internalNotes || undefined,
    };
    try {
      if (editingId) {
        await updateMarketIntelligence(editingId, payload);
      } else {
        await createMarketIntelligence(payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteMarketIntelligence(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-medium text-2xl text-fc-ink">Market Intelligence</h1>
        <button
          type="button"
          onClick={startCreate}
          className="bg-fc-sage-deep text-fc-white text-sm font-medium px-4 py-2 rounded-fc-md hover:bg-fc-sage-deep/90"
        >
          New note
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          className={`${inputClasses} mt-0 max-w-xs`}
          placeholder="Filter by variety"
          value={filterVariety}
          onChange={(e) => setFilterVariety(e.target.value)}
        />
        <select
          className={`${inputClasses} mt-0 max-w-xs`}
          value={filterLotId}
          onChange={(e) => setFilterLotId(e.target.value)}
        >
          <option value="">Filter by lot — all</option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.lotCode}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-fc-ink">
            {editingId ? 'Edit note' : 'New note'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs text-fc-ink-2">
              Lot
              <select
                className={inputClasses}
                value={draft.lotId}
                onChange={(e) => setDraft({ ...draft, lotId: e.target.value })}
              >
                <option value="">None</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotCode}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-fc-ink-2">
              Variety
              <input
                className={inputClasses}
                value={draft.variety}
                onChange={(e) => setDraft({ ...draft, variety: e.target.value })}
              />
            </label>
            <label className="text-xs text-fc-ink-2">
              Process
              <input
                className={inputClasses}
                value={draft.process}
                onChange={(e) => setDraft({ ...draft, process: e.target.value })}
              />
            </label>
            <label className="text-xs text-fc-ink-2">
              Demand trend
              <input
                className={inputClasses}
                value={draft.demandTrend}
                onChange={(e) => setDraft({ ...draft, demandTrend: e.target.value })}
              />
            </label>
            <label className="text-xs text-fc-ink-2">
              Estimated rate low/kg
              <input
                className={inputClasses}
                value={draft.estimatedRateLowPerKg}
                onChange={(e) => setDraft({ ...draft, estimatedRateLowPerKg: e.target.value })}
              />
            </label>
            <label className="text-xs text-fc-ink-2">
              Estimated rate high/kg
              <input
                className={inputClasses}
                value={draft.estimatedRateHighPerKg}
                onChange={(e) => setDraft({ ...draft, estimatedRateHighPerKg: e.target.value })}
              />
            </label>
          </div>
          <label className="text-xs text-fc-ink-2 block">
            Target markets
            <input
              className={inputClasses}
              value={draft.targetMarkets}
              onChange={(e) => setDraft({ ...draft, targetMarkets: e.target.value })}
            />
          </label>
          <label className="text-xs text-fc-ink-2 block">
            Comparable offerings
            <textarea
              className={inputClasses}
              rows={2}
              value={draft.comparableOfferings}
              onChange={(e) => setDraft({ ...draft, comparableOfferings: e.target.value })}
            />
          </label>
          <label className="text-xs text-fc-ink-2 block">
            Suggested buyer categories
            <input
              className={inputClasses}
              value={draft.suggestedBuyerCategories}
              onChange={(e) => setDraft({ ...draft, suggestedBuyerCategories: e.target.value })}
            />
          </label>
          <label className="text-xs text-fc-ink-2 block">
            Pricing recommendation
            <textarea
              className={inputClasses}
              rows={2}
              value={draft.pricingRecommendation}
              onChange={(e) => setDraft({ ...draft, pricingRecommendation: e.target.value })}
            />
          </label>
          <label className="text-xs text-fc-ink-2 block">
            Research source
            <input
              className={inputClasses}
              value={draft.researchSource}
              onChange={(e) => setDraft({ ...draft, researchSource: e.target.value })}
            />
          </label>
          <label className="text-xs text-fc-ink-2 block">
            Internal notes
            <textarea
              className={inputClasses}
              rows={2}
              value={draft.internalNotes}
              onChange={(e) => setDraft({ ...draft, internalNotes: e.target.value })}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="bg-fc-sage-deep text-fc-white text-sm font-medium px-4 py-2 rounded-fc-md"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-fc-ink-2 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-fc-ink-3">Loading…</p>}

      {!loading && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white divide-y divide-fc-line">
          {notes.length === 0 && (
            <p className="px-4 py-6 text-sm text-fc-ink-3 text-center">No notes yet.</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="text-sm min-w-0">
                <p className="text-fc-ink">
                  {note.variety ?? '—'} / {note.process ?? '—'} —{' '}
                  {note.estimatedRateLowPerKg && note.estimatedRateHighPerKg
                    ? `${note.currency} ${note.estimatedRateLowPerKg}–${note.estimatedRateHighPerKg}/kg`
                    : 'no rate estimate'}
                </p>
                <p className="text-xs text-fc-ink-3">{note.targetMarkets ?? '—'}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(note)}
                  className="text-xs text-fc-sage-deep underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
