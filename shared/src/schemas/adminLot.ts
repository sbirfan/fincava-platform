import { z } from 'zod';
import { COMMODITY_TYPE, INVENTORY_TYPE, LOT_STATUS, PRICING_STRATEGY } from '../enums.js';

const nullableString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v === undefined || v === '' ? null : v));

const nullableNumber = () => z.number().nullish();

// Base shape shared by create and update — create requires the fields a lot
// can't sensibly exist without; update makes everything optional via
// .partial() below so a PATCH only needs to send what's changing.
const adminLotBaseSchema = z.object({
  lotCode: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(200),
  commodityType: z.enum(COMMODITY_TYPE).default('GREEN_COFFEE'),
  inventoryType: z.enum(INVENTORY_TYPE),
  status: z.enum(LOT_STATUS),
  // No schema-level default: INVITE_ONLY lots default to false on creation,
  // everything else defaults to true — that decision needs pricingStrategy,
  // so it's applied in the route handler, not here. `undefined` here means
  // "not explicitly set by the admin", not "false".
  visible: z.boolean().optional(),
  variety: z.string().trim().min(1).max(100),
  process: z.string().trim().min(1).max(100),
  region: z.string().trim().min(1).max(100),
  farm: nullableString(200),
  producer: nullableString(200),
  altitude: nullableString(100),
  harvestDate: z
    .string()
    .datetime()
    .nullish()
    .transform((v) => (v === undefined || v === '' ? null : v)),
  harvestWindow: nullableString(100),
  availableKg: nullableNumber(),
  cupScore: nullableNumber(),
  moisture: nullableNumber(),
  waterActivity: nullableNumber(),
  screenSize: nullableString(50),
  tastingNotes: nullableString(2000),
  certifications: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  exportReadiness: nullableString(200),
  sampleAvailable: z.boolean().default(false),
  pricingStrategy: z.enum(PRICING_STRATEGY).default('RFQ_ONLY'),
  currency: z.string().trim().min(1).max(10).default('USD'),
  pricePerKg: nullableNumber(),
  priceRangeLowPerKg: nullableNumber(),
  priceRangeHighPerKg: nullableNumber(),
  incoterm: nullableString(50),
  priceNotesPublic: nullableString(2000),
  priceNotesInternal: nullableString(2000),
});

export const adminLotCreateInputSchema = adminLotBaseSchema.strict();
export type AdminLotCreateInput = z.infer<typeof adminLotCreateInputSchema>;

export const adminLotUpdateInputSchema = adminLotBaseSchema.partial().strict();
export type AdminLotUpdateInput = z.infer<typeof adminLotUpdateInputSchema>;
