import { z } from 'zod';

const nullableString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v === undefined || v === '' ? null : v));

const marketIntelligenceBaseSchema = z.object({
  lotId: z.string().uuid().nullish(),
  variety: nullableString(100),
  process: nullableString(100),
  targetMarkets: nullableString(500),
  demandTrend: nullableString(200),
  estimatedRateLowPerKg: z.number().nullish(),
  estimatedRateHighPerKg: z.number().nullish(),
  currency: z.string().trim().min(1).max(10).default('USD'),
  comparableOfferings: nullableString(2000),
  suggestedBuyerCategories: nullableString(500),
  pricingRecommendation: nullableString(2000),
  researchSource: nullableString(300),
  researchDate: z
    .string()
    .datetime()
    .nullish()
    .transform((v) => (v === undefined || v === '' ? null : v)),
  internalNotes: nullableString(4000),
});

export const marketIntelligenceCreateInputSchema = marketIntelligenceBaseSchema.strict();
export type MarketIntelligenceCreateInput = z.infer<typeof marketIntelligenceCreateInputSchema>;

export const marketIntelligenceUpdateInputSchema = marketIntelligenceBaseSchema.partial().strict();
export type MarketIntelligenceUpdateInput = z.infer<typeof marketIntelligenceUpdateInputSchema>;
