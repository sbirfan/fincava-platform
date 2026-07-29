import { usePageTitle } from '../lib/usePageTitle.js';

const CONTACT_EMAIL = 'info@fincava.com';
const EFFECTIVE_DATE = 'July 29, 2026';

export default function Privacy() {
  usePageTitle('Privacy Policy');
  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-medium text-2xl md:text-[28px] text-fc-ink mb-6">
        Privacy Policy
      </h1>
      <div className="prose-sm text-sm text-fc-ink-2 leading-relaxed flex flex-col gap-5">
        <p className="text-xs text-fc-ink-3">Effective Date: {EFFECTIVE_DATE}</p>

        <p>
          KR Industries LLC d/b/a FINCAVA (&quot;FINCAVA,&quot; &quot;we,&quot; &quot;our,&quot; or
          &quot;us&quot;) respects your privacy and is committed to handling personal information
          responsibly.
        </p>
        <p>
          This Privacy Policy explains the categories of information we collect, how we use and
          disclose that information, how long we retain it, and the choices that may be available to
          you when you use the FINCAVA platform (the &quot;Platform&quot;).
        </p>
        <p>The Platform is intended solely for business users and commercial purchasers.</p>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            1. Information We Collect
          </h2>
          <p>
            We collect information that you voluntarily provide to us and limited technical
            information generated when you use the Platform.
          </p>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Account Information
          </h3>
          <p>When you create or maintain an account, we may collect:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>your name;</li>
            <li>company or business name;</li>
            <li>job title;</li>
            <li>business email address;</li>
            <li>telephone number;</li>
            <li>country; and</li>
            <li>buyer type.</li>
          </ul>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Sourcing Preferences
          </h3>
          <p>You may provide sourcing information such as:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>preferred coffee varieties;</li>
            <li>processing methods;</li>
            <li>quality or cupping-score preferences;</li>
            <li>target purchasing volumes;</li>
            <li>certifications;</li>
            <li>preferred growing regions; and</li>
            <li>budget or pricing expectations, if voluntarily provided.</li>
          </ul>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Requests and Communications
          </h3>
          <p>
            When you submit an RFQ, sample request, sourcing request, verification request, or other
            inquiry, we collect the information contained in that request.
          </p>
          <p>We may also retain communications exchanged between you and FINCAVA.</p>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Technical Information
          </h3>
          <p>
            When you access the Platform, we or our service providers may automatically receive
            limited technical information, such as:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>IP address;</li>
            <li>browser type;</li>
            <li>device type;</li>
            <li>operating system;</li>
            <li>access date and time;</li>
            <li>pages viewed;</li>
            <li>session information; and</li>
            <li>basic security or usage logs.</li>
          </ul>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Payment Information
          </h3>
          <p>
            The Platform does not currently process payments, and FINCAVA does not collect
            payment-card information through the Platform.
          </p>

          <h3 className="font-display text-base font-medium text-fc-ink mt-3 mb-1">
            Sensitive Information
          </h3>
          <p>
            FINCAVA does not intentionally request or collect sensitive personal information through
            the Platform. Users should not submit sensitive personal information unless FINCAVA
            specifically requests it for a legitimate business or legal purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            2. How We Use Information
          </h2>
          <p>We may use personal information to:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>create, authenticate, and manage accounts;</li>
            <li>respond to inquiries and requests;</li>
            <li>process RFQs, sourcing requests, sample requests, and verification requests;</li>
            <li>identify coffee lots that may match stated sourcing preferences;</li>
            <li>communicate about requested products, services, or transactions;</li>
            <li>provide support;</li>
            <li>administer, maintain, secure, and improve the Platform;</li>
            <li>prevent fraud, misuse, and security incidents;</li>
            <li>maintain business and compliance records;</li>
            <li>establish, exercise, or defend legal claims; and</li>
            <li>comply with applicable legal obligations.</li>
          </ul>
          <p>
            If a user opts in, FINCAVA may also notify that user about coffee lots or sourcing
            opportunities that match the user&apos;s stated preferences.
          </p>
          <p>
            FINCAVA currently reviews and initiates these communications manually rather than using
            fully automated decision-making to select or contact buyers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            3. Legal Bases for Processing
          </h2>
          <p>
            Where applicable, including when the European Union General Data Protection Regulation
            or United Kingdom GDPR applies, FINCAVA may process personal information based on:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>consent;</li>
            <li>steps requested before entering into a contract;</li>
            <li>performance of a contract;</li>
            <li>compliance with a legal obligation; and</li>
            <li>
              FINCAVA&apos;s legitimate interests in operating, securing, and improving its business
              and serving professional buyers, provided those interests are not overridden by
              applicable privacy rights.
            </li>
          </ul>
          <p>
            Where processing relies on consent, consent may be withdrawn at any time. Withdrawal
            does not affect processing that was lawful before consent was withdrawn.
          </p>
          <p>
            Where applicable, FINCAVA records the date and time at which consent is provided or
            withdrawn.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            4. Cookies and Similar Technologies
          </h2>
          <p>
            The Platform currently uses an essential session cookie or similar authentication
            technology to maintain user sessions and keep authenticated users signed in.
          </p>
          <p>
            FINCAVA does not currently use this essential session technology for targeted
            advertising or cross-site behavioral tracking.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            5. How We Disclose Information
          </h2>
          <p>FINCAVA does not sell personal information for monetary consideration.</p>
          <p>FINCAVA may disclose information:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>
              to hosting, infrastructure, authentication, email, communications, security, support,
              and other service providers that process information on FINCAVA&apos;s behalf;
            </li>
            <li>
              when required by law, regulation, subpoena, court order, or other valid legal process;
            </li>
            <li>
              when reasonably necessary to protect FINCAVA, its users, its business partners, or
              others;
            </li>
            <li>
              in connection with a merger, acquisition, financing, reorganization, bankruptcy, sale
              of assets, or similar corporate transaction;
            </li>
            <li>
              to professional advisers such as attorneys, accountants, auditors, and insurers; or
            </li>
            <li>with the user&apos;s direction or consent.</li>
          </ul>
          <p>
            Sourcing preferences, purchasing strategies, and budget information are not shared with
            producers, cooperatives, or other buyers unless:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>the user authorizes the disclosure;</li>
            <li>
              disclosure is reasonably necessary to respond to or fulfill a transaction requested by
              the user; or
            </li>
            <li>disclosure is otherwise required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            6. International Data Transfers
          </h2>
          <p>FINCAVA operates from the United States.</p>
          <p>
            If a user accesses the Platform from outside the United States, that user&apos;s
            information may be transferred to, stored in, or processed in the United States or
            another jurisdiction in which FINCAVA or its service providers operate. Privacy laws in
            those jurisdictions may differ from those in the user&apos;s location.
          </p>
          <p>
            Where required by applicable law, FINCAVA will use an appropriate legal mechanism or
            safeguard for an international transfer of personal information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">7. Data Retention</h2>
          <p>
            FINCAVA retains personal information for as long as reasonably necessary for the
            purposes described in this Privacy Policy, including to:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>provide requested services;</li>
            <li>maintain accounts and transaction records;</li>
            <li>comply with legal, tax, accounting, and regulatory obligations;</li>
            <li>prevent fraud or misuse;</li>
            <li>resolve disputes; and</li>
            <li>enforce agreements.</li>
          </ul>
          <p>
            Retention periods may vary based on the type of information, the relationship with the
            user, applicable legal requirements, and FINCAVA&apos;s legitimate business needs.
          </p>
          <p>
            When information is no longer reasonably required, FINCAVA may delete, anonymize, or
            otherwise dispose of it in accordance with its operational and legal obligations.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            8. Privacy Rights and Choices
          </h2>
          <p>
            Depending on the user&apos;s location and applicable law, the user may have the right
            to:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>request access to personal information;</li>
            <li>request correction of inaccurate personal information;</li>
            <li>request deletion of personal information;</li>
            <li>request restriction of certain processing;</li>
            <li>object to certain processing;</li>
            <li>request a portable copy of certain information;</li>
            <li>withdraw consent where processing relies on consent; and</li>
            <li>lodge a complaint with an applicable data-protection authority.</li>
          </ul>
          <p>These rights are not absolute and may be subject to legal exceptions.</p>
          <p>
            FINCAVA may request information reasonably necessary to verify the identity and
            authority of a person submitting a privacy request.
          </p>
          <p>
            FINCAVA will not unlawfully discriminate against a user for exercising an applicable
            privacy right.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">9. Account Deletion</h2>
          <p>
            A user may request deletion of a FINCAVA account by contacting FINCAVA using the
            information below.
          </p>
          <p>
            After verifying the request, FINCAVA will delete or anonymize personal information
            associated with the account unless retention is reasonably necessary or legally required
            for purposes such as tax compliance, accounting, fraud prevention, security, dispute
            resolution, enforcement of agreements, or the establishment, exercise, or defense of
            legal claims.
          </p>
          <p>
            Deletion removes the user&apos;s profile, RFQ history, sample requests, sourcing
            requests, saved preferences, and related account information, and the user&apos;s active
            session is invalidated immediately.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">10. Security</h2>
          <p>
            FINCAVA maintains reasonable administrative, technical, and organizational safeguards
            designed to protect personal information from unauthorized access, acquisition, use,
            disclosure, alteration, or destruction.
          </p>
          <p>
            No method of transmission over the internet or method of electronic storage is
            completely secure. FINCAVA therefore cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            11. Children&apos;s Privacy
          </h2>
          <p>
            The Platform is intended solely for business users and is not directed to children or
            individuals under 18 years of age.
          </p>
          <p>
            FINCAVA does not knowingly collect personal information from children through the
            Platform. A person who believes a child has submitted personal information may contact
            FINCAVA to request review and appropriate deletion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            12. Third-Party Services and Links
          </h2>
          <p>
            The Platform may contain links to or integrate with third-party websites or services.
            FINCAVA is not responsible for the privacy, security, or content practices of third
            parties that operate under their own terms and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">
            13. Changes to This Privacy Policy
          </h2>
          <p>FINCAVA may update this Privacy Policy from time to time.</p>
          <p>
            The revised version will be posted on this page with an updated Effective Date. Where
            required by applicable law, FINCAVA will provide additional notice of material changes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-fc-ink mb-2">14. Contact Us</h2>
          <p>Questions, privacy requests, and complaints may be submitted to:</p>
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
