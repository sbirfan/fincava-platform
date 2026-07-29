import { usePageTitle } from '../lib/usePageTitle.js';

export default function Terms() {
  usePageTitle('Terms of Service');
  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-medium text-2xl md:text-[28px] text-fc-ink mb-6">
        Terms of Service
      </h1>
      <div className="prose-sm text-sm text-fc-ink-2 leading-relaxed flex flex-col gap-5">
        <p>
          These terms govern your use of the FINCAVA platform. By browsing lots, registering an
          account, or submitting a request, you agree to the terms below.
        </p>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Listings are not offers
          </h2>
          <p>
            Lot listings on this site are invitations to treat, not binding offers to sell.
            Availability, pricing, and specifications are subject to change without notice until
            confirmed in writing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Requests do not form a contract
          </h2>
          <p>
            Submitting an RFQ, sample request, sourcing request, or verification request does not
            create a binding contract between you and FINCAVA. All sales are concluded only through
            a separately negotiated written agreement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Pricing is indicative
          </h2>
          <p>
            Any pricing shown on the platform — whether an exact figure, a starting price, or an
            estimated range — is indicative only and not binding until confirmed in a written quote
            from FINCAVA.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            Limitation of liability
          </h2>
          <p>
            FINCAVA provides this platform on an &quot;as is&quot; basis and, to the fullest extent
            permitted by law, disclaims liability for indirect, incidental, or consequential damages
            arising from your use of it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">Governing law</h2>
          <p>
            These Terms, and any dispute arising out of or relating to the Platform or these Terms,
            are governed by the laws of the State of Texas, without regard to its conflict-of-laws
            principles. The parties agree that any such dispute shall be brought exclusively in the
            state or federal courts located in Williamson County, Texas, and each party consents to
            personal jurisdiction and venue there.
          </p>
        </section>

        <p className="text-xs text-fc-ink-3 pt-4 border-t border-fc-line">
          These terms may be updated as the platform evolves.
        </p>
      </div>
    </div>
  );
}
