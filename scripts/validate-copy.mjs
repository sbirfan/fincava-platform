#!/usr/bin/env node
// Lightweight, dependency-free copy-regression check. Not a test framework —
// this repo doesn't have one — just a set of grep-style assertions against
// the strings the editorial copy passes (and CLAUDE.md) established as
// settled: response-time commitments, the "not independent"/"verified"
// wording limits, the protected sourcing confirmation text, and a few
// structural checks (admin label maps exist, Terms/Privacy have no
// uncommitted diff). Run again after any future pass that touches
// confirmation copy or admin labels (e.g. the planned UX/form-enhancement
// work) to catch the same class of regression before it ships.
//
// Usage: node scripts/validate-copy.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;

function read(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf8');
}

function check(label, condition) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    console.error(`  FAIL ${label}`);
    failures++;
  }
}

function section(title) {
  console.log(`\n${title}`);
}

// Collapses whitespace/newlines to a single space. JSX text content wraps
// across source lines (Prettier's line-wrapping) but renders as one
// continuous string in the browser — checks against rendered copy should
// match on that basis, not on the raw source's line breaks.
function flat(str) {
  return str.replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
section('Response-time commitments present');
// ---------------------------------------------------------------------------

const rfqForm = read('client/src/pages/RfqForm.tsx');
const sampleForm = read('client/src/pages/SampleRequestForm.tsx');
const sourcingForm = read('client/src/pages/SourcingRequestForm.tsx');
const verificationPage = read('client/src/pages/Verification.tsx');
const rfqEmail = read('server/src/email/templates/rfq.ts');
const sampleEmail = read('server/src/email/templates/sampleRequest.ts');
const sourcingEmail = read('server/src/email/templates/sourcingRequest.ts');
const verificationEmail = read('server/src/email/templates/verification.ts');

const rfqFormFlat = flat(rfqForm);
const sampleFormFlat = flat(sampleForm);
const sourcingFormFlat = flat(sourcingForm);
const verificationPageFlat = flat(verificationPage);

check('RfqForm.tsx contains "2 business days"', rfqFormFlat.includes('2 business days'));
check('rfq.ts email contains "2 business days"', rfqEmail.includes("'2 business days'"));
check(
  'SampleRequestForm.tsx contains "2 business days"',
  sampleFormFlat.includes('2 business days'),
);
check(
  'sampleRequest.ts email contains "2 business days"',
  sampleEmail.includes("'2 business days'"),
);
check(
  'SourcingRequestForm.tsx contains "10 business days"',
  sourcingFormFlat.includes('10 business days'),
);
check(
  'sourcingRequest.ts email contains "10 business days"',
  sourcingEmail.includes('10 business days'),
);
check(
  'Verification.tsx contains "5 business days"',
  verificationPageFlat.includes('5 business days'),
);
check(
  'verification.ts email contains "5 business days"',
  verificationEmail.includes("'5 business days'"),
);

// ---------------------------------------------------------------------------
section('Quote/sample confirmations do not overpromise');
// ---------------------------------------------------------------------------

check(
  'RfqForm.tsx does not claim inventory is reserved',
  !/reserve[sd]?\s+inventory/i.test(rfqFormFlat) ||
    rfqFormFlat.includes('does not reserve inventory'),
);
check(
  'SampleRequestForm.tsx does not claim the sample is approved/shipped',
  !/sample has (been )?(approved|shipped)/i.test(sampleFormFlat) ||
    sampleFormFlat.includes('does not mean a sample has been approved or shipped'),
);

// ---------------------------------------------------------------------------
section('Verification: scoping vs. completion, no categorical independence claim');
// ---------------------------------------------------------------------------

check(
  'Verification.tsx distinguishes scoping/response from fieldwork completion',
  verificationPageFlat.includes('not completion of the'),
);
check(
  'verification.ts email distinguishes scoping/response from fieldwork completion',
  /not completion of the\s+fieldwork or report itself/i.test(verificationEmail),
);
check(
  'Verification.tsx does not claim FINCAVA is an independent third party',
  !/independent third party/i.test(verificationPageFlat),
);
check(
  'verification.ts email does not claim FINCAVA is an independent third party',
  !/independent third party/i.test(verificationEmail),
);
check(
  'Verification.tsx states the service limitation (not certification/audit/opinion/guarantee)',
  /not a certification/i.test(verificationPageFlat) && /guarantee/i.test(verificationPageFlat),
);

// ---------------------------------------------------------------------------
section('Budget field states currency plainly (schema/route hardcode USD)');
// ---------------------------------------------------------------------------

const schema = read('server/src/db/schema.ts');
const sourcingRoute = read('server/src/routes/sourcingRequests.ts');
check(
  "schema.ts budgetCurrency column defaults to 'USD'",
  /budgetCurrency.*default\('USD'\)/.test(flat(schema)),
);
check(
  "sourcingRequests.ts route hardcodes budgetCurrency: 'USD'",
  /budgetCurrency:\s*'USD'/.test(sourcingRoute),
);
check(
  'SourcingRequestForm.tsx budget label states USD',
  /Max budget per kg \(USD\)/.test(sourcingFormFlat),
);

// ---------------------------------------------------------------------------
section('Prohibited broad "verified" / "no intermediaries" phrasing absent');
// ---------------------------------------------------------------------------

const home = read('client/src/pages/Home.tsx');
const about = read('client/src/pages/About.tsx');
const login = read('client/src/pages/Login.tsx');

const prohibitedPhrases = [
  'verified lots',
  'verified farms',
  'verified cooperatives',
  'no intermediaries',
];
for (const file of [
  ['Home.tsx', flat(home)],
  ['About.tsx', flat(about)],
]) {
  const [name, content] = file;
  for (const phrase of prohibitedPhrases) {
    check(`${name} does not contain "${phrase}"`, !content.toLowerCase().includes(phrase));
  }
}
check(
  'Login.tsx\'s one "verified" use refers to the OTP code, not coffee/farms',
  /code is verified/i.test(flat(login)),
);

// ---------------------------------------------------------------------------
section('Protected sourcing confirmation text is byte-identical');
// ---------------------------------------------------------------------------

const EXPECTED_SOURCING_TEXT =
  'Thank you for your sourcing request. Our team will review our network of Colombian cooperatives and farms to identify suitable options. You can expect a response within 10 business days with available matches. If we are unable to meet your requirements at this time, we will let you know promptly.';

const sourcingTextMatch = sourcingEmail.match(/SOURCING_NOT_A_GUARANTEE_TEXT =\s*\n?\s*'([^']+)'/);
check(
  'SOURCING_NOT_A_GUARANTEE_TEXT constant matches the expected protected string',
  !!sourcingTextMatch && sourcingTextMatch[1] === EXPECTED_SOURCING_TEXT,
);

