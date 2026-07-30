import { usePageTitle } from '../lib/usePageTitle.js';

// This is intentionally a static page with a mailto CTA, not a form backed
// by a new database table: Contact inquiries aren't a modeled entity in the
// spec's schema, and adding one would be exactly the kind of untasked
// "communications" table the handover explicitly rejects.
const CONTACT_EMAIL = 'info@fincava.com';
const WHATSAPP_NUMBER = '512-360-0118';
const LOCATION = 'Taylor, Texas, USA · San Gil, Santander, Colombia';

export default function Contact() {
  usePageTitle('Contact');
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-medium text-2xl md:text-[28px] text-fc-ink mb-3">Contact</h1>
      <p className="text-sm text-fc-ink-2 leading-relaxed mb-8">
        Questions about a lot, a sourcing need, or FINCAVA in general — reach out directly. For
        quote, sample, sourcing, and verification requests, use the request forms linked from each
        lot or the footer below so your request reaches the right queue.
      </p>

      <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-6 flex flex-col gap-4">
        <div>
          <div className="text-xs font-semibold text-fc-ink-3 uppercase tracking-wide mb-1">
            Email
          </div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-fc-sage-deep font-medium">
            {CONTACT_EMAIL}
          </a>
        </div>
        <div>
          <div className="text-xs font-semibold text-fc-ink-3 uppercase tracking-wide mb-1">
            WhatsApp
          </div>
          <span className="text-sm text-fc-ink-2">{WHATSAPP_NUMBER}</span>
        </div>
        <div>
          <div className="text-xs font-semibold text-fc-ink-3 uppercase tracking-wide mb-1">
            Location
          </div>
          <span className="text-sm text-fc-ink-2">{LOCATION}</span>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-2 inline-block text-center px-5 py-3 rounded-fc-md text-sm font-medium bg-fc-sage text-fc-paper"
        >
          Send an inquiry
        </a>
      </div>
    </div>
  );
}
