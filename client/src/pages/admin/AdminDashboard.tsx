import { useEffect, useState } from 'react';
import {
  fetchAdminDashboard,
  type AdminDashboard as AdminDashboardData,
} from '../../lib/adminApi.js';

type StatKey =
  | 'newRfqs'
  | 'newSampleRequests'
  | 'newSourcingRequests'
  | 'newVerificationRequests'
  | 'newRegistrations';

const STAT_LABELS: Record<StatKey, string> = {
  newRfqs: 'New RFQs',
  newSampleRequests: 'New sample requests',
  newSourcingRequests: 'New sourcing requests',
  newVerificationRequests: 'New verification requests',
  newRegistrations: 'New registrations',
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-fc-ink-3">Loading…</p>;

  return (
    <div>
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-1">Dashboard</h1>
      <p className="text-sm text-fc-ink-3 mb-6">Last {data.windowDays} days</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((key) => (
          <div key={key} className="border border-fc-line rounded-fc-lg bg-fc-white px-4 py-4">
            <div className="text-2xl font-display font-medium text-fc-ink">{data[key]}</div>
            <div className="text-xs text-fc-ink-3 mt-1">{STAT_LABELS[key]}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-fc-ink mb-3">Lots by status</h2>
      <div className="border border-fc-line rounded-fc-lg bg-fc-white divide-y divide-fc-line">
        {data.lotsByStatus.map((row) => (
          <div key={row.status} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-fc-ink-2">{row.status}</span>
            <span className="font-medium text-fc-ink">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
