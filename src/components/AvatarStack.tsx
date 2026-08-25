import type { Member } from "../store/mockData";
import Avatar from "./Avatar";
import excludedBadge from "../assets/icons/Delete-badge.svg";

type AvatarStackProps = {
  members: Member[];
  size?: number;
  max?: number;
  ring?: string;
  excludedIds?: string[];
};

export default function AvatarStack({ members, size = 32, max = 4, ring = "#FFFFFF", excludedIds }: AvatarStackProps) {
  const shown = members.slice(0, max);
  const overflow = members.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((m, i) => {
        const isExcluded = excludedIds?.includes(m.id);
        return (
          <div
            key={m.id}
            style={{
              width: size,
              height: size,
              marginLeft: i === 0 ? 0 : -size * 0.32,
              zIndex: shown.length - i,
              position: "relative",
            }}
          >
            <div style={{ opacity: isExcluded ? 0.45 : 1 }}>
              <Avatar member={m} size={size} ring={ring} />
            </div>
            {isExcluded && (
              <img
                src={excludedBadge}
                alt="Excluded"
                className="absolute -bottom-0.5 -right-0.5 rounded-full"
                style={{ width: size * 0.5, height: size * 0.5 }}
              />
            )}
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          className="rounded-full flex items-center justify-center font-body font-bold text-ink"
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.32,
            border: `2px solid ${ring}`,
            background: "#E7E2D6",
            fontSize: size * 0.34,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
