import type { ApiLot } from '../lib/api.js';

// Renders once a buyer session unlocks the full passport (Phase 2+). The
// pricing text/locked-state split all comes from the shared pricing-display
// module via the API's `pricing` field — this component only lays it out.
export default function GatedPassportSection({ lot }: { lot: ApiLot }) {
  if (lot.pricing.locked) return null;

  const rows: Array<[string, string]> = [];
  if (lot.availableKg) rows.push(['Available volume', `${lot.availableKg} kg`]);
  rows.push(['Pricing', lot.pricing.text]);
  if (lot.pricing.incoterm) rows.push(['Incoterm', lot.pricing.incoterm]);
  if (lot.moisture) rows.push(['Moisture', `${lot.moisture}%`]);
  if (lot.waterActivity) rows.push(['Water activity', lot.waterActivity]);
  if (lot.screenSize) rows.push(['Screen size', lot.screenSize]);
  if (lot.certifications && lot.certifications.length > 0) {
    rows.push(['Certifications', lot.certifications.join(', ')]);
  }
  if (lot.exportReadiness) rows.push(['Export readiness', lot.exportReadiness]);

  return (
    <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-5">
      <dl className="text-sm divide-y divide-fc-line-soft">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 first:pt-0 last:pb-0">
            <dt className="text-fc-ink-2">{label}</dt>
            <dd className="text-fc-ink font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          disabled
          title="Available once RFQ requests ship in Phase 3"
          className="flex-1 px-4 py-2.5 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper opacity-50 cursor-not-allowed"
        >
          Request Quote
        </button>
        {lot.sampleAvailable && (
          <button
            type="button"
            disabled
            title="Available once sample requests ship in Phase 3"
            className="flex-1 px-4 py-2.5 rounded-fc-md text-sm font-medium border border-fc-border-strong text-fc-ink opacity-50 cursor-not-allowed"
          >
            Request Sample
          </button>
        )}
      </div>
    </div>
  );
}
