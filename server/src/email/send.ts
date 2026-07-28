import { Resend } from 'resend';
import { env } from '../env.js';
import { logger } from '../logger.js';
import { getDb } from '../db/index.js';
import { emailLogs } from '../db/schema.js';

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

// Persist the outcome of a send attempt to email_logs. Runs after the
// response has already been sent to the user, so a DB failure here is
// logged but never rethrown — it must not affect the caller.
async function logEmailAttempt(
  to: string,
  subject: string,
  status: 'sent' | 'error' | 'skipped',
  resendId?: string,
  errorMessage?: string,
): Promise<void> {
  try {
    await getDb()
      .insert(emailLogs)
      .values({
        to,
        subject,
        status,
        resendId: resendId ?? null,
        errorMessage: errorMessage ?? null,
      });
  } catch (err) {
    logger.error({ err, to, subject, status }, 'Failed to write email_logs record');
  }
}

// The one place every email in the app goes through — Phase 1's
// verification confirmation/notification, and Phase 2's OTP codes and
// Phase 3's RFQ/sample/sourcing confirmations all reuse this.
//
// Deliberately never throws: callers fire this *after* their DB commit and
// must not have the user's request fail because Resend is down or
// unconfigured. Failures are logged AND persisted to email_logs so they
// are visible without watching raw server logs.
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn(
      { to: message.to, subject: message.subject },
      'Resend not configured (RESEND_API_KEY/EMAIL_FROM missing) — skipping email send',
    );
    void logEmailAttempt(
      message.to,
      message.subject,
      'skipped',
      undefined,
      'RESEND_API_KEY or EMAIL_FROM not configured',
    );
    return;
  }

  try {
    const { data, error } = await getResendClient().emails.send({
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
      void logEmailAttempt(message.to, message.subject, 'error', undefined, JSON.stringify(error));
    } else {
      void logEmailAttempt(message.to, message.subject, 'sent', data?.id ?? undefined);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(
      { err, to: message.to, subject: message.subject },
      'Failed to send email via Resend',
    );
    void logEmailAttempt(message.to, message.subject, 'error', undefined, msg);
  }
}
