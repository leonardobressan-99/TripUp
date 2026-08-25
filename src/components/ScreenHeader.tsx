import backArrowIcon from "../assets/icons/Back_Arrow.svg";

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  className?: string;
  dark?: boolean;
};

export default function ScreenHeader({ title, onBack, className = "", dark = false }: ScreenHeaderProps) {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <button onClick={onBack} aria-label="Back">
        <img src={backArrowIcon} alt="" className="w-7 h-7" />
      </button>
      <h1 className={`font-body font-bold text-[18px] ${dark ? "text-white" : "text-ink"}`}>{title}</h1>
    </div>
  );
}
