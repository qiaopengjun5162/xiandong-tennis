import type { OptionValue, PersonalityInfo, Question } from '@xiandong/core';

declare module '/pkg/xiandong_tennis_core.js' {
  export default function init(): Promise<void>;
  export function get_questions(): Question[];
  export function calculate_result(answers_json: string): string;
  export function get_personality_info(key: string): PersonalityInfo | undefined;
}
