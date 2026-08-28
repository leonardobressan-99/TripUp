import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * One bank of cloud. The shape comes from SVG fractal noise rather than blurred
 * ellipses — real cloud edges are self-similar and wispy at every scale, which
 * is exactly what fractalNoise produces and what a stack of soft circles never
 * quite manages.
 *
 * The colour matrix turns the noise into white pixels whose alpha is the
 * inverse of the noise value, so dense patches read as thick cloud and the rest
 * feathers out. The radial mask then stops the bank at a soft edge instead of
 * filling the whole rectangle evenly.
 */
function CloudBank({
  id,
  seed,
  baseFrequency,
  octaves = 6,
  alphaSlope,
  alphaBias,
  maskRadius,
}: {
  id: string;
  seed: number;
  baseFrequency: string;
  octaves?: number;
  alphaSlope: number;
  alphaBias: number;
  maskRadius: string;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`cloud-filter-${id}`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={octaves}
            seed={seed}
            stitchTiles="stitch"
            result="noise"
          />
          {/* RGB pinned to white; alpha = bias - slope * noiseAlpha, so low
              noise becomes opaque cloud and high noise becomes clear sky. */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values={`0 0 0 0 1
                     0 0 0 0 1
                     0 0 0 0 1
                     0 0 0 ${-alphaSlope} ${alphaBias}`}
          />
        </filter>

        {/* Must reach zero by the edge of the viewBox. At a larger radius the
            bank is still near-opaque where the SVG viewport clips it, which
            leaves a hard vertical seam — invisible while the bank is centred,
            but it slides straight into view once the bank drifts. */}
        <radialGradient id={`cloud-fade-${id}`} cx="50%" cy="50%" r={maskRadius}>
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.94" />
          <stop offset="82%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <mask id={`cloud-mask-${id}`}>
          <rect width="400" height="220" fill={`url(#cloud-fade-${id})`} />
        </mask>
      </defs>

      <g mask={`url(#cloud-mask-${id})`}>
        <rect width="400" height="220" filter={`url(#cloud-filter-${id})`} />
      </g>
    </svg>
  );
}

/**
 * Intro that parts a cloud cover to reveal the map underneath.
 *
 * Only transform and opacity are animated — the noise itself is rasterised once
 * and then composited, because re-running feTurbulence every frame is expensive
 * enough to drop the animation to a crawl on a phone.
 */
export default function MapClouds({ onDone }: { onDone: () => void }) {
  const [parted, setParted] = useState(false);

  useEffect(() => {
    // Two rAFs so the covered first frame actually paints before the transition
    // starts; a single one can land in the same paint and skip the reveal.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setParted(true));
    });
    // Unmount once the fade has finished rather than waiting out the drift:
    // the banks are fully transparent by then, so keeping them mounted only
    // costs compositing.
    const done = setTimeout(onDone, 2050);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ease = [0.33, 0, 0.2, 1] as const;
  // Opacity finishes well before the drift does: the banks are already
  // invisible by the time their far edges travel anywhere near the map, so no
  // boundary can show up regardless of how far they slide.
  const fade = { duration: 1.7, ease: "easeInOut" as const };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      {/* Haze: the thin bright veil between the banks. Deliberately light — at
          full strength it flattens the noise into a plain white rectangle and
          throws away the texture the banks are there to provide. */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(238,244,250,0.45)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: parted ? 0 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Back bank drifts right and slower, so the two layers separate with a
          bit of depth rather than sliding apart as one flat sheet. */}
      <motion.div
        className="absolute"
        style={{ inset: "-18% -22%", willChange: "transform, opacity" }}
        initial={{ x: "0%", scale: 1, opacity: 0.85 }}
        animate={parted ? { x: "34%", scale: 1.16, opacity: 0 } : {}}
        transition={{ duration: 2.4, ease, opacity: fade }}
      >
        <CloudBank
          id="back"
          seed={17}
          baseFrequency="0.011 0.019"
          octaves={5}
          alphaSlope={1.3}
          alphaBias={1.15}
          maskRadius="50%"
        />
      </motion.div>

      {/* Front bank: denser, larger-scale billows, exits left and faster. */}
      <motion.div
        className="absolute"
        style={{ inset: "-20% -25%", willChange: "transform, opacity" }}
        initial={{ x: "0%", scale: 1, opacity: 1 }}
        animate={parted ? { x: "-42%", scale: 1.22, opacity: 0 } : {}}
        transition={{ duration: 2.3, ease, opacity: fade }}
      >
        <CloudBank
          id="front"
          seed={5}
          baseFrequency="0.0065 0.013"
          octaves={6}
          alphaSlope={1.7}
          alphaBias={1.32}
          maskRadius="50%"
        />
      </motion.div>

      {/* A few high wisps that linger a beat longer than the banks. */}
      <motion.div
        className="absolute"
        style={{ inset: "-10% -15%", willChange: "transform, opacity" }}
        initial={{ x: "0%", scale: 1, opacity: 0.6 }}
        animate={parted ? { x: "-16%", scale: 1.1, opacity: 0 } : {}}
        transition={{ duration: 2.6, ease, delay: 0.12, opacity: { ...fade, delay: 0.12 } }}
      >
        <CloudBank
          id="wisps"
          seed={31}
          baseFrequency="0.02 0.05"
          octaves={4}
          alphaSlope={1.1}
          alphaBias={0.95}
          maskRadius="50%"
        />
      </motion.div>
    </div>
  );
}
