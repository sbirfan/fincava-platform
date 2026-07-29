import { useEffect } from 'react';

const SITE_NAME = 'FINCAVA';

// Sets the browser tab title per page. Social/crawler OpenGraph previews are
// handled server-side for /lots/:lotCode (see server/src/app.ts) since most
// unfurlers don't execute client JS — this is for the in-browser experience
// and any JS-executing crawler.
export function usePageTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
