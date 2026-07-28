import { getPricingDisplay, type PricingDisplay } from '@fincava/shared';
import type { greenCoffeeLots } from '../db/schema.js';

type LotRow = typeof greenCoffeeLots.$inferSelect;

interface PublicLotImage {
  url: string;
  publicId: string;
  alt: string;
}

// Catalog card + partial passport — everything an anonymous visitor sees.
// Exact field list per execution-spec §6. Deliberately does NOT spread the
// row: listing fields explicitly is what makes it impossible for a new
// column added to the schema later to leak here by accident.
export interface PublicLot {
  lotCode: string;
  title: string;
  variety: string;
  process: string;
  region: string;
  altitude: string | null;
  status: LotRow['status'];
  cupScore: string | null;
  tastingNotes: string | null;
  harvestWindow: string | null;
  images: PublicLotImage[];
  sampleAvailable: boolean;
  pricing: PricingDisplay;
}

// Adds the fields unlocked for authenticated buyers, per §6's "Gated" row.
export interface GatedLot extends PublicLot {
  farm: string | null;
  producer: string | null;
  harvestDate: string | null;
  availableKg: string | null;
  moisture: string | null;
  waterActivity: string | null;
  screenSize: string | null;
  certifications: string[];
  exportReadiness: string | null;
  incoterm: string | null;
  priceNotesPublic: string | null;
}

// inventoryType, priceNotesInternal, visible, and internalNotes are never
// included here at all — they only ever appear on admin endpoints (Phase 4).
export function serializeLot(lot: LotRow, isAuthenticated: boolean): PublicLot | GatedLot {
  const pricing = getPricingDisplay(
    {
      pricingStrategy: lot.pricingStrategy,
      currency: lot.currency,
      pricePerKg: lot.pricePerKg === null ? null : Number(lot.pricePerKg),
      priceRangeLowPerKg: lot.priceRangeLowPerKg === null ? null : Number(lot.priceRangeLowPerKg),
      priceRangeHighPerKg:
        lot.priceRangeHighPerKg === null ? null : Number(lot.priceRangeHighPerKg),
      incoterm: lot.incoterm,
    },
    isAuthenticated,
  );

  const publicLot: PublicLot = {
    lotCode: lot.lotCode,
    title: lot.title,
    variety: lot.variety,
    process: lot.process,
    region: lot.region,
    altitude: lot.altitude,
    status: lot.status,
    cupScore: lot.cupScore,
    tastingNotes: lot.tastingNotes,
    harvestWindow: lot.harvestWindow,
    images: lot.images as PublicLotImage[],
    sampleAvailable: lot.sampleAvailable,
    pricing,
  };

  if (!isAuthenticated) {
    return publicLot;
  }

  const gatedLot: GatedLot = {
    ...publicLot,
    farm: lot.farm,
    producer: lot.producer,
    harvestDate: lot.harvestDate ? lot.harvestDate.toISOString() : null,
    availableKg: lot.availableKg,
    moisture: lot.moisture,
    waterActivity: lot.waterActivity,
    screenSize: lot.screenSize,
    certifications: lot.certifications,
    exportReadiness: lot.exportReadiness,
    incoterm: lot.incoterm,
    priceNotesPublic: lot.priceNotesPublic,
  };
  return gatedLot;
}
