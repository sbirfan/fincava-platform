import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';

interface VerificationRequesterConfirmationInput {
  requesterEmail: string;
  requesterName: string;
}

const RESPONSE_TIME = '5 business days';

export function verificationRequesterConfirmationEmail(
  input: VerificationRequesterConfirmationInput,
): EmailMessage {
  const name = escapeHtml(input.requesterName);
  const body1 = `We received your verification request. Within ${RESPONSE_TIME}, we'll review the location, farm, producer, or lot you named, confirm whether it's feasible and within our field coverage, and come back to you with a proposed scope, what we'd document, deliverables, timing, and pricing — or a clarifying question if we need more detail first.`;
  const body2 =
    'That window covers this initial scoping and response, not completion of the fieldwork or report itself. This is paid field verification and documentation, not a certification, accredited audit, legal opinion, or guarantee — FINCAVA also sources, procures, and resells green coffee as its other core business.';
  const text = `Hi ${input.requesterName},\n\n${body1}\n\n${body2}\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>Hi ${name},</p>
    <p>${body1}</p>
    <p>${body2}</p>
    <p>— FINCAVA</p>
  `);

  return {
    to: input.requesterEmail,
    subject: 'We received your verification request',
    html,
    text,
  };
}

interface VerificationFounderNotificationInput {
  founderEmail: string;
  requestId: string;
  requesterName: string;
  requesterEmail: string;
  requesterCompany: string;
  farmOrLotOfInterest: string | null;
  regionOfInterest: string | null;
}

export function verificationFounderNotificationEmail(
  input: VerificationFounderNotificationInput,
): EmailMessage {
  const rows: Array<[string, string]> = [
    ['Name', input.requesterName],
    ['Email', input.requesterEmail],
    ['Company', input.requesterCompany],
    ['Farm/lot of interest', input.farmOrLotOfInterest ?? '—'],
    ['Region of interest', input.regionOfInterest ?? '—'],
  ];

  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const text = `New verification request\n\n${textRows}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests.)`;

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b6459;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const html = renderEmailLayout(`
    <p><strong>New verification request</strong></p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${htmlRows}</table>
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests.</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New verification request — ${input.requesterCompany}`,
    html,
    text,
  };
}
