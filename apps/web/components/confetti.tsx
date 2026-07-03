"use client"

import { useEffect, useRef } from "react"

const BALL_COUNT = 12
const BALL_RADIUS = 28

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  scale: number
  rotation: number
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(r / 28, r / 28)

  // Ball body
  ctx.beginPath()
  ctx.arc(0, 0, 28, 0, Math.PI * 2)
  ctx.fillStyle = "#c8e058"
  ctx.fill()

  // Seam curves
  ctx.strokeStyle = "#fff"
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(0, 0, 8, 28, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const balls: Ball[] = []
    const cx = w / 2
    const cy = h * 0.35

    for (let i = 0; i < BALL_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 5 + Math.random() * 7
      balls.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed - 6,
        scale: 0.6 + Math.random() * 1.0,
        rotation: Math.random() * Math.PI * 2,
      })
    }

    const GRAVITY = 0.25
    const BOUNCE = 0.55
    const FRICTION = 0.995
    let frame = 0
    const DURATION = 200
    let animId: number

    function draw() {
      ctx!.clearRect(0, 0, w, h)

      for (const b of balls) {
        b.x += b.vx
        b.vy += GRAVITY
        b.y += b.vy
        b.rotation += b.vx * 0.03
        b.vx *= FRICTION

        const r = BALL_RADIUS * b.scale

        // Bounce off walls
        if (b.x - r < 0) {
          b.x = r
          b.vx = Math.abs(b.vx) * BOUNCE
        }
        if (b.x + r > w) {
          b.x = w - r
          b.vx = -Math.abs(b.vx) * BOUNCE
        }
        // Bounce off floor
        if (b.y + r > h) {
          b.y = h - r
          b.vy = -Math.abs(b.vy) * BOUNCE
          b.vx *= 0.8
        }
        // Bounce off ceiling
        if (b.y - r < 0) {
          b.y = r
          b.vy = Math.abs(b.vy) * BOUNCE
        }

        const fadeIn = Math.min(1, frame / 10)
        const fadeOut =
          frame > DURATION - 30 ? Math.max(0, (DURATION - frame) / 30) : 1
        ctx!.globalAlpha = fadeIn * fadeOut

        drawBall(ctx!, b.x, b.y, r, b.rotation)
      }

      frame++
      if (frame < DURATION) {
        animId = requestAnimationFrame(draw)
      } else {
        ctx!.clearRect(0, 0, w, h)
        canvas!.style.display = "none"
      }
    }

    animId = requestAnimationFrame(draw)

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  )
}
