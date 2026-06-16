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
        className="w-[350px] rounded-2xl border border-[#82a68c] bg-[#111] p-8 text-center"
      >
        <div className="mb-2 text-5xl">{info.emoji}</div>
        <h2 className="mb-1 text-3xl font-bold text-[#c82b2b]">{info.name}</h2>
        <p className="mb-6 text-sm text-[#82a68c]">「 {info.title} 」</p>
        <div className="space-y-3 text-left text-sm text-[#aaa]">
          <p><strong className="text-[#e0e0e0]">风格：</strong>{info.style}</p>
          <p><strong className="text-[#e0e0e0]">偏好：</strong>{info.partner}</p>
          <p><strong className="text-[#e0e0e0]">场地：</strong>{info.court}</p>
          <p><strong className="text-[#e0e0e0]">格言：</strong>{info.quote}</p>
        </div>
        <div className="mt-6 border-t border-[#333] pt-4 text-xs text-[#666]">
          弦动 · 网球兵器谱
        </div>
      </div>
    );
  }
);
ShareCard.displayName = 'ShareCard';
