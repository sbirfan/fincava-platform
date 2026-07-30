import { MapPinCheck, ShieldCheck, FileStack, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle.js';

const commitments = [
  {
    title: 'Known Sources',
    body: 'We procure only from farms and producer groups we can identify, communicate with, and document.',
    icon: MapPinCheck,
  },
  {
    title: 'Honest Representation',
    body: 'Coffee is described according to the evidence — origin, process, condition, and sensory results. No inflated scores, no implied certifications.',
    icon: ShieldCheck,
  },
  {
    title: 'Buyer-Driven Documentation',
    body: "We invest in gathering the specs and traceability data serious buyers need, and say plainly when something isn't available yet.",
    icon: FileStack,
  },
  {
    title: 'Local Accountability',
    body: 'A Taylor, Texas base gives U.S. buyers a local commercial counterpart, not just an overseas supplier.',
    icon: Building2,
  },
];

export default function About() {
  usePageTitle('About');
  return (
    <div>
      <div
        className="relative bg-fc-ink bg-cover bg-center flex items-center py-12 md:py-16"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(43,30,22,0.72), rgba(43,30,22,0.35))',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full">
          <h1 className="font-display font-medium text-2xl md:text-4xl leading-snug text-white max-w-[22ch] mb-3.5">
            FINCAVA is a green-coffee procurement and supply company built on direct relationships,
            not automated sourcing.
          </h1>
          <p className="text-white/90 text-sm md:text-[15px] max-w-[56ch] leading-relaxed">
            Owned by KR Industries, LLC, a Taylor, Texas-based company that is 50% women-owned,
            FINCAVA sources traceable coffee from known farms in Santander and Boyacá, Colombia —
            and offers independent field verification for buyers who aren&apos;t ready to purchase
            yet.
          </p>
        </div>
      </div>

      <div className="max-w-[920px] mx-auto px-6 md:px-8 pt-12">
        <h2 className="font-display text-2xl font-medium text-fc-ink mb-3">
          A presence on both ends of the supply chain
        </h2>
        <p className="text-sm text-fc-ink-2 leading-relaxed">
          FINCAVA maintains a permanent, ongoing operating presence in San Gil, Santander, Colombia,
          alongside its base in Taylor, Texas. Both owners travel regularly between the two
          locations — meeting producers, visiting farms, and coordinating samples in Colombia, while
          remaining directly accountable to buyers in the U.S.
        </p>
      </div>

      <div className="max-w-[920px] mx-auto px-6 md:px-8 pt-10">
        <h2 className="font-display text-2xl font-medium text-fc-ink mb-3">
          Commercial Partnership With Women-Led Farms
        </h2>
        <p className="text-sm text-fc-ink-2 leading-relaxed">
          A meaningful share of the farms FINCAVA sources from in Santander and Boyacá are fully or
          partially owned, managed, or operated by women who are already producing coffee that
          competes on quality alone. FINCAVA&apos;s interest is straightforwardly commercial: these
          are strong, capable trading partners, and building direct, recurring purchasing
          relationships with them is a deliberate part of how FINCAVA sources — not a social
          program, and not an act of rescue. This is a partnership between equals, built on
          consistent quality and reliable demand, not assistance.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-12">
        <h2 className="font-display text-xl font-medium text-fc-ink mb-5">What we commit to</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {commitments.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7"
              >
                <div className="w-10 h-10 rounded-full bg-fc-sage-soft flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-fc-sage-deep" strokeWidth={1.75} />
                </div>
                <div className="font-display font-medium text-base text-fc-ink mb-1.5">
                  {c.title}
                </div>
                <p className="text-[13px] text-fc-ink-2 leading-relaxed">{c.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-[920px] mx-auto px-6 md:px-8 pt-12">
        <div className="bg-fc-sage-soft rounded-fc-lg p-8">
          <div className="text-[12px] font-medium tracking-[0.16em] uppercase text-fc-sage-deep mb-2">
            Field Verification
          </div>
          <h2 className="font-display text-xl font-medium text-fc-ink mb-2.5">
            Not ready to purchase? Start with verification.
          </h2>
          <p className="text-sm text-fc-ink-2 leading-relaxed mb-5 max-w-[70ch]">
            Not every buyer is ready to place an order. FINCAVA offers fee-based farm, producer,
            origin, and lot-verification — field visits, photography, documentation, and reporting —
            so you can evaluate a farm or lot before committing funds. This is field verification
            and documentation, not certification: every report separates what we directly observed
            from what the producer reported and anything we couldn&apos;t confirm.
          </p>
          <Link
            to="/verification"
            className="inline-block px-5 py-3 rounded-fc-md text-[15px] font-medium bg-fc-sage text-fc-paper"
          >
            Request Farm Verification
          </Link>
        </div>
      </div>

      <div className="max-w-[920px] mx-auto px-6 md:px-8 py-12">
        <p className="text-xs text-fc-ink-3">
          Import and logistics coordination is planned as FINCAVA grows.
        </p>
      </div>
    </div>
  );
}
