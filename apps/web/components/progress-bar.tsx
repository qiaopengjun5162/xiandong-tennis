interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percent = (current / total) * 100;
  return (
    <div
      className="w-full px-7 pb-2 pt-5"
      style={{ background: "#ecd9b4" }}
    >
      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{
          background: "#bc9a6b",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            background: "#c26422",
            boxShadow: "0 0 6px #e68a3a",
          }}
        />
      </div>
      <div
        className="mt-2 text-right text-xs font-bold sm:text-sm"
        style={{ color: "#7a541f" }}
      >
        {label || `第 ${current} / ${total} 题`}
      </div>
    </div>
  );
}