check(
  "SourcingRequestForm.tsx's client-side confirmation text matches the same protected wording",
  sourcingFormFlat.includes(flat(EXPECTED_SOURCING_TEXT)),
);

// ---------------------------------------------------------------------------
section('Admin label maps exist and are wired in (no raw enum display)');
// ---------------------------------------------------------------------------

let adminLabels = '';
try {
  adminLabels = read('client/src/lib/adminLabels.ts');
} catch {
  // handled by the check below
}
check('client/src/lib/adminLabels.ts exists', adminLabels.length > 0);
for (const name of [
  'PRICING_STRATEGY_LABELS',
  'COMMODITY_TYPE_LABELS',
  'INVENTORY_TYPE_LABELS',
  'BUYER_TYPE_LABELS',
  'INTENDED_USE_LABELS',
  'REQUEST_STATUS_LABELS',
]) {
  check(`adminLabels.ts exports ${name}`, adminLabels.includes(`export const ${name}`));
}

const statusBadge = read('client/src/components/StatusBadge.tsx');
check(
  'StatusBadge.tsx exports LOT_STATUS_LABELS',
  statusBadge.includes('export const LOT_STATUS_LABELS'),
);

const adminLots = read('client/src/pages/admin/AdminLots.tsx');
const adminLotForm = read('client/src/pages/admin/AdminLotForm.tsx');
const adminRequests = read('client/src/pages/admin/AdminRequests.tsx');
const adminDashboard = read('client/src/pages/admin/AdminDashboard.tsx');
const adminBuyerDetail = read('client/src/pages/admin/AdminBuyerDetail.tsx');

