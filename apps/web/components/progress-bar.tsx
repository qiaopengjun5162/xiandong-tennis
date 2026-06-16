interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = (current / total) * 100;
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-[#666]">
        <span>第 {current} / {total} 题</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#333]">
        <div
          className="h-full rounded-full bg-[#c82b2b] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
