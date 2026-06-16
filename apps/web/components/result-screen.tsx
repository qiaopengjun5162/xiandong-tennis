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

function buildShareText(info: PersonalityInfo): string {
  return [
    `🎾 我的网球兵器是：${info.emoji} ${info.name}`,
    `「${info.title}」`,
    ``,
    `⚡ ${info.style}`,
    `💬 ${info.quote}`,
    ``,
    `来测测你是什么兵器 👉 https://qiaopengjun5162.github.io/xiandong-tennis/?r=${info.key}`,
  ].join("\n")
}

function getResultUrl(resultType: string): string {
  if (typeof window === "undefined") {
    return `https://qiaopengjun5162.github.io/xiandong-tennis/?r=${resultType}`
  }
  const url = new URL(window.location.href)
  url.search = `?r=${resultType}`
  return url.toString()
}

export function ResultScreen({
  answers,
  resultType,
  onRestart,
}: ResultScreenProps) {
  const [info, setInfo] = useState<PersonalityInfo | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPersonalityInfo(resultType).then((data) => {
      if (data) {
        setInfo(data)
        if (answers.length > 0) {
          submitResult(answers, resultType)
        }
      }
    })
  }, [resultType, answers])

  useEffect(() => {
    if (!copiedText && !copiedLink) return
    const t = setTimeout(() => {
      setCopiedText(false)
      setCopiedLink(false)
    }, 2000)
    return () => clearTimeout(t)
  }, [copiedText, copiedLink])

  const handleShareCard = async () => {
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
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, which: "text" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }
    if (which === "text") setCopiedText(true)
    else setCopiedLink(true)
  }

  const handleCopyText = () => {
    if (!info) return
    copyToClipboard(buildShareText(info), "text")
  }

  const handleCopyLink = () => {
    copyToClipboard(getResultUrl(resultType), "link")
  }

  const handleSystemShare = async () => {
    if (!info || typeof navigator === "undefined") return
    const shareData = {
      title: `我的网球兵器：${info.name}`,
      text: buildShareText(info),
      url: getResultUrl(resultType),
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await copyToClipboard(buildShareText(info), "text")
      }
    } catch {
      // User cancelled or share failed
    }
  }

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-4 text-4xl" style={{ color: "#cb7b3c" }}>
          ⚔️
        </div>
        <p style={{ color: "#7a541f" }}>锻造兵器卡中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="px-6 py-4 text-center" style={{ background: "#ecd9b4" }}>
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

        <div className="mb-6 w-full max-w-[420px]">
          <pre
            className="whitespace-pre-wrap rounded-[32px] p-4 text-sm"
            style={{
              background: "#f7ebd0",
              color: "#2c3a1f",
              lineHeight: 1.6,
              fontFamily: "inherit",
            }}
          >
            {buildShareText(info)}
          </pre>
          <button
            onClick={handleCopyText}
            className="mt-3 w-full rounded-full py-2 text-sm font-bold transition active:translate-y-0.5"
            style={{
              background: copiedText ? "#2d4a3b" : "#cb7b3c",
              color: "white",
              boxShadow: "0 3px 0 #8b4c2a",
            }}
          >
            {copiedText ? "✅ 已复制，去发朋友圈/群聊" : "📋 复制分享文案"}
          </button>
        </div>

        <div className="mb-6 flex w-full max-w-[420px] flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSystemShare}
            className="flex-1 rounded-full px-5 py-3 text-base font-bold text-white transition active:translate-y-0.5"
            style={{
              background: "#2d4a3b",
              boxShadow: "0 3px 0 #1a2f24",
            }}
          >
            🔗 一键分享
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 rounded-full px-5 py-3 text-base font-bold text-white transition active:translate-y-0.5"
            style={{
              background: "#cb7b3c",
              boxShadow: "0 3px 0 #8b4c2a",
            }}
          >
            {copiedLink ? "✅ 链接已复制" : "📎 复制结果链接"}
          </button>
        </div>

        <div className="mb-6 text-center text-sm" style={{ color: "#9b6e3a" }}>
          🔪 也可以下载兵器卡 PNG 发朋友圈
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={handleShareCard}
            disabled={generating}
            className="rounded-full px-6 py-3 text-base font-bold text-white transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "#2d4a3b",
              boxShadow: "0 3px 0 #1a2f24",
            }}
          >
            {generating ? "生成中..." : "⬇️ 下载兵器卡 PNG"}
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
