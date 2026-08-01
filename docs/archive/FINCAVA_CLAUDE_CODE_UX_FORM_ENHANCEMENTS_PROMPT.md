# Claude Code Implementation Task: FINCAVA User-Flow and Form Experience Enhancements

You are working in the `sbirfan/fincava-platform` repository on the `main` branch.

## Mission

Improve the FINCAVA platform’s end-to-end user experience by redesigning user flows and input forms around these principles:

1. Reduce unnecessary typing.
2. Prefer curated, domain-appropriate choices.
3. Preserve flexibility through an “Other” option that reveals a text input.
4. Use progressive disclosure so users see only relevant questions.
5. Reuse saved buyer information to avoid repetitive data entry.
6. Improve data quality without making forms feel longer or more bureaucratic.
7. Preserve existing business logic, security, privacy, and operational constraints.
8. Keep the experience professional, credible, and appropriate for specialty-coffee buyers.

Implement the enhancements directly in the local checkout.

Do not push, open a pull request, deploy, or modify Git history.

## Product Context

FINCAVA is a business-to-business green-coffee sourcing platform for professional buyers, including specialty roasters, importers, brokers, distributors, private-label buyers, competition buyers, coffee laboratories, and green-coffee traders.

The platform includes public lot discovery, lot passports, passwordless buyer authentication, buyer profiles and sourcing preferences, quote requests, sample requests, open sourcing requests, fee-based field-verification requests, buyer request history, and an internal admin workspace.

FINCAVA operates from Taylor, Texas, and San Gil, Santander, Colombia. The platform should feel like a professional sourcing workspace, not a collection of generic web forms.

## Critical Constraints

Do not:

- change route paths;
- remove existing fields;
- change API response shapes without updating all consumers;
- change enum values merely for display purposes;
- weaken server-side validation;
- expose confidential buyer information;
- alter authentication or authorization behavior;
- change request-status workflows;
- add unsupported commercial guarantees;
- imply that submitting a request reserves inventory;
- imply that sample approval or shipment is automatic;
- imply that sourcing matches are guaranteed;
- imply that field verification is certification, auditing, legal due diligence, or a guarantee;
- change the existing response commitments of 2, 5, or 10 business days;
- add dependencies unless clearly necessary and justified;
- modify legal terms substantively;
- add migrations unless a persisted data enhancement genuinely requires one.

Prefer backward-compatible implementation. Keep existing stored values valid, preserve API field names, map new UI options to existing values, and store “Other” values in existing text or string-array fields where possible.

## Design System and Reusable Components

Maintain the existing FINCAVA Tailwind design system. Create reusable form primitives rather than duplicating logic.

At minimum, consider:

- `FormField`
- `SelectField`
- `SearchableSelect`
- `MultiSelectField`
- `SelectWithOther`
- `MultiSelectWithOther`
- `ConditionalField`
- `FormSection`
- `HelperText`
- `FormSummary`
- `SubmissionIdentity`
- `EmptyState`
- `ProgressIndicator`

Use native controls when the option count is modest. Do not build a custom combobox unless it is fully keyboard-accessible.

Every field must have an associated label, stable ID, clear required or optional status, accessible error text, linked helper text where appropriate, keyboard support, and visible focus states. Do not rely on placeholders as the only instruction.

## Core “Other” Pattern

For standardized fields that need flexibility:

1. Include an `Other` option.
2. Selecting it reveals a precisely labeled text input.
3. The text input is required only while `Other` is selected.
4. Hiding it must clear or ignore stale invalid values.
5. Existing custom saved values must display correctly.
6. Multi-select fields may contain standard values plus one custom value.
7. Trim whitespace and reject empty custom values.
8. Preserve user-entered spelling except for safe trimming.

Do not add new enum values casually. If an existing field is enum-backed, prefer a separate optional custom field when needed and update schema, API, persistence, admin display, and tests consistently.

## Progressive Disclosure

Show essential questions first and optional preferences later. Reveal conditional fields only when relevant. Preserve values when moving between steps.

Recommended structure:

- Quote request: one concise page with grouped sections.
- Sample request: one concise page with conditional courier details.
- Sourcing request: 3–4 steps.
- Verification request: 3 steps.
- Profile: grouped sections with optional advanced preferences.
- Authentication: retain the existing two-step email-code flow.

