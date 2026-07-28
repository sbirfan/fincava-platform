import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  BUYER_TYPE,
  COMMODITY_TYPE,
  CONTACT_METHOD,
  DELIVERY_WINDOW,
  INTENDED_USE,
  INVENTORY_TYPE,
  LOT_STATUS,
  PRICING_STRATEGY,
  REQUEST_STATUS,
  SOURCING_STATUS,
  VERIFICATION_STATUS,
  VOLUME_FLEXIBILITY,
} from '@fincava/shared';

// ---------------------------------------------------------------------------
// Enums — value lists live once in @fincava/shared and are imported here so
// the Postgres enum and the zod validation schemas (added in later phases)
// can never drift apart.
// ---------------------------------------------------------------------------

export const commodityTypeEnum = pgEnum('commodity_type', COMMODITY_TYPE);
export const inventoryTypeEnum = pgEnum('inventory_type', INVENTORY_TYPE);
export const lotStatusEnum = pgEnum('lot_status', LOT_STATUS);
export const pricingStrategyEnum = pgEnum('pricing_strategy', PRICING_STRATEGY);
export const buyerTypeEnum = pgEnum('buyer_type', BUYER_TYPE);
export const requestStatusEnum = pgEnum('request_status', REQUEST_STATUS);
export const sourcingStatusEnum = pgEnum('sourcing_status', SOURCING_STATUS);
export const verificationStatusEnum = pgEnum('verification_status', VERIFICATION_STATUS);
export const intendedUseEnum = pgEnum('intended_use', INTENDED_USE);
export const volumeFlexibilityEnum = pgEnum('volume_flexibility', VOLUME_FLEXIBILITY);
export const deliveryWindowEnum = pgEnum('delivery_window', DELIVERY_WINDOW);
export const contactMethodEnum = pgEnum('contact_method', CONTACT_METHOD);

// ---------------------------------------------------------------------------
// Shared column helpers — every table gets id/createdAt/updatedAt per the
// spec's convention. This is column reuse, not an abstraction layer: each
// table still declares its own shape explicitly below.
// ---------------------------------------------------------------------------

