import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';
import { renderDetailRows } from './rows.js';

// "2 business days" per execution-spec §8's sample request confirmation template.
const RESPONSE_TIME = '2 business days';

interface SampleRequestBuyerConfirmationInput {
  buyerEmail: string;
  lotCode: string;
}

export function sampleRequestBuyerConfirmationEmail(
  input: SampleRequestBuyerConfirmationInput,
): EmailMessage {
  const lotCode = escapeHtml(input.lotCode);
  const body1 = `Thank you for your sample request for lot ${input.lotCode}. We'll review sample availability, your shipping details, and evaluation timing, and respond within ${RESPONSE_TIME}.`;
  const body2 =
    "Our response will confirm availability and next steps, ask for any missing shipping information, or explain that a sample can't currently be provided. Submitting this request does not mean a sample has been approved or shipped yet.";
  const text = `${body1}\n\n${body2}\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>Thank you for your sample request for lot <strong>${lotCode}</strong>. We'll review sample availability, your shipping details, and evaluation timing, and respond within ${RESPONSE_TIME}.</p>
    <p>${body2}</p>
    <p>— FINCAVA</p>
  `);
  return {
    to: input.buyerEmail,
    subject: `We received your sample request — ${input.lotCode}`,
    html,
    text,
  };
}

interface SampleRequestFounderNotificationInput {
  founderEmail: string;
  requestId: string;
  buyerName: string | null;
  buyerCompany: string | null;
  buyerEmail: string;
  lotCode: string;
  sampleDestination: string;
}

export function sampleRequestFounderNotificationEmail(
  input: SampleRequestFounderNotificationInput,
): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Buyer', input.buyerName ?? '—'],
    ['Company', input.buyerCompany ?? '—'],
    ['Email', input.buyerEmail],
    ['Lot', input.lotCode],
    ['Sample destination', input.sampleDestination],
  ];
  const { html: rowsHtml, text: rowsText } = renderDetailRows(rows);

  const text = `New sample request\n\n${rowsText}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests.)`;
  const html = renderEmailLayout(`
    <p><strong>New sample request</strong></p>
    ${rowsHtml}
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests.</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New sample request — ${input.lotCode}`,
    html,
    text,
  };
}
