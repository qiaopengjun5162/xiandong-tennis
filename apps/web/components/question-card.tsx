import type { OptionValue, Question } from '@xiandong/core';

interface QuestionCardProps {
  question: Question;
  onSelect: (value: OptionValue) => void;
}

export function QuestionCard({ question, onSelect }: QuestionCardProps) {
  return (
    <div className="w-full">
      <h2 className="mb-8 text-xl font-semibold leading-relaxed text-[#e0e0e0]">
        {question.text}
      </h2>
      <div className="flex flex-col gap-4">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="rounded-lg border border-[#333] bg-[#151515] px-5 py-4 text-left text-base text-[#bbb] transition hover:border-[#c82b2b] hover:text-[#e0e0e0] active:bg-[#1a1a1a]"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
