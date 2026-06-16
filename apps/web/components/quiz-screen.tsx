'use client';

import { useEffect, useState } from 'react';
import { QuestionCard } from './question-card';
import { ProgressBar } from './progress-bar';
import { Button } from '@/components/ui/button';
import { calculateResult, getQuestions } from '@/lib/wasm';
import type { OptionValue, Question } from '@xiandong/core';

interface QuizScreenProps {
  onFinish: (answers: OptionValue[], resultType: string) => void;
}

export function QuizScreen({ onFinish }: QuizScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<OptionValue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load questions from WASM core on mount.
  useEffect(() => {
    getQuestions().then((qs) => {
      setQuestions(qs);
      setLoading(false);
    });
  }, []);

  const handleSelect = async (value: OptionValue) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (newAnswers.length === questions.length) {
      const resultType = await calculateResult(newAnswers);
      onFinish(newAnswers, resultType);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setAnswers((prev) => prev.slice(0, -1));
    }
  };

  if (loading || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">兵器库加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <div className="mt-8 flex-1">
        <QuestionCard
          question={questions[currentIndex]}
          onSelect={handleSelect}
        />
      </div>
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="border-[#333] bg-transparent text-[#888]"
        >
          上一题
        </Button>
      </div>
    </div>
  );
}