Do not create unnecessary steps for short forms.

## Centralized Domain Options

Create a centralized option and display-label module, such as `client/src/lib/domainOptions.ts`. Place shared validation constants under `shared/src/` only when the server must validate the same values.

Do not duplicate option arrays across pages.

## Recommended Option Sets

Inspect existing schemas and seed data first. Reuse supported values and treat these as display and UX guidance, not proof of availability.

### Buyer type display labels

- Specialty roaster
- Micro roaster
- Importer
- Broker
- Distributor
- Green-coffee trader
- Private-label buyer
- Competition buyer
- Coffee laboratory
- Retail or hospitality group
- Other

Map existing enum values to polished labels instead of replacing stored values.

### Intended use

- House blend
- Single-origin offering
- Espresso blend
- Competition coffee
- Private label
- Resale or distribution
- Research or evaluation
- Other or open to recommendations

### Coffee varieties

Use searchable multi-select with Other:

- Bourbon
- Typica
- Caturra
- Castillo
- Colombia
- Tabi
- Pink Bourbon
- Geisha
- Pacamara
- Maragogipe
- Catuaí
- Catimor
- SL28
- SL34
- Mixed varieties
- Other

### Processing methods

- Washed
- Natural
- Honey
- Anaerobic
- Carbonic maceration
- Extended fermentation
- Double fermentation
- Yeast-inoculated fermentation
- Thermal shock
- Experimental process
- Other

If Experimental or Other is selected, allow an optional explanation.

### Flavor goals

Use multi-select with Other:

- Chocolate
- Caramel
- Nutty
- Citrus
- Stone fruit
- Red fruit
- Berry
- Tropical fruit
- Floral
- Tea-like
- Wine-like
- Spice
- Sweet
- Balanced
- Clean
- Other

Treat these as buyer goals, not promised outcomes.

### Certifications

- USDA Organic
- EU Organic
- Fairtrade
- Rainforest Alliance
- Bird Friendly
- 4C
- JAS Organic
- Regenerative certification
- No certification required
- Other

Do not treat producer characteristics such as women-owned or small producer as certifications.

### Colombian regions

- Santander
- Boyacá
- Huila
- Nariño
- Cauca
- Tolima
- Antioquia
- Caldas
- Risaralda
- Quindío
- Valle del Cauca
- Sierra Nevada
- Other Colombian region
- Open to recommendations

Do not build a municipality database unless supported by current data.

### Cup score

Provide shortcuts while preserving exact numeric entry:

- No minimum
- 82+
- 83+
- 84+
- 85+
- 86+
- 87+
- 88+
- 89+
- 90+
- Custom

Custom reveals the existing numeric input and validation.

### Requested volume

Keep exact numeric storage. Add quick selections that populate the numeric field:

- 250 kg
- 500 kg
- 1,000 kg (1 metric ton)
- 2,000 kg (2 metric tons)
- 5,000 kg (5 metric tons)
- 10,000 kg (10 metric tons)
- 20,000 kg (20 metric tons)
- Custom

### Volume flexibility

Use existing values with polished labels:

- Exact volume required
- Approximate volume
- Flexible within a reasonable range
- Open to recommendations

### Delivery timing

- As soon as possible
- Within 30 days
- Within 1–3 months
- Next harvest
- Flexible
- Specific date or date range

Only add a date-range field if the backend can store it safely.

### Incoterm

- EXW
- FCA
- FOB
- CFR
- CIF
- DAP
- DDP
- Not sure
- Other

Helper text: “Incoterms define where responsibility, cost, and risk transfer between seller and buyer. Select ‘Not sure’ if you would like FINCAVA to discuss suitable options.”

Do not imply every Incoterm is offered.

### Destination country

Use a complete country selector rather than a short hand-curated list. Prefer stable names or ISO codes consistent with current storage. Prefill from the buyer profile.

### Currency

The current budget-per-kilogram field is ambiguous without currency.

Implement the smallest safe solution:

- add a currency selector if persistence can be implemented end to end;
- suggested values: USD, EUR, GBP, CAD, AUD, JPY, Other;
- if avoiding migration, add explicit helper text requiring the user to state currency in notes;
- never assume USD silently.

### Courier

- FedEx
- UPS
- DHL
- USPS
- Local courier
- No courier account
- Other

