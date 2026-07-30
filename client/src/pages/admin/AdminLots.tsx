import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRICING_STRATEGY_LABELS } from '../../lib/adminLabels.js';
import { fetchAdminLots, type AdminLot } from '../../lib/adminApi.js';
import { usePageTitle } from '../../lib/usePageTitle.js';
import { LOT_STATUS_LABELS } from '../../components/StatusBadge.js';

export default function AdminLots() {
  usePageTitle('Admin — Lots');
  const [lots, setLots] = useState<AdminLot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminLots()
      .then(setLots)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-medium text-2xl text-fc-ink">Lots</h1>
        <Link
          to="/admin/lots/new"
          className="bg-fc-sage-deep text-fc-white text-sm font-medium px-4 py-2 rounded-fc-md hover:bg-fc-sage-deep/90"
        >
          New lot
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!lots && !error && <p className="text-sm text-fc-ink-3">Loading…</p>}

      {lots && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fc-line text-left text-xs text-fc-ink-3 uppercase tracking-wide">
                <th className="px-4 py-2.5">Lot code</th>
                <th className="px-4 py-2.5">Title</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Pricing strategy</th>
                <th className="px-4 py-2.5">Visible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fc-line">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-fc-paper-2">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/lots/${encodeURIComponent(lot.lotCode)}`}
                      className="font-mono text-xs text-fc-sage-deep underline underline-offset-2"
                    >
                      {lot.lotCode}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{lot.title}</td>
                  <td className="px-4 py-2.5">{LOT_STATUS_LABELS[lot.status] ?? lot.status}</td>
                  <td className="px-4 py-2.5">
                    {PRICING_STRATEGY_LABELS[lot.pricingStrategy] ?? lot.pricingStrategy}
                  </td>
                  <td className="px-4 py-2.5">{lot.visible ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-fc-ink-3">
                    No lots yet. Use "New lot" to add the first one.
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
