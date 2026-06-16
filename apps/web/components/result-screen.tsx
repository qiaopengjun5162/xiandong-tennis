'use client';

import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { ShareCard } from './share-card';
import { getPersonalityInfo } from '@/lib/wasm';
import { submitResult } from '@/lib/api';
import type { OptionValue, PersonalityInfo } from '@xiandong/core';

interface ResultScreenProps {
  answers: OptionValue[];
  resultType: string;
  onRestart: () => void;
}

export function ResultScreen({ answers, resultType, onRestart }: ResultScreenProps) {
  const [info, setInfo] = useState<PersonalityInfo | null>(null);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load personality info once the result key is known, then submit to backend.
  useEffect(() => {
    getPersonalityInfo(resultType).then((data) => {
      if (data) {
        setInfo(data);
        submitResult(answers, resultType);
      }
    });
  }, [resultType, answers]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#111',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `弦动-兵器谱-${resultType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">锻造兵器卡中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-8">
      <div className="mb-6 flex flex-col items-center">
        <ShareCard info={info} ref={cardRef} />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          onClick={handleShare}
          disabled={generating}
          className="bg-[#c82b2b] text-[#e0e0e0] hover:bg-[#a02020]"
        >
          {generating ? '生成中...' : '生成兵器卡'}
        </Button>
        <Button
          onClick={onRestart}
          variant="outline"
          className="border-[#82a68c] bg-transparent text-[#82a68c]"
        >
          重新淬炼
        </Button>
      </div>
    </div>
  );
}
