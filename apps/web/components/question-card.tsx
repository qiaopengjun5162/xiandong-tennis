import type { OptionValue, Question } from "@xiandong/core"

interface QuestionCardProps {
  question: Question
  selectedValue: OptionValue | null
  onSelect: (value: OptionValue) => void
}

export function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="w-full">
      <div
        className="mb-8 p-5 text-lg leading-relaxed font-bold sm:text-xl"
        style={{
          color: "#2c3a1f",
          background: "#fff7ea",
          borderLeft: "7px solid #cb7b3c",
          borderRadius: "20px",
        }}
      >
        {question.text}
      </div>

      <div className="mb-8 flex flex-col gap-3">
        {question.options.map(([label, value], idx) => {
          const checked = selectedValue === value
          const inputId = `opt_${question.id}_${value}_${idx}`
          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-4 rounded-full px-5 py-3 transition hover:translate-x-1"
              style={{
                background: checked ? "#fff2e0" : "white",
                border: checked ? "2px solid #cb7b3c" : "2px solid #decb9e",
                boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
              }}
            >
              <input
                type="radio"
                name={`qOption_${question.id}`}
                id={inputId}
                value={value}
                checked={checked}
                onChange={() => onSelect(value)}
                className="h-6 w-6 shrink-0 cursor-pointer appearance-none rounded-full"
                style={{
                  border: checked ? "2px solid #cb7b3c" : "2px solid #b87c3a",
                  background: checked ? "#cb7b3c" : "white",
                  boxShadow: checked ? "inset 0 0 0 4px white" : "none",
                }}
              />
              <span
                className="flex-1 text-base sm:text-lg"
                style={{ color: "#3a2a1a", fontWeight: 500 }}
              >
                {label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
