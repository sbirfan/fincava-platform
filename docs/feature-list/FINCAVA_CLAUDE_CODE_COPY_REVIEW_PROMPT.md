# Claude Code Task: Comprehensive FINCAVA Website Copy Review

You are working in the `sbirfan/fincava-platform` repository on the `main` branch.

## Objective

Perform a comprehensive editorial review of all user-facing text across the FINCAVA platform and update the copy in the codebase so it is:

- professional, clear, credible, and concise;
- useful to specialty-coffee buyers and FINCAVA administrators;
- accurate to the application's actual workflows;
- commercially sophisticated without sounding inflated or promotional;
- consistent in terminology, capitalization, punctuation, and tone;
- explicit about what happens after users submit requests;
- helpful in forms, confirmations, empty states, locked states, errors, and operational admin screens.

Implement the copy changes directly in the local working tree, but do not redesign the UI, change product behavior, alter database schemas, change API contracts, add new features, or modify business logic.

## Product and Audience Context

FINCAVA is a business-to-business green-coffee sourcing platform for professional buyers, including specialty importers, roasters, brokers, distributors, private-label buyers, and competition buyers.

The platform:

- lists curated Colombian green-coffee lots;
- provides lot passports with origin, processing, quality, availability, pricing, and export-readiness information;
- accepts quote, sample, sourcing, and fee-based field-verification requests;
- uses passwordless email-code authentication for buyers;
- allows buyers to maintain sourcing preferences and view request history;
- provides an internal admin workspace for lots, buyers, requests, market intelligence, and buyer-alert outreach.

FINCAVA has operations in Taylor, Texas, and San Gil, Santander, Colombia. Its positioning should emphasize traceability, direct relationships, practical buyer information, honest representation, and accountable communication.

## Voice and Editorial Standards

Use a voice that is:

- professional and knowledgeable;
- direct and calm;
- buyer-oriented;
- transparent about limitations and uncertainty;
- precise about coffee, sourcing, logistics, verification, and commercial workflows;
- confident without making unsupported claims.

Avoid:

- hype, clichés, vague superlatives, and exaggerated assurances;
- awkward fragments or overly casual wording;
- repeated use of “we’ll” where a more precise description is useful;
- claiming a lot, farm, producer, score, certification, price, or shipment is “verified” unless the code or documented process supports that claim;
- implying that field verification is certification, auditing, legal due diligence, or a guarantee;
- implying that submitting a form guarantees inventory, pricing, samples, shipment, or a transaction;
- implying that FINCAVA currently provides services described elsewhere as planned;
- changing legally significant language casually.

Use sentence case for headings and buttons unless a component’s established convention requires otherwise. Use “quote request” in buyer-facing prose rather than unexplained “RFQ,” except where the audience is clearly an experienced admin user or the acronym is defined. Use “sign in or register” rather than slash constructions where space allows.

## Required Review Scope

First inspect the repository rather than relying only on this list. Search for all rendered text, including strings in components, pages, shared label maps, status labels, API error fallbacks, validation messages, email templates, document titles, alt text, placeholders, and admin interfaces.

At minimum, review these known routes and components:

### Public and buyer-facing routes

- `client/src/pages/Home.tsx`
- `client/src/pages/AvailableLots.tsx`
- `client/src/pages/LotPassport.tsx`
- `client/src/pages/About.tsx`
- `client/src/pages/Contact.tsx`
- `client/src/pages/Verification.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Profile.tsx`
- `client/src/pages/RfqForm.tsx`
- `client/src/pages/SampleRequestForm.tsx`
- `client/src/pages/SourcingRequestForm.tsx`
- `client/src/pages/Privacy.tsx`
- `client/src/pages/Terms.tsx`
- `client/src/pages/NotFound.tsx`

### Shared public components

- `client/src/components/Layout.tsx`
- `client/src/components/LotCard.tsx`
- `client/src/components/StatusBadge.tsx`
- `client/src/components/GatedPassportSection.tsx`
- `client/src/components/LockedPassportSection.tsx`
- `client/src/components/ErrorBoundary.tsx`

### Admin routes and components

Review every file in:

- `client/src/pages/admin/`
- `client/src/components/AdminLayout.tsx`

Admin copy should favor operational clarity, explicit consequences, consistent status terminology, and unambiguous button labels. It does not need marketing language.

### Server and shared user-facing strings

Search all of:

- `server/src/`
- `shared/src/`

Review only strings that may be shown to users or included in transactional emails. Do not rewrite internal logs, developer comments, database identifiers, enum values, API field names, or machine-readable constants unless display labels are generated from them.

## Priority Improvements

### 1. Submission confirmations

Each confirmation must explain:

