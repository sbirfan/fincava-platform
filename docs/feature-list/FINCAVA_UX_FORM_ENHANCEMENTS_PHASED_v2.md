# FINCAVA UX / Form Enhancements — Phased Execution

Six sequential prompts. Paste Phase A first. Do not paste the next phase's prompt until Claude
Code has reported back on the current one and you've reviewed it — same discipline as every other
phase in this project. Phase A carries the shared standards (design system, "Other" pattern,
option catalogs, accessibility, testing, validation commands); Phases B–F reference back to it
rather than repeating it, since they run in the same ongoing session.

Each phase ends with an explicit stop instruction. If Claude Code continues past it unprompted,
that's a signal to note and correct, not something to let ride.

---

## PHASE A — Foundation

Before anything else: read `CLAUDE.md` at the repository root. It contains settled facts and
decisions (contact values, response-time commitments, verification framing, women-led-farm
partnership framing, currency status if already resolved) that this task must not silently
contradict or re-derive.

**Preflight check — do this before writing any code:** run `git status` and `git diff`. A
separate copy-review task may have already run against this working tree and left uncommitted
changes. If so:
- Read the diff to understand what copy was already improved.
- Do not build this phase's work by discarding or reverting those changes back to older/generic
  copy — when you restructure a form or component, carry forward the improved copy that's already
  there rather than regenerating it from scratch.
- Report what you found in this preflight check as part of Phase A's final report, including
  whether you'd recommend committing that pending diff before continuing (you are not authorized
  to commit it yourself unless asked — just flag it).

You are working in the `sbirfan/fincava-platform` repository on the `main` branch. Implement
directly in the local checkout. Do not push, open a pull request, deploy, or modify Git history,
for this phase or any phase below, unless explicitly told otherwise.

### Mission (applies to all six phases)

Improve the FINCAVA platform's end-to-end user experience by redesigning user flows and input
forms around these principles:

1. Reduce unnecessary typing.
2. Prefer curated, domain-appropriate choices.
3. Preserve flexibility through an "Other" option that reveals a text input.
4. Use progressive disclosure so users see only relevant questions.
5. Reuse saved buyer information to avoid repetitive data entry.
6. Improve data quality without making forms feel longer or more bureaucratic.
7. Preserve existing business logic, security, privacy, and operational constraints.
8. Keep the experience professional, credible, and appropriate for specialty-coffee buyers.

### Critical Constraints (applies to all six phases)

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
- imply that field verification is certification, auditing, legal due diligence, a guarantee, or
  independent (per CLAUDE.md, FINCAVA discloses commercial interest when applicable — do not use
  "independent" to describe the verification service);
- change the existing response commitments of 2, 5, or 10 business days;
- add dependencies unless clearly necessary and justified;
- modify legal terms substantively;
- add migrations unless a persisted data enhancement genuinely requires one;
- alter the women-led-farm partnership framing (mutual commercial partnership, not a
  rescue/assistance narrative — see CLAUDE.md).

Prefer backward-compatible implementation. Keep existing stored values valid, preserve API field
names, map new UI options to existing values, and store "Other" values in existing text or
string-array fields where possible.

**Schema/migration rule (applies to all six phases):** if any phase's work requires an actual
schema or migration change (category 3 below), that change gets its own commit, separate from
presentational/UI commits in the same phase. Do not run a migration against the live Neon database
without stopping and reporting first — same as every other schema change in this project's
history. Presentational work in the same phase can proceed and be committed separately while a
schema decision is reported and awaiting go-ahead.

### Design System and Reusable Components

Maintain the existing FINCAVA Tailwind design system. Create reusable form primitives rather than
duplicating logic.

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

Use native controls when the option count is modest. Do not build a custom combobox unless it is
fully keyboard-accessible.

Every field must have an associated label, stable ID, clear required or optional status,
accessible error text, linked helper text where appropriate, keyboard support, and visible focus
states. Do not rely on placeholders as the only instruction.

### Core "Other" Pattern

For standardized fields that need flexibility:

