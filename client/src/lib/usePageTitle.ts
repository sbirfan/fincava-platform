import { useEffect } from 'react';

const SITE_NAME = 'FINCAVA';

// Sets the browser tab title per page. Social/crawler OpenGraph previews are
// handled server-side for /lots/:lotCode (see server/src/app.ts) since most
// unfurlers don't execute client JS — this is for the in-browser experience
// and any JS-executing crawler. An optional description overrides the
// site-wide <meta name="description"> from index.html for the page's
// lifetime and is restored on unmount.
export function usePageTitle(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;

    const metaEl = description
      ? document.querySelector<HTMLMetaElement>('meta[name="description"]')
      : null;
    const previousDescription = metaEl?.getAttribute('content') ?? null;
    if (metaEl && description) {
      metaEl.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (metaEl && previousDescription !== null) {
        metaEl.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
