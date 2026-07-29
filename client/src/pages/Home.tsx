import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLots, type ApiLot } from '../lib/api.js';
import LotCard from '../components/LotCard.js';

export default function Home() {
  const [lots, setLots] = useState<ApiLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots()
      .then(setLots)
      .finally(() => setLoading(false));
  }, []);

  const cupScores = lots.map((l) => Number(l.cupScore)).filter((n) => !Number.isNaN(n));
  const avgCupScore =
    cupScores.length > 0
      ? (cupScores.reduce((a, b) => a + b, 0) / cupScores.length).toFixed(1)
      : null;

  return (
    <div>
      <div
        className="relative bg-fc-ink bg-cover bg-center flex items-center py-14 md:py-0 md:h-[400px]"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(43,30,22,0.72), rgba(43,30,22,0.35))',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full">
          <h1 className="font-display font-medium text-3xl md:text-[44px] leading-tight text-white max-w-[16ch] mb-4">
            Traceable Colombian green coffee, sourced for professional buyers
          </h1>
          <p className="text-white/85 text-base md:text-[17px] max-w-[46ch] mb-5">
            FINCAVA connects specialty importers, roasters, brokers and distributors directly to
            curated lots from Colombian cooperatives and farms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lots"
              className="px-5 py-3 rounded-fc-md text-[15px] font-medium bg-fc-sage text-fc-paper"
            >
              Browse Available Lots
            </Link>
            <Link
              to="/sourcing-request"
              className="px-5 py-3 rounded-fc-md text-[15px] font-medium border border-white/60 text-white"
            >
              Submit a Sourcing Request
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 flex gap-8 pt-6">
        <div>
          <div className="font-display font-semibold text-xl text-fc-ink">
            {loading ? '—' : lots.length}
          </div>
          <div className="text-xs text-fc-ink-3">Lots available</div>
        </div>
        {avgCupScore && (
          <div>
            <div className="font-display font-semibold text-xl text-fc-ink">{avgCupScore}</div>
            <div className="text-xs text-fc-ink-3">Avg. cup score</div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid md:grid-cols-2 gap-6">
        <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7">
          <div className="text-[12px] font-medium tracking-[0.16em] uppercase text-fc-brick mb-1.5">
            For Buyers
          </div>
          <h3 className="font-display text-xl font-medium text-fc-ink mb-2">
            Source with confidence
          </h3>
          <p className="text-sm text-fc-ink-2 leading-relaxed">
            Browse verified lots, request samples, and buy direct — every lot carries a passport
            with origin, process, and cup score before you commit.
          </p>
        </div>
        <div className="bg-fc-white border border-fc-line rounded-fc-lg shadow-fc-1 p-7">
          <div className="text-[12px] font-medium tracking-[0.16em] uppercase text-fc-sage-deep mb-1.5">
            Verified at the Source
          </div>
          <h3 className="font-display text-xl font-medium text-fc-ink mb-2">How We Source</h3>
          <p className="text-sm text-fc-ink-2 leading-relaxed">
            We work directly with verified cooperatives across Colombian growing regions — on-site
            visits, scored samples, and a lot passport for every shipment. No intermediaries, no
            blind sourcing.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-16">
        <h2 className="font-display text-2xl font-medium text-fc-ink mb-4">Available now</h2>
        {loading ? (
          <p className="text-sm text-fc-ink-3">Loading lots…</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {lots.slice(0, 3).map((lot) => (
              <LotCard key={lot.lotCode} lot={lot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
