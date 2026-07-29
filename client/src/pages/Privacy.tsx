import { usePageTitle } from '../lib/usePageTitle.js';

export default function Privacy() {
  usePageTitle('Privacy Policy');
  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-medium text-2xl md:text-[28px] text-fc-ink mb-6">
        Privacy Policy
      </h1>
      <div className="prose-sm text-sm text-fc-ink-2 leading-relaxed flex flex-col gap-5">
        <p>
          FINCAVA (&quot;we&quot;, &quot;us&quot;) operates this site to connect professional green
          coffee buyers with curated lots from Colombian cooperatives and farms. This policy
          explains what information we collect, why, and how you can control it.
        </p>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">What we collect</h2>
          <p>
            When you create a free buyer account, we collect your name, company, email, phone,
            country, buyer type, and sourcing preferences (varieties, processes, score range,
            volume, certifications, target regions). When you submit an RFQ, sample request,
            sourcing request, or verification request, we collect the details of that request. We do
            not collect payment information — this platform does not process payments.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">Why we collect it</h2>
          <p>
            To respond to your requests, to match you with lots that fit your stated preferences,
            and — only if you opt in — to notify you when new lots matching your preferences become
            available. Alert outreach is manual: a FINCAVA team member reviews matches and reaches
            out directly, rather than sending automated bulk email.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Consent and legal basis
          </h2>
          <p>
            We process your data on the basis of your consent (given when you register and when you
            opt into alerts) and to take steps you request before entering a contract (RFQ and
            sample requests). Consent timestamps are recorded and can be reviewed on request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">No sale of data</h2>
          <p>
            We do not sell your data to any third party. Your sourcing preferences and budget
            information (where provided) are never shared with producers, cooperatives, or other
            buyers — they are used internally only, to help us serve you better.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Cookies and sessions
          </h2>
          <p>
            We use a single, essential session cookie to keep you signed in. It is not used for
            advertising or cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Your right to deletion
          </h2>
          <p>
            You can request deletion of your account and all associated data at any time by emailing
            us. Deletion is permanent and removes your profile along with your RFQ, sample, and
            sourcing request history. This applies regardless of where you are located, including
            buyers in the EU under the GDPR.
          </p>
        </section>

        <p className="text-xs text-fc-ink-3 pt-4 border-t border-fc-line">
          This policy may be updated as the platform evolves. Contact us with any questions about
          how your data is handled.
        </p>
      </div>
    </div>
  );
}
