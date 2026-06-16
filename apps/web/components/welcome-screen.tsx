import { Button } from "@/components/ui/button"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-widest text-[#c82b2b]">
        弦动 · 兵器谱
      </h1>
      <p className="mb-2 text-lg text-[#82a68c]">16 题鉴定你的球场兵器</p>
      <p className="mb-10 text-sm text-[#888]">是锤是刀是加特林？</p>
      <Button
        onClick={onStart}
        className="border border-[#82a68c] bg-transparent px-10 py-6 text-lg text-[#82a68c] hover:bg-[#82a68c] hover:text-[#0a0a0a]"
      >
        拔刀入局
      </Button>
    </div>
  )
}