Show the courier-account input only when applicable. If No courier account is selected, explain that FINCAVA will discuss available shipping arrangements.

### Evaluation timeline

- As soon as the sample arrives
- Within 1 week of arrival
- Within 2 weeks of arrival
- Within 30 days of arrival
- Flexible
- Other

### Verification subject

- Farm
- Producer
- Cooperative
- Exporter
- Dry mill
- Wet mill
- Warehouse
- Coffee lot
- Other

### Verification objectives

- Confirm identity and location
- Document farm or facility conditions
- Review producer-reported information
- Photograph operations or inventory
- Observe processing practices
- Collect or coordinate samples
- Review available records
- Support a purchasing decision
- Supplier due diligence
- Other

### Verification evidence requested

- Geotagged photographs
- General photographs
- Video
- Interview notes
- Farm or facility observations
- Processing observations
- Inventory observations
- Available document review
- Sample collection or coordination
- Written report
- Other

Do not promise evidence that FINCAVA cannot reasonably collect.

### Verification urgency

- Standard
- Time-sensitive
- Specific deadline
- Flexible

Urgency informs scoping and scheduling; it does not guarantee expedited completion.

## Route-by-Route Enhancements

### Home page

Review `client/src/pages/Home.tsx` and shared navigation/card components.

Make the main journeys easy to understand:

- Browse available lots
- Request a quote
- Request a sample
- Ask FINCAVA to source a coffee
- Request field verification

Recommended structure:

1. concise value proposition;
2. available-lot snapshot;
3. three-step “How FINCAVA works” explanation;
4. buyer use cases;
5. field-verification explanation;
6. available lots.

Do not overload the hero with every action.

### Available lots

Review `AvailableLots.tsx`, `LotCard.tsx`, and `StatusBadge.tsx`.

Add polished status labels, active-filter chips, clear-all action, useful result counts, and a no-result state offering both clear filters and sourcing request. Improve “View Lot” to “View lot passport.” Do not show raw enum strings.

### Lot passport

Review `LotPassport.tsx`, `GatedPassportSection.tsx`, and `LockedPassportSection.tsx`.

Organize information into:

- lot overview;
- sensory profile;
- origin and production;
- physical specifications;
- availability and commercial terms.

Explain missing data honestly. Clarify what registration unlocks. Keep quote and sample actions prominent. Do not imply pricing or inventory is final until confirmed.

### Authentication

Review `Login.tsx`.

Retain passwordless authentication. Explain that the same flow signs in existing buyers and registers new ones. Explain code expiration, display the destination email on the code step, and clarify what the account unlocks. Preserve anti-enumeration behavior.

### Buyer profile

Review `Profile.tsx`, shared buyer schemas, and APIs.

Reorganize into:

1. Contact and company
2. Buyer profile
3. Sourcing preferences
4. Delivery markets
5. Alerts and communications
6. Request history

Use polished labels and searchable multi-selects with Other for varieties, processes, origins, certifications, and destination countries. Explain how preferences are used. Distinguish lot-match alerts, competition-lot alerts, and general marketing. Improve save feedback and request-history empty states.

Only add persisted fields when operationally justified.

### Quote request

Review `RfqForm.tsx`, shared schemas, server validation, and admin display.

Recommended sections:

1. Lot being requested
2. Quantity and destination
3. Commercial preferences
4. Additional context
5. Review and submit

Add volume quick selections plus exact numeric entry, complete country selector, Incoterm dropdown with Not sure and Other, and delivery timing choices. Prefill profile country.

Confirmation must state that FINCAVA will review volume, destination, Incoterm, timing, lot availability, and commercial terms; respond within 2 business days; may ask follow-up questions; and that submission does not reserve inventory or create a binding quotation.

Do not add payment terms or packaging preferences unless current operations and schemas support them.

### Sample request

Review `SampleRequestForm.tsx`, schemas, and admin display.

Recommended sections:

1. Lot and sample availability
2. Shipping destination
3. Courier arrangements
4. Evaluation timing
5. Additional notes

Add courier dropdown with conditional account field and evaluation-timeline dropdown with Other. Explain that sample quantity and shipping method will be confirmed. Improve the unavailable-sample state.

Confirmation must explain that sample availability, destination, courier details, and timing will be reviewed; response is within 2 business days; missing information may be requested; and approval or shipment is not automatic.

