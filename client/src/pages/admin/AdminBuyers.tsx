import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminBuyers, type AdminBuyerListItem } from '../../lib/adminApi.js';
import { usePageTitle } from '../../lib/usePageTitle.js';

export default function AdminBuyers() {
  usePageTitle('Admin — Buyers');
  const [buyers, setBuyers] = useState<AdminBuyerListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminBuyers()
      .then(setBuyers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  return (
    <div>
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-6">Buyers</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!buyers && !error && <p className="text-sm text-fc-ink-3">Loading…</p>}

      {buyers && (
        <div className="border border-fc-line rounded-fc-lg bg-fc-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fc-line text-left text-xs text-fc-ink-3 uppercase tracking-wide">
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Country</th>
                <th className="px-4 py-2.5">Alert opt-in</th>
                <th className="px-4 py-2.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fc-line">
              {buyers.map((b) => (
                <tr key={b.id} className="hover:bg-fc-paper-2">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/buyers/${b.id}`}
                      className="text-fc-sage-deep underline underline-offset-2"
                    >
                      {b.email}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{b.name ?? '—'}</td>
                  <td className="px-4 py-2.5">{b.company ?? '—'}</td>
                  <td className="px-4 py-2.5">{b.country ?? '—'}</td>
                  <td className="px-4 py-2.5">{b.alertOptIn ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2.5 text-fc-ink-3">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {buyers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-fc-ink-3">
                    No buyers yet.
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
