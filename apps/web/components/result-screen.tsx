"use client"

import { useEffect, useRef, useState } from "react"
import html2canvas from "html2canvas"
import { ShareCard } from "./share-card"
import { getPersonalityInfo } from "@/lib/wasm"
import { submitResult } from "@/lib/api"
import type { OptionValue, PersonalityInfo } from "@xiandong/core"

interface ResultScreenProps {
  answers: OptionValue[]
  resultType: string
  onRestart: () => void
}

export function ResultScreen({
  answers,
  resultType,
  onRestart,
}: ResultScreenProps) {
  const [info, setInfo] = useState<PersonalityInfo | null>(null)
  const [generating, setGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPersonalityInfo(resultType).then((data) => {
      if (data) {
        setInfo(data)
        submitResult(answers, resultType)
      }
    })
  }, [resultType, answers])

  const handleShare = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#fff5e6",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `弦动-兵器谱-${resultType}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } finally {
      setGenerating(false)
    }
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 text-4xl" style={{ color: "#cb7b3c" }}>⚔️</div>
        <p style={{ color: "#7a541f" }}>锻造兵器卡中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div
        className="px-6 py-4 text-center"
        style={{ background: "#ecd9b4" }}
      >
        <div
          className="text-sm font-bold sm:text-base"
          style={{ color: "#7a541f" }}
        >
          🏆 兵器鉴定完毕 🏆
        </div>
      </div>

      <div
        className="flex flex-col items-center px-6 py-8"
        style={{ background: "#fef5e6" }}
      >
        <div className="mb-6 flex flex-col items-center">
          <ShareCard info={info} ref={cardRef} />
        </div>

        <div
          className="mb-6 text-center text-sm"
          style={{ color: "#9b6e3a" }}
        >
          🔪 截图发球友：“我的兵器是{info.name}，你呢？”
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={handleShare}
            disabled={generating}
            className="rounded-full px-6 py-3 text-base font-bold text-white transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "#2d4a3b",
              boxShadow: "0 3px 0 #1a2f24",
            }}
          >
            {generating ? "生成中..." : "生成兵器卡"}
          </button>
          <button
            onClick={onRestart}
            className="rounded-full px-6 py-3 text-base font-bold text-white transition active:translate-y-0.5"
            style={{
              background: "#8b4c2a",
              boxShadow: "0 3px 0 #552e15",
            }}
          >
            🏏 重新锻造 / 再打一盘
          </button>
        </div>
      </div>
    </div>
  )
}
