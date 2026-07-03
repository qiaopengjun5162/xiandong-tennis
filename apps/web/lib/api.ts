import type { AnswerSlot } from "@xiandong/core"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function submitResult(
  answers: AnswerSlot[],
  resultType: string
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, result_type: resultType }),
    })
  } catch {
    // Silent fail: don't block user experience.
  }
}

export interface StatsResponse {
  total: number
  distribution: Record<string, { count: number }>
}

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/results/stats`)
    if (!res.ok) return null
    return (await res.json()) as StatsResponse
  } catch {
    return null
  }
}
