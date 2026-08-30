import type { CSSProperties } from "react";

/**
 * Softens the top edge of a scrolling region: content dissolves into the page
 * instead of being sliced off under the tabs or the status bar.
 *
 * This masks the scroller itself rather than laying a band of background colour
 * over it. An overlay looks identical in theory, but a scrolling container and
 * a static sibling snap their edges to device pixels independently once the
 * phone frame is scaled, and a single row of content slips between the two as a
 * hairline stuck to the chrome above. One layer, no seam.
 *
 * `height` should match the region's own top padding, so the mask is fully
 * opaque again by the time the first card or photo begins and nothing is veiled
 * while the region sits at rest.
 */
export function topFadeMask(height: number): CSSProperties {
  const gradient = topFadeGradient(height);
  return { WebkitMaskImage: gradient, maskImage: gradient };
}

/** The mask on its own, for callers animating `height` as the page scrolls. */
export function topFadeGradient(height: number) {
  return (
    "linear-gradient(180deg, rgba(0,0,0,0) 0px, " +
    `rgba(0,0,0,0) ${(height * 0.55).toFixed(2)}px, ` +
    `rgba(0,0,0,0.5) ${(height * 0.8).toFixed(2)}px, ` +
    `rgba(0,0,0,1) ${height.toFixed(2)}px)`
  );
}
