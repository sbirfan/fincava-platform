import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { usePageTitle } from '../lib/usePageTitle.js';

const inputClasses =
  'w-full mt-1.5 text-sm bg-fc-paper text-fc-ink border border-fc-border-strong rounded-fc-md px-3 py-2.5 box-border';

export default function Login() {
  usePageTitle('Sign In');
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleRequestCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const enteredEmail = String(form.get('email') ?? '').trim();
    const website = String(form.get('website') ?? ''); // honeypot

    try {
      await requestOtp({ email: enteredEmail, website });
      setEmail(enteredEmail);
      setStep('code');
      setNotice("We've sent a 6-digit code to your email. It expires in 10 minutes.");
    } catch {
      // Deliberately generic — same as the server's own response, so the
      // UI never implies anything about whether the email is registered.
      setEmail(enteredEmail);
      setStep('code');
      setNotice("We've sent a 6-digit code to your email. It expires in 10 minutes.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyOtp(email, code);
      await refresh();
      navigate(result.isNewProfile ? '/profile?welcome=1' : '/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-medium text-2xl text-fc-ink mb-2">Sign in or register</h1>
      <p className="text-sm text-fc-ink-2 mb-8">
        Enter your work email and we&apos;ll send a 6-digit code — no password to remember. New
        emails are registered automatically once the code is verified.
      </p>

      {step === 'email' ? (
        <form
          onSubmit={handleRequestCode}
          className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6 flex flex-col gap-4"
        >
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className={inputClasses}
            />
          </div>

          {/* Honeypot — hidden from real users. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              overflow: 'hidden',
            }}
          >
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyCode}
          className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6 flex flex-col gap-4"
        >
          {notice && <p className="text-sm text-fc-ink-2">{notice}</p>}
          <div>
            <label className="text-sm font-semibold text-fc-ink" htmlFor="code">
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`${inputClasses} tracking-[0.3em] text-center font-mono text-lg`}
            />
          </div>

          {error && <p className="text-sm text-fc-brick">{error}</p>}

          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="px-5 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper disabled:opacity-60"
          >
            {submitting ? 'Verifying…' : 'Verify and sign in'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setCode('');
              setError(null);
              setNotice(null);
            }}
            className="text-xs text-fc-ink-3 underline underline-offset-2 self-start"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
