# Boundary Replay visual system

## Direction

**Luminous glass data landscape.** A production boundary is shown as a dark,
layered field. Requests cross it as cyan signal lines. Scrubbed values become
warm amber panes, so safety is visible rather than decorative. The layout uses
an offset editorial grid instead of a centered SaaS hero.

## Tokens

- `ink-950 #071019`: page background and deep terminal field
- `ink-900 #0c1822`: raised field
- `glass #142737cc`: translucent working surfaces
- `line #315062`: rules and inactive paths
- `paper #eef8f5`: primary text
- `mist #aec4c6`: secondary text (7.8:1 on `ink-950`)
- `signal #5eead4`: actions and live capture (12.2:1 as dark text)
- `amber #ffc66d`: redaction and warnings
- `coral #ff8f81`: errors
- `green #8de5af`: successful exports

Spacing follows an 8 px base with a tighter 4 px utility step. The working
measure is 68 characters. Surfaces use clipped corners and single-pixel inner
highlights to resemble instrument glass, not rounded framework cards.

## Type

Display text uses the self-hosted **Space Grotesk** variable font. Body and
code use **IBM Plex Mono**. The narrow technical rhythm fits request paths and
trace IDs while the display face keeps the first screen readable. Both font
files are stored in the repository and use `font-display: swap`.

## Layout and interaction grammar

The wordmark sits on a stable top rail. The hero copy occupies five columns;
the boundary landscape breaks the grid across seven. Product data uses a
three-lane sequence: captured request, redaction boundary, local response.
Buttons are rectangular with one clipped corner. Links stay underlined.
Focus uses a three-pixel amber ring.

The signature transition is a one-time signal sweep across the boundary when
the preview enters view. State changes use 180–240 ms opacity and transform.
With reduced motion, the sweep is removed and state changes are immediate.
Nothing loops.

## Light and dark

The thesis is intentionally single-mode. Production incident work is rendered
as a dark instrument surface; the page paints every background explicitly.
High-luminance type and controls meet WCAG AA on every surface.

## Original asset plan and provenance

- `site/public/assets/boundary-landscape.webp`: generated for this product with
  `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment on
  2026-08-28. Prompt: “Wide cinematic abstract data landscape for a developer
  tool landing page; near-black navy glass terrain, three translucent boundary
  planes, thin cyan request paths crossing left to right, a few amber redaction
  shards suspended at the middle plane, precise technical atmosphere, luminous
  volumetric edges, restrained, no text, no logos, no people, no UI screenshot,
  no generic gradient blobs, dark negative space around the edges.” Generated
  at 1536×1024, converted locally to WebP. It is original project art.
- `site/public/assets/boundary-landscape-640.webp`: a 640 px WebP derivative
  made locally from the original landscape with ImageMagick on 2026-08-28 for
  mobile delivery. It introduces no new imagery or license.
- Open Graph art is composed locally from the same original landscape and
  product typography. No stock assets are used.
- The boundary glyph and favicon are hand-authored SVG geometry for this repo.