const id = uuid('id').primaryKey().defaultRandom();
const createdAt = timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp('updated_at', { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Auth: OTP codes + sessions
// ---------------------------------------------------------------------------

export const otpCodes = pgTable(
  'otp_codes',
  {
    id,
    email: text('email').notNull(),
    codeHash: text('code_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [index('otp_codes_email_idx').on(table.email)],
);

export const sessions = pgTable(
  'sessions',
  {
    // The row id doubles as the session token stored in the cookie.
    id,
    buyerProfileId: uuid('buyer_profile_id').references(() => buyerProfiles.id, {
      onDelete: 'cascade',
    }),
    isAdmin: boolean('is_admin').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [index('sessions_buyer_profile_id_idx').on(table.buyerProfileId)],
);

// ---------------------------------------------------------------------------
// Green coffee lots (the "coffee passport")
// ---------------------------------------------------------------------------

export const greenCoffeeLots = pgTable(
  'green_coffee_lots',
  {
    id,
    lotCode: text('lot_code').notNull(),
    title: text('title').notNull(),
    commodityType: commodityTypeEnum('commodity_type').notNull().default('GREEN_COFFEE'),
    inventoryType: inventoryTypeEnum('inventory_type').notNull(),
    status: lotStatusEnum('status').notNull(),
    // INVITE_ONLY lots default to false at creation (app-layer enforces this
    // on insert); admin can flip to true later per the spec's "no takers"
    // behavior. Not enforced as a DB default since it depends on pricingStrategy.
    visible: boolean('visible').notNull().default(true),
    variety: text('variety').notNull(),
    process: text('process').notNull(),
    region: text('region').notNull(),
    farm: text('farm'),
    producer: text('producer'),
    altitude: text('altitude'),
    harvestDate: timestamp('harvest_date', { withTimezone: true }),
    harvestWindow: text('harvest_window'),
    availableKg: numeric('available_kg', { precision: 12, scale: 2 }),
    cupScore: numeric('cup_score', { precision: 5, scale: 2 }),
    moisture: numeric('moisture', { precision: 5, scale: 2 }),
    waterActivity: numeric('water_activity', { precision: 4, scale: 3 }),
    screenSize: text('screen_size'),
    tastingNotes: text('tasting_notes'),
    certifications: text('certifications').array().notNull().default([]),
    exportReadiness: text('export_readiness'),
    sampleAvailable: boolean('sample_available').notNull().default(false),
    // {url, publicId, alt}[] — Cloudinary is the source of truth for the
    // binary; only the secure URL + public ID are ever persisted here.
    images: jsonb('images').notNull().default([]),
    pricingStrategy: pricingStrategyEnum('pricing_strategy').notNull().default('RFQ_ONLY'),
    currency: text('currency').notNull().default('USD'),
    pricePerKg: numeric('price_per_kg', { precision: 10, scale: 4 }),
    priceRangeLowPerKg: numeric('price_range_low_per_kg', { precision: 10, scale: 4 }),
    priceRangeHighPerKg: numeric('price_range_high_per_kg', { precision: 10, scale: 4 }),
    incoterm: text('incoterm'),
    priceNotesPublic: text('price_notes_public'),
    // Admin-only — must never appear in any buyer-facing API response.
    priceNotesInternal: text('price_notes_internal'),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('green_coffee_lots_lot_code_idx').on(table.lotCode),
    index('green_coffee_lots_status_idx').on(table.status),
    index('green_coffee_lots_visible_idx').on(table.visible),
  ],
);

// ---------------------------------------------------------------------------
// Buyer profiles (created on first successful OTP for a new email)
// ---------------------------------------------------------------------------

export const buyerProfiles = pgTable(
  'buyer_profiles',
  {
    id,
    // Stored lowercased at the application layer; uniqueness enforced here.
    email: text('email').notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    name: text('name'),
    company: text('company'),
    phone: text('phone'),
    country: text('country'),
    buyerType: buyerTypeEnum('buyer_type'),
    website: text('website'),
    preferredContactMethod: contactMethodEnum('preferred_contact_method'),
    preferredVarieties: text('preferred_varieties').array().notNull().default([]),
    preferredProcesses: text('preferred_processes').array().notNull().default([]),
    preferredScoreMin: numeric('preferred_score_min', { precision: 5, scale: 2 }),
    preferredScoreMax: numeric('preferred_score_max', { precision: 5, scale: 2 }),
    preferredVolumeMinKg: numeric('preferred_volume_min_kg', { precision: 12, scale: 2 }),
    preferredVolumeMaxKg: numeric('preferred_volume_max_kg', { precision: 12, scale: 2 }),
    targetOrigins: text('target_origins').array().notNull().default([]),
    certificationsNeeded: text('certifications_needed').array().notNull().default([]),
    destinationCountries: text('destination_countries').array().notNull().default([]),
    alertOptIn: boolean('alert_opt_in').notNull().default(false),
    alertCompetitionLots: boolean('alert_competition_lots').notNull().default(false),
    marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
    consentTimestamp: timestamp('consent_timestamp', { withTimezone: true }),
    // Admin-only.
    internalNotes: text('internal_notes'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex('buyer_profiles_email_idx').on(table.email)],
);

// ---------------------------------------------------------------------------
// RFQs (auth-required, lot-linked)
// ---------------------------------------------------------------------------

export const rfqs = pgTable(
  'rfqs',
  {
    id,
    buyerProfileId: uuid('buyer_profile_id')
      .notNull()
      .references(() => buyerProfiles.id, { onDelete: 'cascade' }),
    lotId: uuid('lot_id')
      .notNull()
      .references(() => greenCoffeeLots.id, { onDelete: 'restrict' }),
    requestedVolumeKg: numeric('requested_volume_kg', { precision: 12, scale: 2 }).notNull(),
    destinationCountry: text('destination_country').notNull(),
    preferredIncoterm: text('preferred_incoterm'),
    requiredCertifications: text('required_certifications').array().notNull().default([]),
    targetDeliveryTimeline: text('target_delivery_timeline'),
    message: text('message'),
    status: requestStatusEnum('status').notNull().default('NEW'),
    // Admin-only.
    internalNotes: text('internal_notes'),
    createdAt,
    updatedAt,
  },
  (table) => [
    index('rfqs_buyer_profile_id_idx').on(table.buyerProfileId),
    index('rfqs_lot_id_idx').on(table.lotId),
  ],
);

// ---------------------------------------------------------------------------
// Sample requests (auth-required, lot-linked, sampleAvailable lots only)
// ---------------------------------------------------------------------------

export const sampleRequests = pgTable(
  'sample_requests',
  {
    id,
    buyerProfileId: uuid('buyer_profile_id')
      .notNull()
      .references(() => buyerProfiles.id, { onDelete: 'cascade' }),
    lotId: uuid('lot_id')
      .notNull()
      .references(() => greenCoffeeLots.id, { onDelete: 'restrict' }),
    sampleDestination: text('sample_destination').notNull(),
    courierAccount: text('courier_account'),
    evaluationTimeline: text('evaluation_timeline'),
    message: text('message'),
    status: requestStatusEnum('status').notNull().default('NEW'),
    // Admin-only.
    internalNotes: text('internal_notes'),
    createdAt,
    updatedAt,
  },
  (table) => [
    index('sample_requests_buyer_profile_id_idx').on(table.buyerProfileId),
    index('sample_requests_lot_id_idx').on(table.lotId),
  ],
);

// ---------------------------------------------------------------------------
// Sourcing requests (auth-required, standalone — not lot-linked at creation)
// ---------------------------------------------------------------------------

export const sourcingRequests = pgTable(
  'sourcing_requests',
  {
    id,
    buyerProfileId: uuid('buyer_profile_id')
      .notNull()
      .references(() => buyerProfiles.id, { onDelete: 'cascade' }),
    intendedUse: intendedUseEnum('intended_use').notNull(),
    varietyPreferences: text('variety_preferences').array().notNull().default([]),
    processPreferences: text('process_preferences').array().notNull().default([]),
    minCupScore: numeric('min_cup_score', { precision: 5, scale: 2 }),
    requestedVolumeKg: numeric('requested_volume_kg', { precision: 12, scale: 2 }).notNull(),
    volumeFlexibility: volumeFlexibilityEnum('volume_flexibility').notNull(),
    targetDeliveryWindow: deliveryWindowEnum('target_delivery_window').notNull(),
    destinationCountry: text('destination_country').notNull(),
    altitudePreference: text('altitude_preference'),
    regionPreferences: text('region_preferences').array().notNull().default([]),
    certificationsNeeded: text('certifications_needed').array().notNull().default([]),
    // Optional by design — visible to the submitting buyer and admin only,
    // never to producers or other buyers.
    maxBudgetPerKg: numeric('max_budget_per_kg', { precision: 10, scale: 4 }),
    budgetCurrency: text('budget_currency').notNull().default('USD'),
    additionalNotes: text('additional_notes'),
    status: sourcingStatusEnum('status').notNull().default('NEW'),
    matchedLotId: uuid('matched_lot_id').references(() => greenCoffeeLots.id, {
      onDelete: 'set null',
    }),
    // Admin-only.
    internalNotes: text('internal_notes'),
    createdAt,
    updatedAt,
  },
  (table) => [
    index('sourcing_requests_buyer_profile_id_idx').on(table.buyerProfileId),
    index('sourcing_requests_matched_lot_id_idx').on(table.matchedLotId),
  ],
);

// ---------------------------------------------------------------------------
// Verification requests (addendum — public, unauthenticated by deliberate
// design; see doc/FINCAVA_PLATFORM_ADDENDUM_VERIFICATION.md)
// ---------------------------------------------------------------------------

export const verificationRequests = pgTable(
  'verification_requests',
  {
    id,
    requesterName: text('requester_name').notNull(),
    requesterEmail: text('requester_email').notNull(),
    requesterCompany: text('requester_company').notNull(),
    requesterPhone: text('requester_phone'),
    country: text('country'),
    // Free text — a specific farm/lot name, or blank for a general inquiry.
    farmOrLotOfInterest: text('farm_or_lot_of_interest'),
    regionOfInterest: text('region_of_interest'),
    message: text('message'),
    linkedLotId: uuid('linked_lot_id').references(() => greenCoffeeLots.id, {
      onDelete: 'set null',
    }),
    status: verificationStatusEnum('status').notNull().default('NEW'),
    // Admin-only.
    internalNotes: text('internal_notes'),
    reportDeliveredAt: timestamp('report_delivered_at', { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [index('verification_requests_linked_lot_id_idx').on(table.linkedLotId)],
);

// ---------------------------------------------------------------------------
// Market intelligence notes (admin-only, Accio-assisted manual research)
// ---------------------------------------------------------------------------

export const marketIntelligenceNotes = pgTable(
  'market_intelligence_notes',
  {
    id,
    lotId: uuid('lot_id').references(() => greenCoffeeLots.id, { onDelete: 'set null' }),
    variety: text('variety'),
    process: text('process'),
    targetMarkets: text('target_markets'),
    demandTrend: text('demand_trend'),
    estimatedRateLowPerKg: numeric('estimated_rate_low_per_kg', { precision: 10, scale: 4 }),
    estimatedRateHighPerKg: numeric('estimated_rate_high_per_kg', { precision: 10, scale: 4 }),
    currency: text('currency').notNull().default('USD'),
    comparableOfferings: text('comparable_offerings'),
    suggestedBuyerCategories: text('suggested_buyer_categories'),
    pricingRecommendation: text('pricing_recommendation'),
    researchSource: text('research_source'),
    researchDate: timestamp('research_date', { withTimezone: true }),
    internalNotes: text('internal_notes'),
    createdAt,
    updatedAt,
  },
  (table) => [index('market_intelligence_notes_lot_id_idx').on(table.lotId)],
);
