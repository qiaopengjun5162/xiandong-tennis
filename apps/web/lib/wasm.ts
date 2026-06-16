import type { OptionValue, PersonalityInfo, Question } from '@xiandong/core';

type WasmModule = {
  default(): Promise<void>;
  get_questions(): Question[];
  calculate_result(answers_json: string): string;
  get_personality_info(key: string): PersonalityInfo | undefined;
};

let wasmModule: WasmModule | null = null;

export async function loadWasm(): Promise<WasmModule> {
  if (wasmModule) return wasmModule;
  const mod = (await import('../../public/pkg/xiandong_tennis_core')) as WasmModule;
  await mod.default();
  wasmModule = mod;
  return mod;
}

export async function getQuestions(): Promise<Question[]> {
  const mod = await loadWasm();
  return mod.get_questions();
}

export async function calculateResult(answers: OptionValue[]): Promise<string> {
  const mod = await loadWasm();
  return mod.calculate_result(JSON.stringify(answers));
}

export async function getPersonalityInfo(key: string): Promise<PersonalityInfo | undefined> {
  const mod = await loadWasm();
  return mod.get_personality_info(key);
}
