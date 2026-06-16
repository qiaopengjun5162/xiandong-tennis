"use client"

import { useEffect, useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { QuizScreen } from "@/components/quiz-screen"
import { ResultScreen } from "@/components/result-screen"
import type { OptionValue } from "@xiandong/core"

type AppState =
  | { kind: "welcome" }
  | { kind: "quiz" }
  | { kind: "result"; answers: OptionValue[]; resultType: string }

function getResultTypeFromUrl(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get("r")
}

export default function Home() {
  const [state, setState] = useState<AppState>({ kind: "welcome" })

  useEffect(() => {
    const resultType = getResultTypeFromUrl()
    if (resultType) {
      setState({ kind: "result", answers: [], resultType })
    }
  }, [])

  const startQuiz = () => setState({ kind: "quiz" })

  const finishQuiz = (answers: OptionValue[], resultType: string) => {
    setState({ kind: "result", answers, resultType })
  }

  const restart = () => setState({ kind: "welcome" })

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(145deg, #1e2b2c 0%, #0f1a1a 100%)",
      }}
    >
      <div
        className="w-full max-w-[800px] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "#fef5e6",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(210,180,140,0.15) 2%, transparent 2.5%)",
          backgroundSize: "28px 28px",
          borderRadius: "64px 48px 64px 48px",
          boxShadow:
            "0 25px 45px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,245,200,0.6)",
        }}
      >
        {state.kind === "welcome" && <WelcomeScreen onStart={startQuiz} />}
        {state.kind === "quiz" && <QuizScreen onFinish={finishQuiz} />}
        {state.kind === "result" && (
          <ResultScreen
            answers={state.answers}
            resultType={state.resultType}
            onRestart={restart}
          />
        )}
      </div>
    </main>
  )
}
