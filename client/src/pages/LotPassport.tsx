import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLot, type ApiLot } from '../lib/api.js';
import StatusBadge from '../components/StatusBadge.js';
import LockedPassportSection from '../components/LockedPassportSection.js';
import GatedPassportSection from '../components/GatedPassportSection.js';

export default function LotPassport() {
  const { lotCode } = useParams<{ lotCode: string }>();
  const [lot, setLot] = useState<ApiLot | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lotCode) return;
    setLoading(true);
    setNotFound(false);
    fetchLot(lotCode)
      .then(setLot)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [lotCode]);

  if (loading) {
    return <p className="max-w-6xl mx-auto px-6 md:px-10 py-10 text-sm text-fc-ink-3">Loading…</p>;
  }

  if (notFound || !lot) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <p className="text-sm text-fc-ink-2">
          This lot could not be found. It may have been sold or made private.
        </p>
      </div>
    );
  }

  const image = lot.images[0];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded-fc-lg overflow-hidden h-[280px] bg-fc-paper-2 flex items-center justify-center text-fc-ink-3 text-sm">
            {image ? (
              <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
            ) : (
              'Lot photo'
            )}
          </div>
        </div>

        <div>
          <span className="font-mono text-xs text-fc-ink-3">{lot.lotCode}</span>
          <h1 className="font-display font-medium text-[28px] text-fc-ink mt-1 mb-3.5">
            {lot.title}
          </h1>
          <div className="flex gap-2 flex-wrap mb-3.5">
            <StatusBadge status={lot.status} />
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-fc-pill bg-fc-paper-2 text-fc-ink-2 border border-fc-border-strong">
              {lot.variety}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-fc-pill bg-fc-paper-2 text-fc-ink-2 border border-fc-border-strong">
              {lot.process}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-fc-pill bg-fc-paper-2 text-fc-ink-2 border border-fc-border-strong">
              {lot.region}
            </span>
          </div>
          {lot.tastingNotes && (
            <p className="text-sm text-fc-ink-2 leading-relaxed">{lot.tastingNotes}</p>
          )}
          <div className="flex gap-8 my-4">
            {lot.cupScore && (
              <div>
                <div className="font-display font-semibold text-lg text-fc-ink">{lot.cupScore}</div>
                <div className="text-[11px] text-fc-ink-3">Cup score</div>
              </div>
            )}
            {lot.harvestWindow && (
              <div>
                <div className="font-display font-semibold text-lg text-fc-ink">
                  {lot.harvestWindow}
                </div>
                <div className="text-[11px] text-fc-ink-3">Harvest window</div>
              </div>
            )}
          </div>

          {lot.pricing.locked ? <LockedPassportSection /> : <GatedPassportSection lot={lot} />}
        </div>
      </div>
    </div>
  );
}
