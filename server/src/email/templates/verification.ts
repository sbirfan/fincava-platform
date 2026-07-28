import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';

interface VerificationRequesterConfirmationInput {
  requesterEmail: string;
  requesterName: string;
}

// "5 business days" is the addendum's placeholder figure pending Irfan's
// sign-off on scope/pricing turnaround — do not change this number without
// his confirmation, and never leave a literal "[X]" in its place.
const RESPONSE_TIME = '5 business days';

export function verificationRequesterConfirmationEmail(
  input: VerificationRequesterConfirmationInput,
): EmailMessage {
  const name = escapeHtml(input.requesterName);
  const text = `Hi ${input.requesterName},\n\nWe received your farm verification request. We'll respond within ${RESPONSE_TIME} to discuss scope, timing, and pricing.\n\n— FINCAVA`;
  const html = renderEmailLayout(`
    <p>Hi ${name},</p>
    <p>We received your verification request. We'll respond within <strong>${RESPONSE_TIME}</strong> to discuss scope, timing, and pricing.</p>
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
  const text = `New verification request\n\n${textRows}\n\nRecord ID: ${input.requestId}\n(View in Admin → Requests once the admin dashboard ships.)`;

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b6459;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const html = renderEmailLayout(`
    <p><strong>New verification request</strong></p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${htmlRows}</table>
    <p style="margin-top:16px;color:#6b6459;font-size:13px;">Record ID: ${escapeHtml(input.requestId)}<br/>View in Admin → Requests once the admin dashboard ships (Phase 4).</p>
  `);

  return {
    to: input.founderEmail,
    subject: `New verification request — ${input.requesterCompany}`,
    html,
    text,
  };
}