1. Include an `Other` option.
2. Selecting it reveals a precisely labeled text input.
3. The text input is required only while `Other` is selected.
4. Hiding it must clear or ignore stale invalid values.
5. Existing custom saved values must display correctly.
6. Multi-select fields may contain standard values plus one custom value.
7. Trim whitespace and reject empty custom values.
8. Preserve user-entered spelling except for safe trimming.

Do not add new enum values casually. If an existing field is enum-backed, prefer a separate
optional custom field when needed and update schema, API, persistence, admin display, and tests
consistently.

### Centralized Domain Options

Create a centralized option and display-label module, such as `client/src/lib/domainOptions.ts`.
Place shared validation constants under `shared/src/` only when the server must validate the same
values. Do not duplicate option arrays across pages.

### Recommended Option Sets

Inspect existing schemas and seed data first. Reuse supported values and treat these as display
and UX guidance, not proof of availability.

**Buyer type display labels:** Specialty roaster, Micro roaster, Importer, Broker, Distributor,
Green-coffee trader, Private-label buyer, Competition buyer, Coffee laboratory, Retail or
hospitality group, Other. Map existing enum values to polished labels instead of replacing stored
values.

**Intended use:** House blend, Single-origin offering, Espresso blend, Competition coffee, Private
label, Resale or distribution, Research or evaluation, Other or open to recommendations.

**Coffee varieties** (searchable multi-select with Other): Bourbon, Typica, Caturra, Castillo,
Colombia, Tabi, Pink Bourbon, Geisha, Pacamara, Maragogipe, Catuaí, Catimor, SL28, SL34, Mixed
varieties, Other.

**Processing methods:** Washed, Natural, Honey, Anaerobic, Carbonic maceration, Extended
fermentation, Double fermentation, Yeast-inoculated fermentation, Thermal shock, Experimental
process, Other. If Experimental or Other is selected, allow an optional explanation.

**Flavor goals** (multi-select with Other): Chocolate, Caramel, Nutty, Citrus, Stone fruit, Red
fruit, Berry, Tropical fruit, Floral, Tea-like, Wine-like, Spice, Sweet, Balanced, Clean, Other.
Treat these as buyer goals, not promised outcomes.

**Certifications:** USDA Organic, EU Organic, Fairtrade, Rainforest Alliance, Bird Friendly, 4C,
JAS Organic, Regenerative certification, No certification required, Other. Do not treat producer
characteristics such as women-owned or small producer as certifications.

**Colombian regions:** Santander, Boyacá, Huila, Nariño, Cauca, Tolima, Antioquia, Caldas,
Risaralda, Quindío, Valle del Cauca, Sierra Nevada, Other Colombian region, Open to
recommendations. Do not build a municipality database unless supported by current data.

**Cup score shortcuts** (preserving exact numeric entry): No minimum, 82+, 83+, 84+, 85+, 86+,
87+, 88+, 89+, 90+, Custom. Custom reveals the existing numeric input and validation.

**Requested volume** (keep exact numeric storage; add quick selections that populate it): 250 kg,
500 kg, 1,000 kg (1 metric ton), 2,000 kg (2 metric tons), 5,000 kg (5 metric tons), 10,000 kg (10
metric tons), 20,000 kg (20 metric tons), Custom.

**Volume flexibility** (existing values, polished labels): Exact volume required, Approximate
volume, Flexible within a reasonable range, Open to recommendations.

**Delivery timing:** As soon as possible, Within 30 days, Within 1–3 months, Next harvest,
Flexible, Specific date or date range. Only add a date-range field if the backend can store it
safely.

**Incoterm:** EXW, FCA, FOB, CFR, CIF, DAP, DDP, Not sure, Other. Helper text: "Incoterms define
where responsibility, cost, and risk transfer between seller and buyer. Select 'Not sure' if you
would like FINCAVA to discuss suitable options." Do not imply every Incoterm is offered.

**Destination country:** complete country selector, not a short hand-curated list. Prefer stable
names or ISO codes consistent with current storage. Prefill from the buyer profile.

