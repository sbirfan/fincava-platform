import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';
import { renderDetailRows } from './rows.js';

// Approved "not a guarantee" framing for sourcing (§5/§8). Do not paraphrase
// or shorten it — reused verbatim in the buyer confirmation email.
export const SOURCING_NOT_A_GUARANTEE_TEXT =
  'Thank you for your sourcing request. Our team will review our network of Colombian cooperatives and farms to identify suitable options. You can expect a response within 10 business days with available matches. If we are unable to meet your requirements at this time, we will let you know promptly.';

interface SourcingRequestBuyerConfirmationInput {
  buyerEmail: string;
}

export function sourcingRequestBuyerConfirmationEmail(
  input: SourcingRequestBuyerConfirmationInput,
): EmailMessage {
  const text = `${SOURCING_NOT_A_GUARANTEE_TEXT}\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>${SOURCING_NOT_A_GUARANTEE_TEXT}</p>
    <p>— FINCAVA</p>
  `);
  return {
    to: input.buyerEmail,
    subject: 'We received your sourcing request',
    html,
    text,
  };
}

interface SourcingRequestFounderNotificationInput {
  founderEmail: string;
  requestId: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  intendedUse: string;
  requestedVolumeKg: number;
  destinationCountry: string;
  maxBudgetPerKg: number | null;
  budgetCurrency: string;
}

export function sourcingRequestFounderNotificationEmail(
  input: SourcingRequestFounderNotificationInput,
): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Buyer', input.buyerName ?? '—'],
    ['Company', input.buyerCompany ?? '—'],
    ['Email', input.buyerEmail],
    ['Intended use', input.intendedUse],
    ['Volume', `${input.requestedVolumeKg} kg`],
    ['Destination', input.destinationCountry],
    [
      'Max budget/kg (confidential — do not share with producers)',
      input.maxBudgetPerKg !== null
        ? `${input.budgetCurrency} ${input.maxBudgetPerKg}`
        : 'Not specified',
    ],
  ];
  const { html: rowsHtml, text: rowsText } = renderDetailRows(rows);

  const text = `New sourcing request\n\n${rowsText}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests.)`;
  const html = renderEmailLayout(`
    <p><strong>New sourcing request</strong></p>
    ${rowsHtml}
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests.</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New sourcing request — ${input.buyerCompany ?? input.buyerEmail}`,
    html,
    text,
  };
}
