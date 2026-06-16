"use client"

import { useEffect, useState } from "react"
import { QuestionCard } from "./question-card"
import { ProgressBar } from "./progress-bar"
import { calculateResult, getQuestions } from "@/lib/wasm"
import type { OptionValue, Question } from "@xiandong/core"

interface QuizScreenProps {
  onFinish: (answers: OptionValue[], resultType: string) => void
}

export function QuizScreen({ onFinish }: QuizScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<(OptionValue | null)[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuestions().then((qs) => {
      setQuestions(qs)
      setAnswers(new Array(qs.length).fill(null))
      setLoading(false)
    })
  }, [])

  const handleSelect = (value: OptionValue) => {
    setAnswers((prev) => prev.map((a, i) => (i === currentIndex ? value : a)))
  }

  const handleNext = async () => {
    if (answers[currentIndex] === null) {
      alert("🔫 请先选择你的武器！")
      return
    }

    if (currentIndex === questions.length - 1) {
      const finalAnswers = answers.filter((a): a is OptionValue => a !== null)
      if (finalAnswers.length !== questions.length) {
        alert("还有题目未答，请检查")
        return
      }
      const resultType = await calculateResult(finalAnswers)
      onFinish(finalAnswers, resultType)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleReset = () => {
    setAnswers(new Array(questions.length).fill(null))
    setCurrentIndex(0)
  }

  if (loading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 text-4xl" style={{ color: "#cb7b3c" }}>
          ⚔️
        </div>
        <p style={{ color: "#7a541f" }}>兵器库加载中...</p>
      </div>
    )
  }

  const isLast = currentIndex === questions.length - 1

  return (
    <div className="flex flex-col">
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <div className="px-6 py-7 sm:px-8" style={{ background: "#fef5e6" }}>
        <QuestionCard
          question={questions[currentIndex]}
          selectedValue={answers[currentIndex]}
          onSelect={handleSelect}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="rounded-full px-5 py-3 text-sm font-bold text-white transition active:translate-y-0.5 sm:px-6 sm:text-base"
            style={{
              background: "#8b4c2a",
              boxShadow: "0 3px 0 #552e15",
            }}
          >
            🏠 重测
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full px-5 py-3 text-sm font-bold text-white transition active:translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:px-6 sm:text-base"
              style={{
                background: "#2d4a3b",
                boxShadow: currentIndex === 0 ? "none" : "0 3px 0 #1a2f24",
              }}
            >
              ◀ 上一题
            </button>
            <button
              onClick={handleNext}
              className="rounded-full px-5 py-3 text-sm font-bold text-white transition active:translate-y-0.5 sm:px-6 sm:text-base"
              style={{
                background: "#2d4a3b",
                boxShadow: "0 3px 0 #1a2f24",
              }}
            >
              {isLast ? "⚔️ 亮兵器·看结果 ▶" : "下一题 ▶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