- that the request was received;
- what FINCAVA will review;
- what the stated response period means;
- what the user can expect in the response;
- that additional information may be requested;
- when applicable, that availability, approval, pricing, or fulfillment is not guaranteed.

Use these workflow-specific expectations:

#### Quote request — response within 2 business days

Explain that FINCAVA will review:

- requested volume;
- destination;
- preferred Incoterm;
- delivery timing;
- current lot availability and commercial terms.

The response may include pricing, available volume, proposed terms, clarification questions, or notice that the lot cannot currently meet the request.

Do not imply that submitting the request reserves inventory or creates a binding quotation.

#### Sample request — response within 2 business days

Explain that FINCAVA will review:

- sample availability;
- destination and shipping details;
- courier-account information, if supplied;
- evaluation timing.

The response should confirm availability and next steps, request missing shipping information, or explain that a sample cannot currently be provided.

Do not imply that a sample has already been approved or shipped.

#### Sourcing request — response within 10 business days

Explain that FINCAVA will:

- review intended use, volume, delivery window, quality, origin, processing, certification, and budget preferences;
- assess current and upcoming opportunities across its Colombian farm and cooperative network;
- identify suitable matches or reasonable alternatives;
- contact the buyer with available options, follow-up questions, or an honest no-match response.

Do not imply that a match is guaranteed.

#### Verification request — response within 5 business days

Explain that FINCAVA will:

- review the submitted location, farm, producer, lot, and verification objectives;
- determine whether the request is feasible and within FINCAVA’s field coverage;
- define a proposed scope, evidence to be collected, deliverables, timing, and pricing;
- identify required access, permissions, documents, contacts, or travel considerations;
- contact the requester with a proposal, clarification questions, or notice that the request cannot be accepted.

Make clear that this initial five-business-day period is for scoping and response, not completion of the fieldwork or report.

Reinforce that the service is independent field verification and documentation, not certification, an audit opinion, or a guarantee.

### 2. Forms

For every form:

- add concise introductory guidance where users need context;
- clarify required versus optional fields;
- improve labels and placeholders so users know the expected format;
- add helper text where a term may be unfamiliar or commercially ambiguous;
- make button labels describe the exact action;
- improve submission, error, and authentication-gate messages;
- avoid placeholders that are the only source of important instructions.

Do not add form fields or change validation requirements unless a copy-only accessibility improvement requires an `aria-label`, `aria-describedby`, or equivalent text association.

Specific terminology to clarify:

- Incoterm;
- requested volume;
- destination country;
- sample destination;
- courier account;
- evaluation timeline;
- minimum cup score;
- altitude preference;
- certifications required;
- budget per kilogram and its currency ambiguity.

Do not invent a currency for `maxBudgetPerKg`. If the data model does not specify currency, make the copy explicitly ask the user to include or clarify currency in notes, or note the limitation without changing the field type.

### 3. Lot catalog and passport

Improve:

- catalog introduction;
- filter labels and status display formatting;
- result counts;
- loading and no-result states;
- lot-card CTA and accessible image fallback text;
- missing-lot guidance;
- locked-passport explanation;
- technical specification labels;
- pricing and sample CTAs;
- the sourcing-request fallback.

Do not claim every lot is certified or independently verified. Distinguish documented traceability, producer-provided information, FINCAVA observations, and third-party certifications where relevant.

### 4. Home page

Strengthen the value proposition for professional buyers. Explain what users can evaluate before contacting FINCAVA and what happens after a quote, sample, or sourcing request.

Retain a concise hero. Avoid unsupported claims such as “no intermediaries” unless the underlying sourcing model universally proves it. Prefer precise wording such as “direct working relationships” or “known sourcing partners.”

Review the statistics labels so they are understandable and not misleading.

### 5. About and verification positioning

Preserve the core factual positioning but improve structure, readability, and commercial credibility.

Be especially careful with:

- ownership statements;
- women-led farm language;
- sourcing geographies;
- statements about direct relationships;
- claims of verification;
- planned import or logistics capabilities.

Do not add social-impact claims, certification claims, producer-benefit claims, or quantitative claims not supported in the repository.

### 6. Authentication and profile

Clarify:

- passwordless sign-in;
- code expiration;
- what happens for new versus returning users;
- what completing a profile unlocks;
- how sourcing preferences are used;
- alert and marketing consent distinctions;
- save confirmations and errors;
- request-history headings, statuses, and empty states.

Do not imply that account registration itself qualifies, approves, or verifies a buyer unless the system actually performs that process.

### 7. Contact, navigation, footer, and errors

Improve:

