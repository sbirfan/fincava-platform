import type { EmailMessage } from '../send.js';
import { escapeHtml } from '../escapeHtml.js';
import { renderEmailLayout } from './layout.js';

interface OtpCodeEmailInput {
  email: string;
  code: string;
}

export function otpCodeEmail(input: OtpCodeEmailInput): EmailMessage {
  const code = escapeHtml(input.code);
  const text = `Your FINCAVA sign-in code is ${input.code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;
  const html = renderEmailLayout(`
    <p>Your FINCAVA sign-in code:</p>
    <p style="font-size:28px;font-weight:600;letter-spacing:0.12em;margin:16px 0;font-family:monospace;">${code}</p>
    <p style="color:#6b6459;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  `);
  return { to: input.email, subject: 'Your FINCAVA sign-in code', html, text };
}
