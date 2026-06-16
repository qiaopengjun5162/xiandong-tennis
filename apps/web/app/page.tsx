"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { QuizScreen } from "@/components/quiz-screen"
import { ResultScreen } from "@/components/result-screen"
import type { OptionValue } from "@xiandong/core"

type AppState =
  | { kind: "welcome" }
  | { kind: "quiz" }
  | { kind: "result"; answers: OptionValue[]; resultType: string }

export default function Home() {
  const [state, setState] = useState<AppState>({ kind: "welcome" })

  const startQuiz = () => setState({ kind: "quiz" })

  const finishQuiz = (answers: OptionValue[], resultType: string) => {
    setState({ kind: "result", answers, resultType })
  }

  const restart = () => setState({ kind: "welcome" })

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-[#e0e0e0]">
      {state.kind === "welcome" && <WelcomeScreen onStart={startQuiz} />}
      {state.kind === "quiz" && <QuizScreen onFinish={finishQuiz} />}
      {state.kind === "result" && (
        <ResultScreen
          answers={state.answers}
          resultType={state.resultType}
          onRestart={restart}
        />
      )}
    </main>
  )
}
