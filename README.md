# Scroll Narrative (JSDETAIL)

Bottom-start, top-reveal, SVG draw with GSAP and Next.js.

This demo starts visitors at the bottom of a long page and invites them to scroll upward. As the reader scrolls, sections fade/slide in from the top edge and a tall SVG illustration is drawn progressively in sync with scroll.

## Features

- Bottom-start narrative: Automatically positions the viewport at the page bottom on first load.
- Top-edge reveals: Sections fade/slide down as they near the top of the viewport.
- SVG line-draw: Inline SVG paths draw progressively; supports scrub/pin and a unified timeline.
- Accessibility: Respects `prefers-reduced-motion`. Content is still readable without JS (animations disabled).

## Stack

- Next.js (App Router, React 18)
- TypeScript + Tailwind CSS
- GSAP + ScrollTrigger (dynamically imported on the client)

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Key Components

- `lib/useStartAtBottom`: Event-driven bottom positioning. It scrolls to the true bottom until layout stabilizes, then dispatches a `bottom-positioned` event and triggers `ScrollTrigger.refresh()`.
- `components/RevealTop`: Wrap content blocks to reveal from the top edge using ScrollTrigger. Initializes immediately and refreshes when `bottom-positioned` fires.
- `components/SvgLine`: Inlines an SVG and animates stroke drawing. Supports one-shot, per-path scrub, or a unified scrubbed timeline with optional pinning.

## Accessibility & Fallbacks

- `prefers-reduced-motion`: Animations short-circuit; content is shown immediately.
- No-JS: A `<noscript>` message explains that animations are disabled; the narrative remains readable.

## Notes

- The included SVG is large and may be CPU-intensive on low-end devices. Consider simplifying paths or chunking SVG content if you extend the demo.
- If you add dynamic sections that affect height, they will be handled by the bottom-settle logic and the `bottom-positioned` refresh.

## License

No license specified. If you intend to reuse this, consider adding an OSS license (e.g., MIT).

