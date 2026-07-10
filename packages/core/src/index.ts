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

export interface CourtCounts {
  outdoor: number;
  indoor: number;
  covered: number;
  total: number;
}

export interface VenueSource {
  label: string;
  updatedOn: string | null;
}

export interface Venue {
  id: number;
  name: string;
  area: string;
  address: string;
  courts: CourtCounts;
  bookingNote: string | null;
  source: VenueSource;
}

export interface VenueListResponse {
  items: Venue[];
  limit: number;
}

export interface VenueArea {
  area: string;
  venueCount: number;
}

export interface VenueAreaListResponse {
  items: VenueArea[];
}