**Currency — already settled, do not re-investigate.** A prior copy-review pass confirmed
`budgetCurrency` is implemented in the schema (`server/src/db/schema.ts`, `.notNull().default('USD')`)
and is hardcoded to `'USD'` in the sourcing-request route. The field is already labeled "Max budget
per kg (USD)" in the current copy. Treat this as a closed question: build the budget field's UI
(quick-amount shortcuts plus exact numeric entry, per the pattern used elsewhere in this doc)
against the existing USD-only implementation. Do not add a currency selector, do not treat this as
an open design decision, and do not reopen it as a "remaining uncertainty" in Phase F's report —
it was already resolved and reported once; re-flagging it as unresolved would be a regression in
the report, not new information.

**Courier:** FedEx, UPS, DHL, USPS, Local courier, No courier account, Other. Show the
courier-account input only when applicable. If No courier account is selected, explain that
FINCAVA will discuss available shipping arrangements.

**Evaluation timeline:** As soon as the sample arrives, Within 1 week of arrival, Within 2 weeks of
arrival, Within 30 days of arrival, Flexible, Other.

**Verification subject:** Farm, Producer, Cooperative, Exporter, Dry mill, Wet mill, Warehouse,
Coffee lot, Other.

**Verification objectives:** Confirm identity and location, Document farm or facility conditions,
Review producer-reported information, Photograph operations or inventory, Observe processing
practices, Collect or coordinate samples, Review available records, Support a purchasing decision,
Supplier due diligence, Other.

**Verification evidence requested:** Geotagged photographs, General photographs, Video, Interview
notes, Farm or facility observations, Processing observations, Inventory observations, Available
document review, Sample collection or coordination, Written report, Other. Do not promise evidence
that FINCAVA cannot reasonably collect.

**Verification urgency:** Standard, Time-sensitive, Specific deadline, Flexible. Urgency informs
scoping and scheduling; it does not guarantee expedited completion.

### Accessibility (applies to all six phases)

Ensure: keyboard-accessible controls; visible focus indicators; semantic headings; labels
associated with controls; errors announced with `aria-live` or equivalent; progress indicators
identify the current step; no color-only meaning; descriptive button labels; useful alt text;
touch-friendly control sizing; expandable sections expose `aria-expanded`.

### Responsive Behavior (applies to all six phases)

All forms must work at mobile, tablet, and desktop widths. On mobile, use one-column layouts,
prevent horizontal scrolling, keep dropdowns within the viewport, and maintain comfortable
spacing.

### Copy Standards (applies to all six phases)

Use professional, buyer-centered microcopy. Explain why information helps when not obvious.
Distinguish required from optional. Define coffee and trade terminology briefly. Never imply
guaranteed availability or outcomes. Use U.S. English and consistent terminology: green coffee,
specialty coffee, quote request, sample request, sourcing request, verification request, lot
passport, cup score, Incoterm, business days, sign in, register.

### Phase A tasks

