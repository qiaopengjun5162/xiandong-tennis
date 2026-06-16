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
  // webpackIgnore keeps the bundler from trying to resolve the WASM glue at build time;
  // the browser loads it from the public URL at runtime.
  // @ts-ignore - wasm-pack output is loaded from public URL at runtime
  const mod = (await import(/* webpackIgnore: true */ '/pkg/xiandong_tennis_core.js')) as WasmModule;
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
