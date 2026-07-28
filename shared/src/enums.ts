// Single source of truth for every enum's value set. Consumed by the Drizzle
// pgEnum definitions in server/src/db/schema.ts and by zod schemas so the two
// never drift.

export const COMMODITY_TYPE = ['GREEN_COFFEE', 'CACAO'] as const;
export type CommodityType = (typeof COMMODITY_TYPE)[number];

export const INVENTORY_TYPE = [
  'FINCAVA_OWNED',
  'FINCAVA_CONTROLLED',
  'EXCLUSIVE_PARTNER',
  'BROKERED',
  'FUTURE_HARVEST',
] as const;
export type InventoryType = (typeof INVENTORY_TYPE)[number];

export const LOT_STATUS = [
  'COMING_SOON',
  'SAMPLE_AVAILABLE',
  'AVAILABLE',
  'LIMITED_QUANTITY',
  'RESERVED',
  'SOLD',
] as const;
export type LotStatus = (typeof LOT_STATUS)[number];

export const PRICING_STRATEGY = [
  'PUBLIC',
  'STARTING_FROM',
  'MARKET_RANGE',
  'RFQ_ONLY',
  'INVITE_ONLY',
] as const;
export type PricingStrategy = (typeof PRICING_STRATEGY)[number];

export const BUYER_TYPE = [
  'IMPORTER',
  'SPECIALTY_ROASTER',
  'BROKER',
  'DISTRIBUTOR',
  'COMPETITION_BUYER',
  'OTHER',
] as const;
export type BuyerType = (typeof BUYER_TYPE)[number];

// Used by RFQs and sample requests.
export const REQUEST_STATUS = [
  'NEW',
  'REVIEWING',
  'REPLIED',
  'SAMPLE_SENT',
  'QUOTED',
  'CLOSED',
] as const;
export type RequestStatus = (typeof REQUEST_STATUS)[number];

export const SOURCING_STATUS = [
  'NEW',
  'REVIEWING',
  'SOURCING',
  'MATCHED',
  'QUOTED',
  'CLOSED',
] as const;
export type SourcingStatus = (typeof SOURCING_STATUS)[number];

// Addendum: farm/lot verification requests.
export const VERIFICATION_STATUS = [
  'NEW',
  'REVIEWING',
  'SCHEDULED',
  'REPORT_DELIVERED',
  'CLOSED',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const INTENDED_USE = [
  'HOUSE_BLEND',
  'SINGLE_ORIGIN',
  'ESPRESSO_BLEND',
  'COMPETITION',
  'PRIVATE_LABEL',
  'RESALE_DISTRIBUTION',
  'OTHER',
] as const;
export type IntendedUse = (typeof INTENDED_USE)[number];

export const VOLUME_FLEXIBILITY = ['EXACT', 'APPROXIMATE', 'FLEXIBLE'] as const;
export type VolumeFlexibility = (typeof VOLUME_FLEXIBILITY)[number];

export const DELIVERY_WINDOW = [
  'ASAP',
  'WITHIN_1_MONTH',
  'WITHIN_3_MONTHS',
  'NEXT_HARVEST',
  'FLEXIBLE',
] as const;
export type DeliveryWindow = (typeof DELIVERY_WINDOW)[number];

export const CONTACT_METHOD = ['EMAIL', 'WHATSAPP', 'PHONE'] as const;
export type ContactMethod = (typeof CONTACT_METHOD)[number];
