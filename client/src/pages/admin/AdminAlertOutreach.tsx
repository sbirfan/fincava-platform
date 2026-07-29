import { useState } from 'react';
import {
  alertOutreachExportUrl,
  fetchAlertOutreach,
  type AlertOutreachBuyer,
  type AlertOutreachFilter,
} from '../../lib/adminApi.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function AdminAlertOutreach() {
  const [filter, setFilter] = useState<AlertOutreachFilter>({});
  const [buyers, setBuyers] = useState<AlertOutreachBuyer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAlertOutreach(filter);
      setBuyers(result.buyers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-6">Alert Outreach</h1>

      <div className="border border-fc-line rounded-fc-lg bg-fc-white p-6 mb-6">
        <h2 className="text-sm font-semibold text-fc-ink mb-3">
          Filter buyers (alert opt-in only)
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <label className="text-xs text-fc-ink-2">
            Variety
            <input
              className={inputClasses}
              value={filter.variety ?? ''}
              onChange={(e) => setFilter({ ...filter, variety: e.target.value || undefined })}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Process
            <input
              className={inputClasses}
              value={filter.process ?? ''}
              onChange={(e) => setFilter({ ...filter, process: e.target.value || undefined })}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Certification
            <input
              className={inputClasses}
              value={filter.certification ?? ''}
              onChange={(e) => setFilter({ ...filter, certification: e.target.value || undefined })}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Region
            <input
              className={inputClasses}
              value={filter.region ?? ''}
              onChange={(e) => setFilter({ ...filter, region: e.target.value || undefined })}
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Score min
            <input
              className={inputClasses}
              value={filter.scoreMin ?? ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  scoreMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
          <label className="text-xs text-fc-ink-2">
            Score max
            <input
              className={inputClasses}
              value={filter.scoreMax ?? ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  scoreMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="bg-fc-sage-deep text-fc-white text-sm font-medium px-4 py-2 rounded-fc-md hover:bg-fc-sage-deep/90 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          {buyers && buyers.length > 0 && (
            <a
              href={alertOutreachExportUrl(filter)}
              className="text-sm border border-fc-border-strong rounded-fc-md px-4 py-2 text-fc-ink hover:bg-fc-paper-2"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {buyers && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white overflow-x-auto">
          <p className="px-4 py-2.5 text-xs text-fc-ink-3 border-b border-fc-line">
            {buyers.length} matching buyers
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fc-line text-left text-xs text-fc-ink-3 uppercase tracking-wide">
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Varieties</th>
                <th className="px-4 py-2.5">Processes</th>
                <th className="px-4 py-2.5">Origins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fc-line">
              {buyers.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2.5">{b.email}</td>
                  <td className="px-4 py-2.5">{b.company ?? '—'}</td>
                  <td className="px-4 py-2.5">{b.preferredVarieties.join(', ') || '—'}</td>
                  <td className="px-4 py-2.5">{b.preferredProcesses.join(', ') || '—'}</td>
                  <td className="px-4 py-2.5">{b.targetOrigins.join(', ') || '—'}</td>
                </tr>
              ))}
              {buyers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-fc-ink-3">
                    No matching buyers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
