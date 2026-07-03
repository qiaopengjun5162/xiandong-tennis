export type OptionValue = 'A' | 'B' | 'C' | 'D';
export type AnswerSlot = OptionValue | null;

export interface Question {
  id: number;
  text: string;
  options: Array<[string, OptionValue]>;
}

export interface PersonalityInfo {
  key: string;
  name: string;
  emoji: string;
  title: string;
  style: string;
  partner: string;
  court: string;
  quote: string;
  funny_desc: string;
}

export type WeaponType =
  | 'SHIELD'
  | 'HAMMER'
  | 'DAGGER'
  | 'POTATO'
  | 'SWISS_KNIFE'
  | 'CHAIN_MACE'
  | 'LANCE'
  | 'KATANA';
