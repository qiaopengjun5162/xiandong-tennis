"use client"

import { useEffect, useState } from "react"
import { fetchStats } from "@/lib/api"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetchStats().then((stats) => {
      if (stats) setTotal(stats.total)
    })
  }, [])

  return (
    <div className="flex flex-col">
      <div
        className="px-6 py-6 text-center sm:px-8"
        style={{
          background: "#2d4a3b",
          borderBottom: "4px solid #cb7b3c",
        }}
      >
        <h1
          className="flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl"
          style={{ color: "#fae67a", letterSpacing: "-1px" }}
        >
          <span>⚔️</span>
          <span>SBTI · 网球兵器谱</span>
          <span
            className="rounded-full px-3 py-1 text-sm"
            style={{
              background: "#cb7b3c",
              color: "#1f2a1b",
              fontWeight: "bold",
            }}
          >
            武器人格版
          </span>
        </h1>
        <p
          className="mt-2 text-sm italic opacity-85 sm:text-base"
          style={{ color: "#fae67a" }}
        >
          16题鉴定你的球场兵种 · 是锤是刀是加特林？
        </p>
      </div>

      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
        style={{ background: "#fef5e6" }}
      >
        <div
          className="mb-8 rounded-full px-6 py-4 text-lg font-bold"
          style={{ background: "#ecd9b4", color: "#7a541f" }}
        >
          🎾 约球前请出示兵器谱
        </div>
        {total !== null && total > 0 && (
          <p
            className="mb-4 text-sm"
            style={{ color: "#9b6e3a" }}
          >
            已有 {total} 位球友亮出兵器
          </p>
        )}
        <p className="mb-10 max-w-md text-base" style={{ color: "#3a2a1a" }}>
          16 道题，测出你在球场上是铁壁、战锤、匕首还是随缘地雷。
          截图发朋友圈，看看队友是什么兵器。
        </p>
        <button
          onClick={onStart}
          className="rounded-full px-10 py-4 text-lg font-bold text-white transition active:translate-y-0.5"
          style={{
            background: "#2d4a3b",
            boxShadow: "0 4px 0 #1a2f24",
          }}
        >
          拔刀入局 · 开始测试 ▶
        </button>
      </div>

      <div
        className="px-6 py-4 text-center text-xs"
        style={{ background: "#1f2f24", color: "#b79a60" }}
      >
        ⚡ 约球前请出示兵器谱 | 误伤队友概不负责
      </div>
    </div>
  )
}
