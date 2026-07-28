import { Link } from 'react-router-dom';
import type { ApiLot } from '../lib/api.js';
import StatusBadge from './StatusBadge.js';

export default function LotCard({ lot }: { lot: ApiLot }) {
  const image = lot.images[0];

  return (
    <Link
      to={`/lots/${lot.lotCode}`}
      className="block bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 overflow-hidden hover:shadow-fc-3 transition-shadow"
    >
      <div className="h-32 bg-fc-paper-2 flex items-center justify-center text-fc-ink-3 text-xs">
        {image ? (
          <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
        ) : (
          'Lot photo'
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <span className="font-display text-[15px] text-fc-ink">{lot.title}</span>
          <StatusBadge status={lot.status} />
        </div>
        <div className="text-xs text-fc-ink-3 mt-1 mb-2.5">
          {lot.variety} &middot; {lot.process} &middot; {lot.region}
          {lot.altitude ? ` · ${lot.altitude}` : ''}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-fc-sage-deep">
            {lot.cupScore ? `Cup ${lot.cupScore}` : lot.lotCode}
          </span>
          <span className="text-xs font-medium px-3 py-1.5 rounded-fc-md border border-fc-border-strong bg-fc-paper-2 text-fc-ink">
            View Lot
          </span>
        </div>
      </div>
    </Link>
  );
}
