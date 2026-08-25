import { useEffect, useState } from "react";
import { animate } from "framer-motion";

type AnimatedAmountProps = {
  value: number;
  duration?: number;
  prefix?: string;
};

export default function AnimatedAmount({ value, duration = 1, prefix = "€" }: AnimatedAmountProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <>
      {prefix}
      {display.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </>
  );
}
