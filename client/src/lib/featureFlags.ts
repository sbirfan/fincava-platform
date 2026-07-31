// Simple boolean toggles for built-but-not-yet-published features. A plain
// constant is intentional here — no environment variable or other infra is
// warranted for a switch this simple; just flip the value and rebuild.

// Set to true to publish the Our Story page (nav link + route). Currently
// false: the page is fully built (see src/pages/OurStory.tsx) but not
// ready to announce publicly yet.
export const SHOW_OUR_STORY_PAGE = false;
