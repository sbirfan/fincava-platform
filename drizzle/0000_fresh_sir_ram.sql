CREATE TYPE "public"."buyer_type" AS ENUM('IMPORTER', 'SPECIALTY_ROASTER', 'BROKER', 'DISTRIBUTOR', 'COMPETITION_BUYER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."commodity_type" AS ENUM('GREEN_COFFEE', 'CACAO');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('EMAIL', 'WHATSAPP', 'PHONE');--> statement-breakpoint
CREATE TYPE "public"."delivery_window" AS ENUM('ASAP', 'WITHIN_1_MONTH', 'WITHIN_3_MONTHS', 'NEXT_HARVEST', 'FLEXIBLE');--> statement-breakpoint
CREATE TYPE "public"."intended_use" AS ENUM('HOUSE_BLEND', 'SINGLE_ORIGIN', 'ESPRESSO_BLEND', 'COMPETITION', 'PRIVATE_LABEL', 'RESALE_DISTRIBUTION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."inventory_type" AS ENUM('FINCAVA_OWNED', 'FINCAVA_CONTROLLED', 'EXCLUSIVE_PARTNER', 'BROKERED', 'FUTURE_HARVEST');--> statement-breakpoint
CREATE TYPE "public"."lot_status" AS ENUM('COMING_SOON', 'SAMPLE_AVAILABLE', 'AVAILABLE', 'LIMITED_QUANTITY', 'RESERVED', 'SOLD');--> statement-breakpoint
CREATE TYPE "public"."pricing_strategy" AS ENUM('PUBLIC', 'STARTING_FROM', 'MARKET_RANGE', 'RFQ_ONLY', 'INVITE_ONLY');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('NEW', 'REVIEWING', 'REPLIED', 'SAMPLE_SENT', 'QUOTED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."sourcing_status" AS ENUM('NEW', 'REVIEWING', 'SOURCING', 'MATCHED', 'QUOTED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('NEW', 'REVIEWING', 'SCHEDULED', 'REPORT_DELIVERED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."volume_flexibility" AS ENUM('EXACT', 'APPROXIMATE', 'FLEXIBLE');--> statement-breakpoint
CREATE TABLE "buyer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"name" text,
	"company" text,
	"phone" text,
	"country" text,
	"buyer_type" "buyer_type",
	"website" text,
	"preferred_contact_method" "contact_method",
	"preferred_varieties" text[] DEFAULT '{}' NOT NULL,
	"preferred_processes" text[] DEFAULT '{}' NOT NULL,
	"preferred_score_min" numeric(5, 2),
	"preferred_score_max" numeric(5, 2),
	"preferred_volume_min_kg" numeric(12, 2),
	"preferred_volume_max_kg" numeric(12, 2),
	"target_origins" text[] DEFAULT '{}' NOT NULL,
	"certifications_needed" text[] DEFAULT '{}' NOT NULL,
	"destination_countries" text[] DEFAULT '{}' NOT NULL,
	"alert_opt_in" boolean DEFAULT false NOT NULL,
	"alert_competition_lots" boolean DEFAULT false NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"consent_timestamp" timestamp with time zone,
	"internal_notes" text,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "green_coffee_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_code" text NOT NULL,
	"title" text NOT NULL,
	"commodity_type" "commodity_type" DEFAULT 'GREEN_COFFEE' NOT NULL,
	"inventory_type" "inventory_type" NOT NULL,
	"status" "lot_status" NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"variety" text NOT NULL,
	"process" text NOT NULL,
	"region" text NOT NULL,
	"farm" text,
	"producer" text,
	"altitude" text,
	"harvest_date" timestamp with time zone,
	"harvest_window" text,
	"available_kg" numeric(12, 2),
	"cup_score" numeric(5, 2),
	"moisture" numeric(5, 2),
	"water_activity" numeric(4, 3),
	"screen_size" text,
	"tasting_notes" text,
	"certifications" text[] DEFAULT '{}' NOT NULL,
	"export_readiness" text,
	"sample_available" boolean DEFAULT false NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pricing_strategy" "pricing_strategy" DEFAULT 'RFQ_ONLY' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"price_per_kg" numeric(10, 4),
	"price_range_low_per_kg" numeric(10, 4),
	"price_range_high_per_kg" numeric(10, 4),
	"incoterm" text,
	"price_notes_public" text,
	"price_notes_internal" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_intelligence_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" uuid,
	"variety" text,
	"process" text,
	"target_markets" text,
	"demand_trend" text,
	"estimated_rate_low_per_kg" numeric(10, 4),
	"estimated_rate_high_per_kg" numeric(10, 4),
	"currency" text DEFAULT 'USD' NOT NULL,
	"comparable_offerings" text,
	"suggested_buyer_categories" text,
	"pricing_recommendation" text,
	"research_source" text,
	"research_date" timestamp with time zone,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_profile_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"requested_volume_kg" numeric(12, 2) NOT NULL,
	"destination_country" text NOT NULL,
	"preferred_incoterm" text,
	"required_certifications" text[] DEFAULT '{}' NOT NULL,
	"target_delivery_timeline" text,
	"message" text,
	"status" "request_status" DEFAULT 'NEW' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sample_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_profile_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"sample_destination" text NOT NULL,
	"courier_account" text,
	"evaluation_timeline" text,
	"message" text,
	"status" "request_status" DEFAULT 'NEW' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_profile_id" uuid,
	"is_admin" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sourcing_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_profile_id" uuid NOT NULL,
	"intended_use" "intended_use" NOT NULL,
	"variety_preferences" text[] DEFAULT '{}' NOT NULL,
	"process_preferences" text[] DEFAULT '{}' NOT NULL,
	"min_cup_score" numeric(5, 2),
	"requested_volume_kg" numeric(12, 2) NOT NULL,
	"volume_flexibility" "volume_flexibility" NOT NULL,
	"target_delivery_window" "delivery_window" NOT NULL,
	"destination_country" text NOT NULL,
	"altitude_preference" text,
	"region_preferences" text[] DEFAULT '{}' NOT NULL,
	"certifications_needed" text[] DEFAULT '{}' NOT NULL,
	"max_budget_per_kg" numeric(10, 4),
	"budget_currency" text DEFAULT 'USD' NOT NULL,
	"additional_notes" text,
	"status" "sourcing_status" DEFAULT 'NEW' NOT NULL,
	"matched_lot_id" uuid,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_name" text NOT NULL,
	"requester_email" text NOT NULL,
	"requester_company" text NOT NULL,
	"requester_phone" text,
	"country" text,
	"farm_or_lot_of_interest" text,
	"region_of_interest" text,
	"message" text,
	"linked_lot_id" uuid,
	"status" "verification_status" DEFAULT 'NEW' NOT NULL,
	"internal_notes" text,
	"report_delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_intelligence_notes" ADD CONSTRAINT "market_intelligence_notes_lot_id_green_coffee_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."green_coffee_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_lot_id_green_coffee_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."green_coffee_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sample_requests" ADD CONSTRAINT "sample_requests_lot_id_green_coffee_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."green_coffee_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_requests" ADD CONSTRAINT "sourcing_requests_buyer_profile_id_buyer_profiles_id_fk" FOREIGN KEY ("buyer_profile_id") REFERENCES "public"."buyer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_requests" ADD CONSTRAINT "sourcing_requests_matched_lot_id_green_coffee_lots_id_fk" FOREIGN KEY ("matched_lot_id") REFERENCES "public"."green_coffee_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_linked_lot_id_green_coffee_lots_id_fk" FOREIGN KEY ("linked_lot_id") REFERENCES "public"."green_coffee_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "buyer_profiles_email_idx" ON "buyer_profiles" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "green_coffee_lots_lot_code_idx" ON "green_coffee_lots" USING btree ("lot_code");--> statement-breakpoint
CREATE INDEX "green_coffee_lots_status_idx" ON "green_coffee_lots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "green_coffee_lots_visible_idx" ON "green_coffee_lots" USING btree ("visible");--> statement-breakpoint
CREATE INDEX "market_intelligence_notes_lot_id_idx" ON "market_intelligence_notes" USING btree ("lot_id");--> statement-breakpoint
CREATE INDEX "otp_codes_email_idx" ON "otp_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "rfqs_buyer_profile_id_idx" ON "rfqs" USING btree ("buyer_profile_id");--> statement-breakpoint
CREATE INDEX "rfqs_lot_id_idx" ON "rfqs" USING btree ("lot_id");--> statement-breakpoint
CREATE INDEX "sample_requests_buyer_profile_id_idx" ON "sample_requests" USING btree ("buyer_profile_id");--> statement-breakpoint
CREATE INDEX "sample_requests_lot_id_idx" ON "sample_requests" USING btree ("lot_id");--> statement-breakpoint
CREATE INDEX "sessions_buyer_profile_id_idx" ON "sessions" USING btree ("buyer_profile_id");--> statement-breakpoint
CREATE INDEX "sourcing_requests_buyer_profile_id_idx" ON "sourcing_requests" USING btree ("buyer_profile_id");--> statement-breakpoint
CREATE INDEX "sourcing_requests_matched_lot_id_idx" ON "sourcing_requests" USING btree ("matched_lot_id");--> statement-breakpoint
CREATE INDEX "verification_requests_linked_lot_id_idx" ON "verification_requests" USING btree ("linked_lot_id");