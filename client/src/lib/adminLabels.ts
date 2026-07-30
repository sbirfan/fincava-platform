// Display-label maps for admin-facing enum values. Converts raw
// underscored enum strings (e.g. SAMPLE_AVAILABLE) into readable labels
// for admin tables and selects — never changes the underlying enum value
// sent to the API.

export const PRICING_STRATEGY_LABELS: Record<string, string> = {
  PUBLIC: 'Public price',
  STARTING_FROM: 'Starting-from price',
  MARKET_RANGE: 'Market range',
  RFQ_ONLY: 'Quote on request (RFQ only)',
  INVITE_ONLY: 'Invite only (hidden by default)',
};

export const COMMODITY_TYPE_LABELS: Record<string, string> = {
  GREEN_COFFEE: 'Green coffee',
  CACAO: 'Cacao',
};

export const INVENTORY_TYPE_LABELS: Record<string, string> = {
  FINCAVA_OWNED: 'FINCAVA-owned',
  FINCAVA_CONTROLLED: 'FINCAVA-controlled',
  EXCLUSIVE_PARTNER: 'Exclusive partner',
  BROKERED: 'Brokered',
  FUTURE_HARVEST: 'Future harvest',
};

export const BUYER_TYPE_LABELS: Record<string, string> = {
  IMPORTER: 'Importer',
  SPECIALTY_ROASTER: 'Specialty roaster',
  BROKER: 'Broker',
  DISTRIBUTOR: 'Distributor',
  COMPETITION_BUYER: 'Competition buyer',
  OTHER: 'Other',
};

export const INTENDED_USE_LABELS: Record<string, string> = {
  HOUSE_BLEND: 'House blend',
  SINGLE_ORIGIN: 'Single origin',
  ESPRESSO_BLEND: 'Espresso blend',
  COMPETITION: 'Competition',
  PRIVATE_LABEL: 'Private label',
  RESALE_DISTRIBUTION: 'Resale / distribution',
  OTHER: 'Other',
};

// Shared across RFQ, sample, sourcing, and verification request statuses —
// values overlap (NEW, REVIEWING, CLOSED) but each enum also has entries
// unique to its own workflow, so one combined map covers all four tabs.
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  REPLIED: 'Replied',
  SAMPLE_SENT: 'Sample sent',
  QUOTED: 'Quoted',
  SOURCING: 'Sourcing',
  MATCHED: 'Matched',
  SCHEDULED: 'Scheduled',
  REPORT_DELIVERED: 'Report delivered',
  CLOSED: 'Closed',
};

export function formatEnumLabel(
  map: Record<string, string>,
  value: string | null | undefined,
): string {
  if (!value) return '—';
  return map[value] ?? value;
}