- contact-page introduction and channel descriptions;
- navigation labels where needed;
- footer descriptor;
- 404 message;
- unexpected-error message;
- loading states;
- generic API error fallbacks.

Where practical, tell users what they can do next.

### 8. Admin interface

Review all admin-facing text for:

- consistent request-type and status names;
- clear destructive-action warnings;
- explicit save, delete, publish, hide, export, match, link, and status-change labels;
- helpful empty states;
- concise helper text for pricing strategy, public visibility, lot status, images, buyer deletion, matched lots, linked lots, internal notes, market intelligence, and outreach filters;
- clear CSV export wording;
- distinction between internal notes and buyer-visible communication.

Do not expose confidential buyer budgets or internal notes through public-facing copy.

### 9. Legal pages

Do not substantively rewrite the Privacy Policy or Terms of Service as ordinary marketing copy.

You may:

- correct obvious grammar, punctuation, capitalization, terminology, and formatting inconsistencies;
- improve headings for clarity without changing legal effect;
- flag factual inconsistencies between the legal pages and the actual application.

You must not:

- add new legal promises;
- remove disclaimers;
- alter liability, governing-law, privacy-rights, retention, consent, or contract provisions without clearly flagging the change for legal review.

If a legal statement appears inaccurate relative to the codebase, preserve it in the implementation unless the correction is unquestionably factual and non-substantive. Report it separately under “Legal review recommended.”

## Implementation Constraints

- Make copy-only changes wherever possible.
- Preserve route paths, API calls, field names, enum values, state transitions, and data flow.
- Preserve the current design system and layout.
- Do not add dependencies.
- Do not change database migrations or schemas.
- Do not change response-time commitments: 2, 5, and 10 business days.
- Do not change current operational facts merely to make copy sound stronger.
- Do not add claims about inventory, export readiness, logistics, certifications, producer economics, quality assurance, delivery, or legal compliance unless directly supported by existing data and documentation.
- Keep HTML entities and JSX escaping valid.
- Keep text accessible and avoid using punctuation alone to convey meaning.
- Maintain consistent U.S. English.
- Do not modify Git history, push, open a pull request, or deploy.
- Work only in the local checkout.

## Editorial Consistency Decisions

Apply these consistently unless context clearly requires another treatment:

- FINCAVA
- green coffee
- specialty coffee
- lot passport
- quote request
- sample request
- sourcing request
- verification request
- business days
- cup score
- Incoterm
- sign in
- sign out
- register
- Colombia / Colombian
- United States / U.S. according to sentence context
- Taylor, Texas
- San Gil, Santander, Colombia

Use typographic dashes and ellipses consistently with the existing codebase, but do not sacrifice readability or JSX validity.

Convert raw enum-style labels such as `SAMPLE_AVAILABLE` into polished display labels such as “Sample available” wherever they are user-facing. Do not change enum values.

## Validation

After editing:

1. Run the repository formatter.
2. Run lint.
3. Run the full build.
4. Run relevant tests if present.
5. Search again for stale variants, raw enum labels, inconsistent capitalization, generic error text, slash constructions, and outdated confirmation messages.
6. Inspect the git diff to confirm that changes are limited to copy, accessibility text, and minimal presentational wiring required to associate helper text with controls.
7. Confirm no dependency, schema, migration, route, API-contract, or business-logic changes were introduced.

Use the repository’s documented commands, expected to include:

```bash
npm run format
npm run lint
npm run build
```

## Required Final Report

At completion, provide:

### Summary

A concise explanation of the editorial approach and the major user journeys improved.

### Files changed

Group the files by:

- public marketing and catalog;
- lot and request workflows;
- authentication and profile;
- shared states and navigation;
- admin;
- legal copy corrections.

### Material copy decisions

Explain any important terminology or promise changes, especially:

- “verified” versus documented/observed information;
- quote, sample, sourcing, and verification response expectations;
- what is and is not guaranteed;
- currency ambiguity;
- field verification versus certification.

### Legal review recommended

List any legal-page or consent-language issues that should be reviewed by counsel. Do not silently resolve substantive legal questions.

### Validation results

Report the exact formatter, lint, build, and test commands run and their outcomes.

### Remaining uncertainties

List any copy that could not be finalized because the repository does not establish the underlying operational fact. Use clearly marked TODO recommendations rather than inventing facts.

## Working Method

1. Read `README.md`, relevant files under `docs/`, `client/src/App.tsx`, and the public/admin route components.
2. Build an inventory of user-facing strings.
3. Infer workflows only from code and repository documentation.
4. Edit systematically by journey rather than changing isolated sentences.
5. Keep confirmations and helper text informative without becoming verbose.
6. Validate all changes.
7. Return the final report only after reviewing the complete diff.
