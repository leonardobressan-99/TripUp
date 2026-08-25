import { useEffect, useState, type ReactNode } from "react";
import iphoneFrame from "../assets/images/iphone-17-pro-frame.png";

const DEVICE_W = 402;
const DEVICE_H = 874;
// iphone-17-pro-frame.png is 2920x5328 with a transparent rounded-rect
// screen cutout at (286,95)-(2586,5178), measured directly from the true
// glass-vs-bezel pixel transitions in the source photo (not just eyeballed)
// to avoid leaving a sliver of "off" glass visible above/below the app
// content. Scale so the cutout height matches DEVICE_H exactly (content is
// then very slightly wider than the cutout, which is safe — the opaque
// frame sits above and masks the overflow rather than leaving a gap).
const SOURCE_W = 2920;
const SOURCE_H = 5328;
const CUTOUT = { x0: 286, y0: 135, x1: 2586, y1: 5178 };
const FRAME_SCALE = DEVICE_H / (CUTOUT.y1 - CUTOUT.y0);
const FRAME_W = SOURCE_W * FRAME_SCALE;
const FRAME_H = SOURCE_H * FRAME_SCALE;
const SCREEN_LEFT = CUTOUT.x0 * FRAME_SCALE - (DEVICE_W - (CUTOUT.x1 - CUTOUT.x0) * FRAME_SCALE) / 2;
// The app content box and the mockup's transparent cutout are two
// independently-rounded shapes computed from the same measurements, so a
// sub-pixel mismatch between them is unavoidable. Bleeding the content box a
// few px past the cutout on every edge guarantees it's always the opaque
// bezel — not the page background — that wins at the seam, instead of a
// hairline gap that happened to be invisible against the old dark page
// background but shows up clearly against a light one.
const EDGE_BLEED = 3;
const SCREEN_TOP = CUTOUT.y0 * FRAME_SCALE - 1 - EDGE_BLEED;
const RENDER_H = DEVICE_H + EDGE_BLEED * 2;
const SAFE_MARGIN = 32;

type PhoneFrameProps = {
  children: ReactNode;
  homeIndicatorTone?: "dark" | "light";
};

function useFitScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function computeScale() {
      const availableH = window.innerHeight - SAFE_MARGIN * 2;
      const availableW = window.innerWidth - SAFE_MARGIN * 2;
      const next = Math.min(1, availableH / FRAME_H, availableW / FRAME_W);
      setScale(next);
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  return scale;
}

export default function PhoneFrame({ children, homeIndicatorTone = "dark" }: PhoneFrameProps) {
  const scale = useFitScale();

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#E7E5E0" }}>
      <div
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative" style={{ width: FRAME_W, height: FRAME_H }}>
          {/* screen — rounded at 46px, deliberately less than the mockup
              cutout's own measured ~52px corner radius. The visible shape is
              always whichever radius is SMALLER (the other one just clips
              nothing extra), so keeping this one smaller guarantees the
              content box fully covers the cutout's rounded corners with a
              safety margin, rather than risking a gap if the two radii
              don't match exactly. */}
          <div
            className="absolute overflow-hidden rounded-[46px] bg-cream"
            style={{
              top: SCREEN_TOP,
              left: SCREEN_LEFT,
              width: DEVICE_W,
              height: RENDER_H,
            }}
          >
            {children}
            {/* dynamic island */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] rounded-full bg-black z-40 pointer-events-none" />
            {/* home indicator */}
            <div
              className="absolute bottom-[9px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full z-40 pointer-events-none"
              style={{ backgroundColor: homeIndicatorTone === "dark" ? "#1C2541" : "#FFFFFF", opacity: 0.9 }}
            />
          </div>
          {/* iPhone 17 Pro mockup frame, drawn on top with a transparent screen cutout */}
          <img
            src={iphoneFrame}
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export { DEVICE_W, DEVICE_H };