check(
  'AdminLots.tsx uses LOT_STATUS_LABELS (not raw lot.status)',
  adminLots.includes('LOT_STATUS_LABELS'),
);
check(
  'AdminLots.tsx uses PRICING_STRATEGY_LABELS (not raw lot.pricingStrategy)',
  adminLots.includes('PRICING_STRATEGY_LABELS'),
);
check(
  'AdminLotForm.tsx uses formatted labels for status/pricing selects',
  adminLotForm.includes('LOT_STATUS_LABELS') && adminLotForm.includes('PRICING_STRATEGY_LABELS'),
);
check(
  'AdminRequests.tsx uses REQUEST_STATUS_LABELS (not raw status)',
  adminRequests.includes('REQUEST_STATUS_LABELS'),
);
check(
  'AdminDashboard.tsx uses LOT_STATUS_LABELS for lots-by-status',
  adminDashboard.includes('LOT_STATUS_LABELS'),
);
check(
  'AdminBuyerDetail.tsx uses BUYER_TYPE_LABELS/REQUEST_STATUS_LABELS',
  adminBuyerDetail.includes('BUYER_TYPE_LABELS') &&
    adminBuyerDetail.includes('REQUEST_STATUS_LABELS'),
);

// ---------------------------------------------------------------------------
section('Generic admin error fallbacks replaced');
// ---------------------------------------------------------------------------

const genericPatterns = [
  "'Failed to load'",
  "'Save failed'",
  "'Delete failed'",
  "'Update failed'",
  "'Search failed'",
];
const adminDir = 'client/src/pages/admin';
const adminFiles = [
  'AdminAlertOutreach.tsx',
  'AdminBuyerDetail.tsx',
  'AdminBuyers.tsx',
  'AdminDashboard.tsx',
  'AdminLotForm.tsx',
  'AdminLots.tsx',
  'AdminMarketIntelligence.tsx',
  'AdminRequests.tsx',
];
for (const f of adminFiles) {
  const content = read(`${adminDir}/${f}`);
  for (const pattern of genericPatterns) {
    check(`${f} does not contain generic fallback ${pattern}`, !content.includes(pattern));
  }
}

// ---------------------------------------------------------------------------
section('Legal pages and protected contact/response-time facts untouched');
// ---------------------------------------------------------------------------

function gitDiffIsEmpty(relPath) {
  try {
    execFileSync('git', ['diff', '--quiet', '--', relPath], { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

check('Terms.tsx has no uncommitted diff', gitDiffIsEmpty('client/src/pages/Terms.tsx'));
check('Privacy.tsx has no uncommitted diff', gitDiffIsEmpty('client/src/pages/Privacy.tsx'));

const contact = read('client/src/pages/Contact.tsx');
check(
  "Contact.tsx still defines CONTACT_EMAIL = 'info@fincava.com'",
  contact.includes("CONTACT_EMAIL = 'info@fincava.com'"),
);
check(
  "Contact.tsx still defines WHATSAPP_NUMBER = '512-360-0118'",
  contact.includes("WHATSAPP_NUMBER = '512-360-0118'"),
);

// ---------------------------------------------------------------------------
console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failing check(s).`);
process.exit(failures === 0 ? 0 : 1);
