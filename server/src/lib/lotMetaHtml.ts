import { escapeHtml } from '../email/escapeHtml.js';

export interface LotMetaInput {
  lotCode: string;
  title: string;
  tastingNotes: string | null;
  region: string;
  variety: string;
  imageUrl: string | null;
}

// Injects per-lot OpenGraph/Twitter meta tags and a per-lot <title> into the
// SPA's built index.html. Only used for /lots/:lotCode in production — most
// link unfurlers (Slack, WhatsApp, X, LinkedIn) don't execute client JS, so
// setting document.title client-side (see client/src/lib/usePageTitle.ts)
// never reaches them; this is the one place that does.
export function injectLotMeta(html: string, lot: LotMetaInput): string {
  const title = `${escapeHtml(lot.title)} (${escapeHtml(lot.lotCode)}) — FINCAVA`;
  const description = escapeHtml(
    lot.tastingNotes ??
      `${lot.variety}, ${lot.region} — traceable Colombian green coffee from FINCAVA.`,
  );
  const image = lot.imageUrl ? escapeHtml(lot.imageUrl) : '/images/hero.png';

  let out = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${title}" />`,
  );
  out = out.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/>/,
    `<meta name="description" content="${description}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/>/,
    `<meta property="og:description" content="${description}" />`,
  );
  out = out.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${image}" />`,
  );
  return out;
}
