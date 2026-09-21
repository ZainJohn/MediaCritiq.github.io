# MediaCritiq Devlog

## Design summary
MediaCritiq is intended to feel like a modern streaming platform that also helps users discover the source material behind the adaptation. The current build establishes the brand, visual tone, and responsive structure needed for future expansion.

## 2026-09-03 | Project kickoff

- Established the MediaCritiq concept as a streaming-style media hub focused on comic, movie, series, and source-material discovery.
- Decided on a premium cinema aesthetic with dark backgrounds, glowing accent colours, and horizontal scrolling media rows.
- Set the project folder structure to support a branded image asset and a development log.
- Created the initial logo in `images/logo.png` to anchor the brand identity.

## 2026-09-08 | Layout and content direction

- Planned a multi-page site structure with a home landing page, watchlist, source-material page, reviews, contact, and about page.
- Chose a split approach: hero spotlight on the home page, then multiple carousels for trending titles, new releases, and must-watch adaptations.
- Prioritised mobile usability early so the site remains readable on phones and tablets without losing the cinema-style feel.

## 2026-09-09 | Styling approach

- Built a dark cinematic palette using deep navy, warm gold, and electric blue accents.
- Introduced rounded cards, gradients, and soft shadows to imitate modern streaming interfaces.
- Added horizontal row controls so users can slide through media collections rather than showing everything at once.

## 2026-09-11 | Responsive behaviour

- Added breakpoints for tablet and phone layouts.
- Collapsed the navigation into a compact menu for smaller screens.
- Kept the poster and content grids flexible so rows remain readable and the layout adapts without horizontal overflow.
- Constrained nested carousel containers so the mobile page stays within the viewport.

## 2026-09-15 | Movable lists

- Added drag-and-drop reordering for the Discover and Watchlist content lists.
- Added touch pointer support so list cards can be moved on mobile devices.
- Added Arrow Up and Arrow Down keyboard controls for accessible reordering.
- Saved each page's list order in local storage so changes remain after revisiting the page.

## 2026-09-16 | Interaction testing

- Tested list reordering at desktop and phone viewport sizes.
- Confirmed keyboard reordering keeps focus on the moved card.
- Fixed an intrinsic-width issue that caused horizontal overflow on small screens.

## 2026-09-20 | Next improvements

- Replace placeholder media art with official posters and branded assets as the final content is locked in.
- Add a real search/filter system for titles by genre, format, or rating.
- Expand the site with a dedicated detail page for each movie or show.
- Refine motion and interaction polish for a more app-like feel.


## 2026-09-22 | Poster loading follow-up

- Diagnosed poster loading stopping when one title had no mapping because the loop used `return` instead of continuing to the next item.
- Added mappings for missing titles plus support for title variants.
- Updated the script to process both carousel posters and images inside list cards.
- Recorded that the editor reported no errors after the fix.

## 2026-09-21 | Mobile list dragging

- Changed list cards from vertical page panning to direct touch handling so mobile drag reordering is not interrupted by page scrolling.
- Affected the touch interaction for reorderable cards on Discover and Watchlist.
- >Validation: confirmed the previous `touch-action: pan-y` rule was the conflict
- Disabled native HTML dragging and prevented the default touch gesture during touch reordering so custom pointer handling can keep control of the gesture.





















