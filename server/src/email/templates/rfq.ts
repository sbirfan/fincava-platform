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
  const text = `Thank you for requesting a quote for lot ${input.lotCode}. Our team is reviewing your request and will respond within ${RESPONSE_TIME}.\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>Thank you for requesting a quote for lot <strong>${lotCode}</strong>. Our team is reviewing your request and will respond within ${RESPONSE_TIME}.</p>
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

  const text = `New RFQ\n\n${rowsText}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests once the admin dashboard ships.)`;
  const html = renderEmailLayout(`
    <p><strong>New RFQ</strong></p>
    ${rowsHtml}
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests once the admin dashboard ships (Phase 4).</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New RFQ — ${input.lotCode}`,
    html,
    text,
  };
}
