import type { Member } from "../store/mockData";

const PALETTE = ["#0EA5A0", "#FF5C72", "#7C3AED", "#D97706", "#2563EB"];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type AvatarProps = {
  member: Member;
  size: number;
  ring?: string;
  className?: string;
};

export default function Avatar({ member, size, ring = "transparent", className = "" }: AvatarProps) {
  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={member.name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size, border: `2px solid ${ring}` }}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-body font-bold text-white shrink-0 ${className}`}
      style={{ width: size, height: size, border: `2px solid ${ring}`, background: colorFor(member.id), fontSize: size * 0.38 }}
    >
      {initials(member.name)}
    </div>
  );
}
