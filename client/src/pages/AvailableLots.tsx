import { useEffect, useMemo, useState } from 'react';
import { fetchLots, type ApiLot } from '../lib/api.js';
import LotCard from '../components/LotCard.js';

const STATUS_OPTIONS = [
  'All statuses',
  'AVAILABLE',
  'SAMPLE_AVAILABLE',
  'LIMITED_QUANTITY',
  'COMING_SOON',
  'RESERVED',
  'SOLD',
];

export default function AvailableLots() {
  const [lots, setLots] = useState<ApiLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [varietyFilter, setVarietyFilter] = useState<string[]>([]);
  const [processFilter, setProcessFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('All statuses');

  useEffect(() => {
    fetchLots()
      .then(setLots)
      .finally(() => setLoading(false));
  }, []);

  const varieties = useMemo(() => [...new Set(lots.map((l) => l.variety))].sort(), [lots]);
  const processes = useMemo(() => [...new Set(lots.map((l) => l.process))].sort(), [lots]);

  const filtered = lots.filter((lot) => {
    if (varietyFilter.length > 0 && !varietyFilter.includes(lot.variety)) return false;
    if (processFilter.length > 0 && !processFilter.includes(lot.process)) return false;
    if (statusFilter !== 'All statuses' && lot.status !== statusFilter) return false;
    return true;
  });

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
      <h1 className="font-display font-medium text-2xl md:text-[26px] text-fc-ink mb-1">
        Available Lots
      </h1>
      <p className="text-sm text-fc-ink-2 mb-6">
        Curated green coffee lots, updated as they move through harvest and sale.
      </p>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-fc-ink">Variety</label>
            <div className="flex flex-col gap-1.5 mt-2 text-sm text-fc-ink-2">
              {varieties.map((v) => (
                <label key={v} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={varietyFilter.includes(v)}
                    onChange={() => toggle(varietyFilter, v, setVarietyFilter)}
                    className="accent-fc-sage"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-fc-ink">Process</label>
            <div className="flex flex-col gap-1.5 mt-2 text-sm text-fc-ink-2">
              {processes.map((p) => (
                <label key={p} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={processFilter.includes(p)}
                    onChange={() => toggle(processFilter, p, setProcessFilter)}
                    className="accent-fc-sage"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full mt-2 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-2.5 py-2"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All statuses' ? s : s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-2">
            <span className="text-sm text-fc-ink-3">
              {loading ? '…' : `${filtered.length} lot${filtered.length === 1 ? '' : 's'}`}
            </span>
          </div>
          {loading ? (
            <p className="text-sm text-fc-ink-3">Loading lots…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-fc-ink-3">No lots match these filters.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((lot) => (
                <LotCard key={lot.lotCode} lot={lot} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
