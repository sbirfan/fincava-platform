import type { PricingStrategy } from './enums.js';

// Single canonical conversion — pricePerKg is the only stored price field;
// per-lb is always derived for display, never persisted.
export const KG_TO_LB = 2.20462;

export function deriveDollarPerLb(pricePerKg: number): number {
  return pricePerKg / KG_TO_LB;
}

export interface LotPricingInput {
  pricingStrategy: PricingStrategy;
  currency: string;
  pricePerKg: number | null;
  priceRangeLowPerKg: number | null;
  priceRangeHighPerKg: number | null;
  incoterm: string | null;
}

export type PricingDisplay =
  | { locked: true; message: string }
  | { locked: false; strategy: PricingStrategy; text: string; incoterm: string | null };

const LOCKED_MESSAGE = 'Sign in or register to view pricing and full specs';

function formatMoney(amount: number, currency: string, fractionDigits = 2): string {
  return `${currency} ${amount.toFixed(fractionDigits)}`;
}

// The single source of truth for how each pricing strategy is rendered to
// buyers, per execution-spec §5's display table. Pricing is only ever shown
// to authenticated buyers regardless of strategy — anonymous visitors get
// the same locked message no matter what pricingStrategy the lot has.
export function getPricingDisplay(lot: LotPricingInput, isAuthenticated: boolean): PricingDisplay {
  if (!isAuthenticated) {
    return { locked: true, message: LOCKED_MESSAGE };
  }

  switch (lot.pricingStrategy) {
    case 'PUBLIC': {
      const perKg = lot.pricePerKg ?? 0;
      const perLb = deriveDollarPerLb(perKg);
      return {
        locked: false,
        strategy: lot.pricingStrategy,
        text: `${formatMoney(perKg, lot.currency, 2)}/kg (${formatMoney(perLb, lot.currency, 2)}/lb)`,
        incoterm: lot.incoterm,
      };
    }
    case 'STARTING_FROM': {
      const perKg = lot.pricePerKg ?? 0;
      return {
        locked: false,
        strategy: lot.pricingStrategy,
        text: `Starting at ${formatMoney(perKg, lot.currency, 2)}/kg`,
        incoterm: lot.incoterm,
      };
    }
    case 'MARKET_RANGE': {
      const low = lot.priceRangeLowPerKg ?? 0;
      const high = lot.priceRangeHighPerKg ?? 0;
      return {
        locked: false,
        strategy: lot.pricingStrategy,
        text: `Estimated ${formatMoney(low, lot.currency, 2)}–${formatMoney(high, lot.currency, 2)}/kg`,
        incoterm: lot.incoterm,
      };
    }
    case 'RFQ_ONLY':
      return {
        locked: false,
        strategy: lot.pricingStrategy,
        text: 'Request a quote for pricing',
        incoterm: lot.incoterm,
      };
    case 'INVITE_ONLY':
      return {
        locked: false,
        strategy: lot.pricingStrategy,
        text: 'Contact FINCAVA for pricing',
        incoterm: lot.incoterm,
      };
  }
}
