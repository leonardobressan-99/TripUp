type StatusBarProps = {
  tone?: "dark" | "light";
};

export default function StatusBar({ tone = "dark" }: StatusBarProps) {
  const color = tone === "dark" ? "#1C2541" : "#FFFFFF";

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[59px] flex items-end justify-between px-[26px] pb-[10px] pointer-events-none select-none z-30"
      style={{ color }}
    >
      <span className="font-body font-bold text-[16px] leading-none tracking-tight">9:41</span>
      <div className="flex items-center gap-[6px]">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill={color} />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill={color} />
          <rect x="10" y="3" width="3" height="9" rx="0.8" fill={color} />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill={color} />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.2C8.66 10.2 9.2 10.74 9.2 11.4C9.2 12.06 8.66 12.6 8 12.6C7.34 12.6 6.8 12.06 6.8 11.4C6.8 10.74 7.34 10.2 8 10.2Z"
            fill={color}
          />
          <path
            d="M8 6.2C9.5 6.2 10.87 6.75 11.93 7.66L10.6 9.2C9.9 8.6 9 8.2 8 8.2C7 8.2 6.1 8.6 5.4 9.2L4.07 7.66C5.13 6.75 6.5 6.2 8 6.2Z"
            fill={color}
          />
          <path
            d="M8 2C10.87 2 13.47 3.08 15.43 4.86L14.1 6.4C12.5 4.95 10.36 4.06 8 4.06C5.64 4.06 3.5 4.95 1.9 6.4L0.57 4.86C2.53 3.08 5.13 2 8 2Z"
            fill={color}
          />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color} strokeOpacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.3" fill={color} />
          <path d="M23 4.2V7.8C23.8 7.5 24.3 6.8 24.3 6C24.3 5.2 23.8 4.5 23 4.2Z" fill={color} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
