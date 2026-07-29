import { usePageTitle } from '../lib/usePageTitle.js';

const CONTACT_EMAIL = 'info@fincava.com';
const EFFECTIVE_DATE = 'July 29, 2026';

export default function Terms() {
  usePageTitle('Terms of Service');
  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-medium text-2xl md:text-[28px] text-fc-ink mb-6">
        Terms of Service
      </h1>
      <div className="prose-sm text-sm text-fc-ink-2 leading-relaxed flex flex-col gap-5">
        <p className="text-xs text-fc-ink-3">Effective Date: {EFFECTIVE_DATE}</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern access to and use of the FINCAVA
          platform (the &quot;Platform&quot;), which is owned and operated by KR Industries LLC
          d/b/a FINCAVA (&quot;FINCAVA,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
        </p>
        <p>
          By accessing or using the Platform, creating an account, browsing listings, or submitting
          any request through the Platform, you agree to be bound by these Terms. If you access or
          use the Platform on behalf of a business or other legal entity, you represent and warrant
          that you have authority to bind that entity to these Terms.
        </p>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            1. Business-to-Business Platform
          </h2>
          <p>
            The Platform is intended solely for businesses, professional buyers, and commercial
            purchasers. It is not intended for personal, household, or consumer transactions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            2. Listings Are Not Offers
          </h2>
          <p>
            Product listings, inventory information, specifications, photographs, descriptions,
            availability, pricing, and other information published on the Platform are provided for
            informational purposes only.
          </p>
          <p>
            All listings constitute invitations to negotiate and do not constitute binding offers to
            sell. Inventory availability, specifications, pricing, and other information may change
            at any time without notice until confirmed by FINCAVA in a written quotation or executed
            sales agreement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            3. Requests Do Not Create a Contract
          </h2>
          <p>
            Submitting a request for quotation (&quot;RFQ&quot;), sourcing request, sample request,
            verification request, or any other inquiry through the Platform does not create a
            contract or obligate FINCAVA or the requesting party to proceed with a transaction.
          </p>
          <p>
            No purchase or sale becomes binding unless and until the parties execute a separate
            written agreement or FINCAVA issues a written acceptance of a purchase order or
            quotation, as applicable.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">4. Pricing</h2>
          <p>
            Any pricing displayed on the Platform, including fixed prices, estimated prices,
            starting prices, or price ranges, is provided for convenience only.
          </p>
          <p>Displayed pricing is non-binding and subject to change without notice.</p>
          <p>
            Unless expressly stated otherwise in a written quotation, prices exclude applicable
            taxes, shipping, freight, insurance, customs duties, tariffs, and other governmental
            charges.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            5. Platform Disclaimer
          </h2>
          <p>
            The Platform and all information made available through it are provided on an &quot;AS
            IS&quot; and &quot;AS AVAILABLE&quot; basis.
          </p>
          <p>
            To the fullest extent permitted by applicable law, FINCAVA disclaims all warranties,
            whether express, implied, statutory, or otherwise, including implied warranties of
            merchantability, fitness for a particular purpose, title, non-infringement, accuracy,
            completeness, and uninterrupted availability.
          </p>
          <p>
            FINCAVA does not warrant that Platform information is complete, current, accurate,
            error-free, or suitable for any particular purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            6. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by applicable law, FINCAVA shall not be liable for any
            indirect, incidental, consequential, special, exemplary, or punitive damages, including
            lost profits, lost revenue, lost business opportunities, loss of data, or business
            interruption, arising from or relating to the Platform or these Terms, regardless of the
            legal theory asserted.
          </p>
          <p>
            FINCAVA&apos;s aggregate liability arising from or relating to these Terms or the
            Platform shall not exceed the greater of:
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-1">
            <li>US$100; or</li>
            <li>
              the amount actually paid by the claimant to FINCAVA for use of the Platform during the
              twelve months preceding the event giving rise to the claim.
            </li>
          </ol>
          <p>
            Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or
            limited.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            7. Intellectual Property
          </h2>
          <p>
            All content made available through the Platform, including its software, trademarks,
            service marks, logos, text, graphics, photographs, databases, page layouts, and other
            materials, is owned by or licensed to FINCAVA and is protected by applicable
            intellectual-property laws.
          </p>
          <p>
            Access to or use of the Platform does not transfer any ownership rights to the user.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">8. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>use the Platform for an unlawful, fraudulent, or unauthorized purpose;</li>
            <li>interfere with or disrupt the operation or security of the Platform;</li>
            <li>attempt to gain unauthorized access to an account, system, server, or network;</li>
            <li>
              copy, scrape, crawl, harvest, or systematically extract Platform content or data
              without FINCAVA&apos;s prior written consent;
            </li>
            <li>upload or transmit malware, malicious code, or other harmful material;</li>
            <li>
              impersonate another person or misrepresent your identity, authority, or affiliation;
              or
            </li>
            <li>
              use Platform information to compete with FINCAVA or circumvent FINCAVA in connection
              with a sourcing opportunity introduced through the Platform.
            </li>
          </ul>
          <p>
            FINCAVA may restrict, suspend, or terminate access to the Platform for an actual or
            suspected violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            9. Governing Law and Venue
          </h2>
          <p>
            These Terms and any dispute arising out of or relating to the Platform or these Terms
            shall be governed by and construed in accordance with the laws of the State of Texas,
            without regard to its conflict-of-laws principles.
          </p>
          <p>
            Each party irrevocably submits to the exclusive jurisdiction of the state courts located
            in Williamson County, Texas, and the applicable federal courts having jurisdiction over
            Williamson County, Texas. Each party waives any objection based on improper venue or
            forum non conveniens.
          </p>
          <p className="uppercase">
            To the fullest extent permitted by law, each party knowingly and voluntarily waives any
            right to a trial by jury in an action or proceeding arising out of or relating to these
            Terms or the Platform.
          </p>
          <p>
            If you are located outside the United States, you expressly agree that Texas law and the
            forum described above govern these Terms and any dispute, except to the extent a
            mandatory law of your jurisdiction that cannot be waived by agreement provides
            otherwise.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            10. Changes to These Terms
          </h2>
          <p>
            FINCAVA may modify these Terms from time to time. Updated Terms will become effective
            when posted to the Platform unless a later effective date is stated.
          </p>
          <p>
            Where required by applicable law, FINCAVA will provide additional notice of material
            changes. Continued use of the Platform after revised Terms become effective constitutes
            acceptance of those revised Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">11. Severability</h2>
          <p>
            If any provision of these Terms is determined to be invalid, unlawful, or unenforceable,
            that provision shall be enforced to the maximum extent permitted by law, and the
            remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">12. No Waiver</h2>
          <p>
            A failure or delay by FINCAVA in exercising a right or remedy under these Terms does not
            waive that right or remedy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            13. Entire Agreement and Transaction Documents
          </h2>
          <p>
            These Terms constitute the entire agreement between FINCAVA and the user regarding
            access to and use of the Platform.
          </p>
          <p>
            These Terms do not replace or modify a separately executed purchase agreement, sales
            contract, written quotation, accepted purchase order, or other commercial agreement
            governing a specific transaction. If there is a conflict concerning a specific
            transaction, the separately executed or accepted transaction document shall control to
            the extent of that conflict.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">14. Contact</h2>
          <p>Questions concerning these Terms may be sent to:</p>
          <p>
            FINCAVA
            <br />
            KR Industries LLC
            <br />
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-fc-sage-deep font-medium">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