- Complete the preflight check above.
- **Reconcile with what already exists** — several rounds of copy-review and small feature work
  have landed since this document was first written. Before building anything, inventory and
  account for all of the following so this phase extends them rather than duplicating or
  regressing them:
  - `client/src/lib/adminLabels.ts` already exists — a label-map module for pricing strategy,
    commodity/inventory type, buyer type, intended use, and request status, wired into the admin
    pages. Decide deliberately whether this phase's centralized options module (below) extends
    `adminLabels.ts`, sits alongside it as a separate buyer-facing module, or merges the two — and
    report which you chose and why, rather than silently creating a second, competing label system.
  - `scripts/validate-copy.mjs` already exists (see Phase F) — a dependency-free regression script
    covering response-time strings, prohibited wording, and protected constants. Know it's there
    from the start of this phase, not just at validation time.
  - `client/src/components/EmptyLotsState.tsx` already exists, handling the "genuinely zero lots"
    state on the catalog and Home page — distinct from the filter-to-empty state. Phase D must
    reuse this component, not rebuild catalog empty-states from scratch.
  - `client/src/lib/featureFlags.ts` exists, currently gating the (unpublished) Our Story page.
    `Layout.tsx` has a site-wide "Beta" badge next to the FINCAVA logo. Preserve both — don't
    remove the flag, don't publish Our Story as a side effect of touching nav/routing, and don't
    drop the Beta badge when restructuring the header/nav.
  - 18 admin error-fallback messages (`Failed to load` → specific, actionable messages) were
    already rewritten across 8 admin files. Phase E must not regress these back to generic text.
  - A known, already-identified bug: `Profile.tsx`'s "Buyer type" and "Preferred contact method"
    `<select>` options currently render raw enum casing (e.g. "SPECIALTY ROASTER" instead of
    "Specialty roaster"). This was deliberately deferred to this UX work — fix it as part of the
    buyer-type/contact-method option work below, and confirm in your report that it's specifically
    resolved, not just incidentally fixed by the broader pass.
  - **Confirm `CLAUDE.md`'s "Current status" section actually matches `git log` right now**, not
    just what this document assumes. Some work has landed through direct instructions to Claude
    Code outside of planning-chat sessions, so there's real risk of drift between what CLAUDE.md
    says and what's actually on `main`. If it's stale, correct it as its own isolated commit before
    proceeding, per CLAUDE.md's own standing rule for documentation corrections.
- Inventory forms and user-facing enum displays across the codebase.
- Centralize options and label helpers per the module structure above, informed by the
  reconciliation step.
- Create the reusable accessible field primitives listed above.
- Currency is already settled — see the Currency entry under Recommended Option Sets. Do not
  re-investigate it; just build against it.
- Test `SelectWithOther` and `MultiSelectWithOther` specifically — Other-reveals-input,
  deselecting-clears-stale-values, existing custom values still display, trimming/empty-rejection.
  No test framework exists (see Phase F) — do this via structured manual verification against a
  live dev server, documented clearly, not fabricated automated test output.

### Phase A validation

Run the repository's actual equivalents of `npm run format`, `npm run lint`, `npm run build`. No
test framework exists — see Phase F for the correct approach to verification instead. Run
`node scripts/validate-copy.mjs` if it's relevant to anything touched this phase. Inspect the diff.

### STOP HERE

Do not proceed to Phase B. Report: the preflight findings, the reconciliation decisions (adminLabels.ts,
EmptyLotsState.tsx, featureFlags.ts/Beta badge, the 18 admin errors, the buyer-type casing bug,
and the CLAUDE.md-vs-git-log check), the primitives built, manual verification results, validation
results, and the full diff summary. Wait for review before continuing.

---

## PHASE B — High-value request forms

References the shared standards, option sets, and constraints established in Phase A — do not
repeat them, build on them.

### Scope

Quote request (`RfqForm.tsx`), sample request (`SampleRequestForm.tsx`), sourcing request
(`SourcingRequestForm.tsx`), verification request (`Verification.tsx`) — plus their shared
schemas, server validation, and admin display.

**Quote request** — sections: lot being requested; quantity and destination; commercial
preferences; additional context; review and submit. Add volume quick selections plus exact numeric
entry, complete country selector, Incoterm dropdown with Not sure and Other, delivery timing
choices. Prefill profile country. Confirmation must state that FINCAVA will review volume,
destination, Incoterm, timing, lot availability, and commercial terms; respond within 2 business
days; may ask follow-up questions; and that submission does not reserve inventory or create a
binding quotation. Do not add payment terms or packaging preferences unless current operations and
schemas support them.

**Sample request** — sections: lot and sample availability; shipping destination; courier
arrangements; evaluation timing; additional notes. Add courier dropdown with conditional account
field and evaluation-timeline dropdown with Other. Explain that sample quantity and shipping method
will be confirmed. Improve the unavailable-sample state. Confirmation must explain that sample
availability, destination, courier details, and timing will be reviewed; response is within 2
business days; missing information may be requested; and approval or shipment is not automatic. Do
not add buyer-selected sample quantity unless the current workflow supports it.

