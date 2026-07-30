import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';
import { renderDetailRows } from './rows.js';

// "2 business days" per execution-spec §8's RFQ confirmation template.
const RESPONSE_TIME = '2 business days';

interface RfqBuyerConfirmationInput {
  buyerEmail: string;
  lotCode: string;
}

export function rfqBuyerConfirmationEmail(input: RfqBuyerConfirmationInput): EmailMessage {
  const lotCode = escapeHtml(input.lotCode);
  const body1 = `Thank you for requesting a quote for lot ${input.lotCode}. We'll review your requested volume, destination, preferred Incoterm, and delivery timing against this lot's current availability and commercial terms, and respond within ${RESPONSE_TIME}.`;
  const body2 =
    'Our response may include pricing and available volume, proposed terms, follow-up questions, or — if the lot can no longer meet your request — a direct explanation of why. Submitting this request does not reserve inventory or create a binding quotation.';
  const text = `${body1}\n\n${body2}\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>Thank you for requesting a quote for lot <strong>${lotCode}</strong>. We'll review your requested volume, destination, preferred Incoterm, and delivery timing against this lot's current availability and commercial terms, and respond within ${RESPONSE_TIME}.</p>
    <p>${body2}</p>
    <p>— FINCAVA</p>
  `);
  return {
    to: input.buyerEmail,
    subject: `We received your quote request — ${input.lotCode}`,
    html,
    text,
  };
}

interface RfqFounderNotificationInput {
  founderEmail: string;
  requestId: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  lotCode: string;
  requestedVolumeKg: number;
  destinationCountry: string;
}

export function rfqFounderNotificationEmail(input: RfqFounderNotificationInput): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Buyer', input.buyerName ?? '—'],
    ['Company', input.buyerCompany ?? '—'],
    ['Email', input.buyerEmail],
    ['Lot', input.lotCode],
    ['Volume', `${input.requestedVolumeKg} kg`],
    ['Destination', input.destinationCountry],
  ];
  const { html: rowsHtml, text: rowsText } = renderDetailRows(rows);

  const text = `New RFQ\n\n${rowsText}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests.)`;
  const html = renderEmailLayout(`
    <p><strong>New RFQ</strong></p>
    ${rowsHtml}
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests.</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New RFQ — ${input.lotCode}`,
    html,
    text,
  };
}