Do not add buyer-selected sample quantity unless the current workflow supports it.

### Sourcing request

Review `SourcingRequestForm.tsx`, shared schemas, and admin display.

Implement a multi-step form:

#### Step 1 — Purchase need

- Intended use
- Requested volume
- Volume flexibility
- Destination country
- Target delivery window

#### Step 2 — Coffee preferences

- Variety
- Process
- Region
- Minimum cup score
- Altitude
- Certifications
- Flavor goals only if stored safely

#### Step 3 — Commercial context

- Maximum budget per kg
- Currency or explicit currency guidance
- Additional requirements
- One clear question asking which requirements are non-negotiable, unless per-field priorities can be persisted and used

#### Step 4 — Review

Provide a human-readable summary before submission.

Validate each step, preserve back-navigation state, support Open to recommendations, and hide irrelevant custom fields.

Confirmation must explain the 10-business-day review and matching process and that no match is guaranteed.

### Verification request

Review `Verification.tsx`, shared schemas, server validation, and admin display.

Implement a three-step flow:

#### Step 1 — Subject and location

- Verification subject
- Country
- Region
- Farm, producer, facility, or lot name
- Existing FINCAVA lot if supported

#### Step 2 — Objectives and evidence

- Verification objectives
- Evidence requested
- Important questions or claims to examine
- Known local contact or access information only if supported

#### Step 3 — Timing and contact

- Deadline or urgency
- Contact information
- Additional context
- Review summary

Confirmation must explain that five business days is the scoping-response period, not completion of fieldwork. FINCAVA will assess feasibility, geographic coverage, access, evidence, deliverables, schedule, and pricing; may request more information; may decline the request; and provides field verification rather than certification, an audit opinion, or a guarantee.

### Contact page

Review `Contact.tsx`.

Add clear routing guidance for listed-lot questions, sourcing help, field verification, partnerships, platform support, and general inquiries. Link to existing forms where possible. Keep email and WhatsApp details. Do not add a new database-backed contact form unless architecture and requirements support it.

### Empty, loading, and error states

Review `NotFound.tsx`, `ErrorBoundary.tsx`, and route-level states.

Each state should explain what happened and the best next action. Cover no lots, lot unavailable, sample unavailable, unauthenticated access, empty request history, failed save, failed submission, and unexpected application errors. Do not expose internal details.

### Admin

Review all files under `client/src/pages/admin/` and `AdminLayout.tsx`.

Use the same option catalog and polished display labels. Improve filters, destructive confirmations, helper text, status labels, public-visibility guidance, pricing-strategy guidance, sample availability, export readiness, matched and linked lots, internal notes, buyer deletion, outreach criteria, and custom-value display.

Clearly distinguish internal-only information from buyer-visible information.

## Data and Schema Strategy

Before editing, inspect:

- `shared/src/`
- `server/src/db/schema.ts`
- API route handlers
- client API types
- admin displays
- seed data
- migrations

Classify each enhancement as:

1. presentation-only;
2. mapped to an existing field;
3. requires an optional new field;
4. future recommendation only.

Prefer categories 1 and 2.

If category 3 is necessary, update the shared schema, database schema, migration, server persistence, API validation, client types, buyer UI, admin UI, exports where relevant, and tests.

Do not create migrations for speculative fields.

## Form State and Validation

Use a consistent strategy. Do not introduce a large form library unless justified.

Requirements:

- server validation remains authoritative;
- field errors appear adjacent to fields;
- server errors are summarized safely;
- step transitions validate only visible fields;
- hidden conditional fields do not submit stale values;
- profile defaults populate forms;
- repeated clicks cannot create duplicate submissions;
- honeypot protections remain intact;
- success states remain clear and stable.

## Accessibility

Ensure:

- keyboard-accessible controls;
- visible focus indicators;
- semantic headings;
- labels associated with controls;
- errors announced with `aria-live` or equivalent;
- progress indicators identify the current step;
- no color-only meaning;
- descriptive button labels;
- useful alt text;
- touch-friendly control sizing;
- expandable sections expose `aria-expanded`.

## Responsive Behavior

All forms must work at mobile, tablet, and desktop widths. On mobile, use one-column layouts, prevent horizontal scrolling, keep dropdowns within the viewport, and maintain comfortable spacing.