**Sourcing request** — multi-step:
- Step 1, Purchase need: intended use, requested volume, volume flexibility, destination country,
  target delivery window.
- Step 2, Coffee preferences: variety, process, region, minimum cup score, altitude,
  certifications, flavor goals only if stored safely.
- Step 3, Commercial context: maximum budget per kg, currency (per Phase A's resolution),
  additional requirements, one clear question on which requirements are non-negotiable unless
  per-field priorities can be persisted and used.
- Step 4, Review: human-readable summary before submission.

Validate each step, preserve back-navigation state, support Open to recommendations, hide
irrelevant custom fields. Confirmation must explain the 10-business-day review/matching process and
that no match is guaranteed.

**Verification request** — three steps:
- Step 1, Subject and location: verification subject, country, region, farm/producer/facility/lot
  name, existing FINCAVA lot if supported.
- Step 2, Objectives and evidence: verification objectives, evidence requested, important
  questions or claims to examine, known local contact/access information only if supported.
- Step 3, Timing and contact: deadline or urgency, contact information, additional context, review
  summary.

Confirmation must explain that five business days is the scoping-response period, not completion
of fieldwork. FINCAVA will assess feasibility, geographic coverage, access, evidence, deliverables,
schedule, and pricing; may request more information; may decline the request; and provides field
verification rather than certification, an audit opinion, or a guarantee.

**The disclaimer wording itself is already finalized — reuse it, don't regenerate it.** Multiple
copy-review rounds landed on specific language in `Verification.tsx` and
`server/src/email/templates/verification.ts`: the service is fee-based; every report separates
what was directly observed, what the producer reported, records reviewed, and what couldn't be
confirmed; it's explicitly not certification, an accredited audit, a legal due-diligence opinion,
or a guarantee; and it states factually (not categorically) that FINCAVA has a commercial interest
in some verified coffee via its other revenue line — without ever using the word "independent" in
either direction (neither claiming it nor categorically denying it). When restructuring this form
into steps, carry that exact language forward into the new layout rather than writing new
disclaimer copy from scratch.

### Data and Schema Strategy

Before editing, inspect: `shared/src/`, `server/src/db/schema.ts`, API route handlers, client API
types, admin displays, seed data, migrations.

Classify each enhancement as: (1) presentation-only; (2) mapped to an existing field; (3) requires
an optional new field; (4) future recommendation only. Prefer categories 1 and 2. If category 3 is
necessary, update the shared schema, database schema, migration, server persistence, API
validation, client types, buyer UI, admin UI, exports where relevant, and tests — and per Phase A's
schema/migration rule, keep that change in its own commit and report before running any migration
against the live database. Do not create migrations for speculative fields.

### Form State and Validation

Server validation remains authoritative. Field errors appear adjacent to fields. Server errors are
summarized safely. Step transitions validate only visible fields. Hidden conditional fields do not
submit stale values. Profile defaults populate forms. Repeated clicks cannot create duplicate
submissions. Honeypot protections remain intact. Success states remain clear and stable.

### Phase B validation

Run format/lint/build/tests. Confirm confirmation messages show the correct response commitment
(2/2/10/5 business days respectively). Inspect the diff — schema/migration changes must be in a
separate commit from presentational changes, per Phase A's rule.

### STOP HERE

Do not proceed to Phase C. Report: field behavior for each enhanced field (route, control type,
standard options, Other behavior, stored value, validation, profile-prefill), schema/migration
decisions and their commit status, validation results, full diff summary. Wait for review before
continuing.

---

## PHASE C — Profile and authentication

References Phase A's shared standards.

### Scope

**Authentication** (`Login.tsx`) — retain passwordless authentication. Explain that the same flow
signs in existing buyers and registers new ones. Explain code expiration, display the destination
email on the code step, clarify what the account unlocks. Preserve anti-enumeration behavior.

**Buyer profile** (`Profile.tsx`, shared buyer schemas, APIs) — reorganize into: Contact and
company; Buyer profile; Sourcing preferences; Delivery markets; Alerts and communications; Request
history. Use polished labels and searchable multi-selects with Other for varieties, processes,
origins, certifications, and destination countries. Explain how preferences are used. Distinguish
lot-match alerts, competition-lot alerts, and general marketing. Improve save feedback and
request-history empty states. Only add persisted fields when operationally justified.

### Phase C validation

Run format/lint/build/tests. Inspect the diff.

### STOP HERE

Do not proceed to Phase D. Report per Phase A/B's evidence standard. Wait for review before
continuing.

---

## PHASE D — Discovery and passport

References Phase A's shared standards.

### Scope

**Home page** (`Home.tsx`, `Layout.tsx` for shared navigation/card components) — make the main
journeys easy to understand: Browse available lots, Request a quote, Request a sample, Ask FINCAVA
to source a coffee, Request field verification. Structure: concise value proposition;
available-lot snapshot; three-step "How FINCAVA works" explanation; buyer use cases;
field-verification explanation; available lots. Do not overload the hero with every action. The
"Available now" section already uses `EmptyLotsState.tsx` when zero lots are visible (built during
the empty-catalog work) — preserve that, don't replace it with a new empty treatment. Preserve the
Beta badge in `Layout.tsx`'s header when touching shared nav/layout components.

**Available lots** (`AvailableLots.tsx`, `LotCard.tsx`, `StatusBadge.tsx`) — polished status
labels, active-filter chips, clear-all action, useful result counts. There are two distinct empty
states here already, built and tested — keep them distinct, don't collapse them into one:
`EmptyLotsState.tsx` for zero lots existing at all (with its "No lots listed yet" copy and
Sourcing Request CTA), and a separate, simpler filter-to-empty message when lots exist but none
match the current filters. Improve "View Lot" to "View lot passport." No raw enum strings.

**Lot passport** (`LotPassport.tsx`, `GatedPassportSection.tsx`, `LockedPassportSection.tsx`) —
organize into: lot overview; sensory profile; origin and production; physical specifications;
availability and commercial terms. Explain missing data honestly. Clarify what registration
unlocks. Keep quote and sample actions prominent. Do not imply pricing or inventory is final until
confirmed.

### Phase D validation

Run format/lint/build/tests. Inspect the diff.

### STOP HERE

Do not proceed to Phase E. Report per the established evidence standard. Wait for review before
continuing.

---

## PHASE E — Contact, shared states, and admin

References Phase A's shared standards.

### Scope

**Contact page** (`Contact.tsx`) — add clear routing guidance for listed-lot questions, sourcing
help, field verification, partnerships, platform support, and general inquiries. Link to existing
forms where possible. Keep the existing email and WhatsApp values exactly as they are (finalized,
per CLAUDE.md) — only the surrounding descriptive/routing copy is in scope. Do not add a new
database-backed contact form unless architecture and requirements support it.

**Empty, loading, and error states** (`NotFound.tsx`, `ErrorBoundary.tsx`, route-level states) —
each state should explain what happened and the best next action. Cover lot unavailable, sample
unavailable, unauthenticated access, empty request history, failed save, failed submission,
unexpected application errors. (The "no lots at all" state is already handled by
`EmptyLotsState.tsx`, covered in Phase D — don't rebuild it here.) Do not expose internal details.

**Admin** (all files under `client/src/pages/admin/`, `AdminLayout.tsx`) — use the same option
catalog and polished display labels, reconciled with the existing `adminLabels.ts` per Phase A.
Improve filters, destructive confirmations, helper text, status labels, public-visibility guidance,
pricing-strategy guidance, sample availability, export readiness, matched and linked lots, internal
notes, buyer deletion, outreach criteria, custom-value display. **18 generic error fallbacks across
8 admin files were already rewritten to be specific and actionable** (e.g. "The lot could not be
deleted. It may be linked to existing requests.") during the copy-review pass — verify they're
still intact and don't revert or duplicate this work. Clearly distinguish internal-only information
from buyer-visible information.

### Phase E validation

Run format/lint/build/tests. Inspect the diff.

### STOP HERE

Do not proceed to Phase F. Report per the established evidence standard. Wait for review before
continuing.

---

## PHASE F — Validation and cleanup

References Phase A's shared standards.

### Tasks

- Run the full validation suite one more time across the entire changed surface:
  `npm run format`, `npm run lint`, `npm run build`.
- **No automated test framework exists in this repository** (confirmed during the copy-review
  work — no test script in any `package.json`, no vitest/jest/playwright/cypress dependency). Do
  not assume one exists or silently add a full framework for this task alone. Two things instead:
  - `scripts/validate-copy.mjs` already exists — a dependency-free Node script built during the
    copy-review pass that asserts response-time strings, prohibited wording, and protected
    constants are intact. Run it (`node scripts/validate-copy.mjs`) and extend its assertions to
    cover anything new from this work worth guarding (e.g., raw enum values not displayed, Other
    behavior on key fields) rather than building a separate, competing script.
  - For behavior that genuinely needs interaction testing (Other-reveals-input, conditional
    courier field, multi-step back-navigation), do structured manual verification the same way the
    copy-review follow-up did — a live dev server, real interactions, documented results — rather
    than fabricating automated test output that doesn't exist. Document exactly what you tested and
    how, per field: Other reveals the custom input; deselecting Other clears/ignores stale custom
    values; conditional courier-account behavior; volume shortcuts populate exact numeric values;
    profile defaults populate forms; multi-step validation; back navigation preserves state; review
    summaries match inputs; raw enum values are not displayed; existing API payload expectations
    remain valid; new optional fields persist correctly if added; server rejects invalid
    combinations; confirmation messages show the correct response commitment.
- Search for raw enums, duplicated option arrays, unlabeled controls, stale confirmation copy,
  hidden conditional values.
- Inspect the complete git diff across all five phases together. Confirm no accidental dependency,
  route, authentication, schema, or business-logic regressions, and confirm every schema/migration
  change is isolated in its own commit as required.
- Confirm every value CLAUDE.md marks as finalized (contact details, response-time commitments,
  legal clauses, verification/women-led-farm framing) is unchanged.

### Acceptance Criteria

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

### Required Final Report

- **Summary** — journeys improved, design rationale.
- **Files changed** — grouped by shared form infrastructure, option catalogs, quote, sample,
  sourcing, verification, profile/authentication, discovery/passport, shared states, admin,
  schemas/APIs/migrations, tests.
- **Field behavior matrix** — per enhanced field: route, control type, standard options, Other
  behavior, stored value, validation, profile-prefill behavior.
- **Schema and migration decisions** — presentation-only changes, reused fields, added fields,
  migrations, deferred fields, and why each was or wasn't added. Confirm commit isolation.
- **Accessibility review** — keyboard behavior, labels, errors, progress, mobile behavior.
- **Validation results** — exact commands and outcomes, across all six phases.
- **Deferred recommendations** — valuable but intentionally excluded enhancements (saved lots,
  compare lots, saved searches, reusable request templates, automated recommendations, structured
  shipping addresses, buyer-selected sample quantities, payment terms, packaging preferences).
- **Remaining uncertainties** — unresolved business policy (supported Incoterms, sample-size
  policy, shipping-payment policy, expedited verification policy, certifications, geographic
  coverage, whether flavor goals should persist, whether annual purchasing volume is operationally
  useful). Use TODO recommendations, not invented policy.

This task still does not commit, push, or deploy anything beyond what was explicitly reported and
approved phase by phase. Once you've reviewed the final diff yourself: commit with clear,
appropriately separated messages, push to `main`, then follow the manual-redeploy process and
post-redeploy smoke test documented in the README.

Act as both a senior B2B product designer and a senior full-stack TypeScript engineer throughout.
Make the platform easier, more structured, and more informative without overengineering it or
inventing unsupported capabilities.
