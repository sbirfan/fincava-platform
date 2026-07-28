import { Resend } from 'resend';
import { env } from '../env.js';
import { logger } from '../logger.js';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let resendClient: Resend | undefined;

function getResendClient(): Resend {
  resendClient ??= new Resend(env.RESEND_API_KEY);
  return resendClient;
}

// The one place every email in the app goes through — Phase 1's
// verification confirmation/notification, and Phase 2's OTP codes and
// Phase 3's RFQ/sample/sourcing confirmations all reuse this.
//
// Deliberately never throws: callers fire this *after* their DB commit and
// must not have the user's request fail because Resend is down or
// unconfigured. Failures are logged, not propagated. Call sites should not
// `await` this in the request path — fire it and move on.
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn(
      { to: message.to, subject: message.subject },
      'Resend not configured (RESEND_API_KEY/EMAIL_FROM missing) — skipping email send',
    );
    return;
  }

  try {
    const { error } = await getResendClient().emails.send({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      logger.error(
        { error, to: message.to, subject: message.subject },
        'Resend API returned an error',
      );
    }
  } catch (err) {
    logger.error(
      { err, to: message.to, subject: message.subject },
      'Failed to send email via Resend',
    );
  }
}