## Copy Standards

Use professional, buyer-centered microcopy. Explain why information helps when not obvious. Distinguish required from optional. Define coffee and trade terminology briefly. Never imply guaranteed availability or outcomes.

Use U.S. English and consistent terminology:

- green coffee
- specialty coffee
- quote request
- sample request
- sourcing request
- verification request
- lot passport
- cup score
- Incoterm
- business days
- sign in
- register

## Testing

Add or update tests for:

- Other reveals the custom input;
- deselecting Other clears or ignores stale custom values;
- conditional courier-account behavior;
- volume shortcuts populate exact numeric values;
- profile defaults populate forms;
- multi-step validation;
- back navigation preserves state;
- review summaries match inputs;
- raw enum values are not displayed;
- existing API payload expectations remain valid;
- new optional fields persist correctly if added;
- server rejects invalid combinations;
- confirmation messages show the correct response commitment.

Use the existing test framework.

## Implementation Order

### Phase 1 — Foundation

- inventory forms and user-facing enum displays;
- centralize options and label helpers;
- create reusable accessible fields;
- test SelectWithOther and MultiSelectWithOther.

### Phase 2 — High-value request forms

- quote request;
- sample request;
- sourcing request;
- verification request.

### Phase 3 — Profile and authentication

- sourcing profile;
- polished dropdowns and multi-selects;
- consent clarification;
- profile prefill;
- request-history empty states.

### Phase 4 — Discovery and passport

- catalog filters;
- cards;
- passport sections;
- locked and gated states;
- missing and no-result states.

### Phase 5 — Contact, shared states, and admin

- contact routing;
- error, loading, and empty states;
- admin labels, helper text, and controls.

### Phase 6 — Validation and cleanup

- run all checks;
- inspect the diff;
- document deferred items.

Do not stop after creating primitives. Complete the end-to-end migrations.

## Validation Commands

Inspect the repository scripts and run the actual equivalents of:

```bash
npm run format
npm run lint
npm run build
```

Run all relevant tests. Inspect the complete git diff. Confirm no accidental dependency, route, authentication, schema, or business-logic regressions. Search for raw enums, duplicated option arrays, unlabeled controls, stale confirmation copy, and hidden conditional values.

## Acceptance Criteria

The work is complete only when:

1. Standardized fields no longer require unnecessary free text.
2. Relevant dropdowns and multi-selects have a working Other flow.
3. Custom values remain available to buyers and administrators.
4. Buyer profile information prefills relevant forms.
5. Sourcing and verification use progressive disclosure.
6. Quote and sample forms remain concise.
7. Confirmation screens accurately explain what happens next.
8. Raw enums are not exposed to buyers.
9. Existing workflows continue to function.
10. Accessibility and mobile usability are preserved.
11. Formatter, lint, build, and tests pass.
12. The diff contains no unrelated refactors.

## Required Final Report

Provide:

### Summary

Describe the journeys improved and the design rationale.

### Files changed

Group by shared form infrastructure, option catalogs, quote, sample, sourcing, verification, profile/authentication, discovery/passport, shared states, admin, schemas/APIs/migrations, and tests.

### Field behavior matrix

For each enhanced field, report route, field, control type, standard options, Other behavior, stored value, validation, and profile-prefill behavior.

### Schema and migration decisions

List presentation-only changes, reused fields, added fields, migrations, and deferred fields. Explain why each persisted field was or was not added.

### Accessibility review

Summarize keyboard behavior, labels, errors, progress, and mobile behavior.

### Validation results

List exact commands and outcomes.

### Deferred recommendations

List valuable but intentionally excluded enhancements such as saved lots, compare lots, saved searches, reusable request templates, automated recommendations, structured shipping addresses, buyer-selected sample quantities, payment terms, and packaging preferences.

### Remaining uncertainties

Call out unresolved business policy, especially supported Incoterms, currencies, sample-size policy, shipping-payment policy, expedited verification policy, certifications, geographic coverage, whether flavor goals should persist, and whether annual purchasing volume is operationally useful.

Use TODO recommendations rather than inventing policy.

## Final Instruction

Act as both a senior B2B product designer and a senior full-stack TypeScript engineer. Make the platform easier, more structured, and more informative without overengineering it or inventing unsupported capabilities.
