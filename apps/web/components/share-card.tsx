'use client';

import { forwardRef } from 'react';
import type { PersonalityInfo } from '@xiandong/core';

interface ShareCardProps {
  info: PersonalityInfo;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ info }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full max-w-[420px] overflow-hidden p-6 text-center sm:p-8"
        style={{
          backgroundColor: "#fff5e6",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(210,180,140,0.15) 2%, transparent 2.5%)",
          backgroundSize: "28px 28px",
          border: "1px solid #efcf95",
          borderRadius: "48px",
        }}
      >
        <div className="mb-2 text-6xl">{info.emoji}</div>
        <h2
          className="mb-1 text-3xl font-extrabold sm:text-4xl"
          style={{
            background: "linear-gradient(135deg, #b45f2b, #7a3e18)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {info.name}
        </h2>
        <div
          className="mx-auto mb-6 inline-block rounded-full px-4 py-1 text-sm font-bold"
          style={{ background: "#f2e0c0", color: "#7a3e18" }}
        >
          {info.title}
        </div>

        <div
          className="space-y-3 rounded-[32px] p-4 text-left text-sm sm:text-base"
          style={{ background: "#f7ebd0", color: "#2c3a1f", lineHeight: 1.6 }}
        >
          <p>
            <strong style={{ color: "#b45f2b" }}>⚡ 打球风格：</strong>
            {info.style}
          </p>
          <p>
            <strong style={{ color: "#b45f2b" }}>🤝 约球偏好：</strong>
            {info.partner}
          </p>
          <p>
            <strong style={{ color: "#b45f2b" }}>📍 场地要求：</strong>
            {info.court}
          </p>
          <p>
            <strong style={{ color: "#b45f2b" }}>😂 兵器解析：</strong>
            {info.funny_desc}
          </p>
          <p>
            <strong style={{ color: "#b45f2b" }}>💬 杀人名言：</strong>
            {info.quote}
          </p>
        </div>

        <div
          className="mt-6 border-t pt-4 text-xs"
          style={{ borderColor: "#efcf95", color: "#9b6e3a" }}
        >
          弦动 · 网球兵器谱 · {info.key}
        </div>
      </div>
    );
  }
);
ShareCard.displayName = 'ShareCard';
