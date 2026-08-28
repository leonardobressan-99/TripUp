import { useState } from "react";
import { itineraryMapPins } from "../store/mockData";
import lisbonMap from "../assets/images/LisbonMap.jpg";
import MapClouds from "./MapClouds";

type TripMapProps = {
  // Whether the cloud reveal has already run this session. Lifted to App.tsx
  // rather than kept here: this component unmounts every time the user leaves
  // the Itinerary tab, so local state would replay the intro on every visit.
  introPlayed: boolean;
  onIntroPlayed: () => void;
};

export default function TripMap({ introPlayed, onIntroPlayed }: TripMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div
      className="relative w-full shrink-0 rounded-[24px] overflow-hidden"
      style={{ height: 220 }}
      onClick={() => setActiveId(null)}
    >
      <img src={lisbonMap} alt="Trip map" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "rgba(28,37,65,0.08)" }} />

      {!introPlayed && <MapClouds onDone={onIntroPlayed} />}

      {itineraryMapPins.map((pin) => {
        const isActive = activeId === pin.id;
        return (
          <button
            key={pin.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(isActive ? null : pin.id);
            }}
            className="absolute flex flex-col items-center"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -100%)",
              zIndex: isActive ? 50 : 1,
            }}
          >
            {isActive && (
              <div
                className="mb-1 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center justify-center"
                style={{ background: "#1C2541", boxShadow: "0 4px 10px rgba(28,37,65,0.35)" }}
              >
                <span
                  className="font-body font-bold text-white text-center"
                  style={{ fontSize: 9, lineHeight: 1 }}
                >
                  {pin.label}
                </span>
              </div>
            )}
            <div
              className="rounded-full shrink-0 transition-all"
              style={{
                width: isActive ? 15 : 11,
                height: isActive ? 15 : 11,
                background: pin.visited ? "#0EA5A0" : "#FF5C72",
                border: "2px solid white",
                boxShadow: "0 2px 5px rgba(28,37,65,0.35)",
              }}
            />
          </button>
        );
      })}

      <div
        className="absolute bottom-2 left-2 flex items-center gap-3 bg-white/85 rounded-full px-2.5 py-1"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal" />
          <span className="font-body font-bold text-ink" style={{ fontSize: 9 }}>
            Visited
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-coral" />
          <span className="font-body font-bold text-ink" style={{ fontSize: 9 }}>
            Upcoming
          </span>
        </div>
      </div>
    </div>
  );
}
