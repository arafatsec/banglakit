// Type definitions for banglakit.
export type Lang = "bn" | "en";

export function toBanglaDigits(input: string | number): string;
export function toEnglishDigits(input: string | number): string;
export function numberToWords(value: number | string, lang?: Lang): string;
export function takaInWords(amount: number | string, lang?: Lang): string;
export function formatNumber(value: number | string, options?: { bangla?: boolean }): string;

export interface BanglaDate {
  year: number; month: number; day: number;
  monthName: string; monthNameEn: string; weekday: string; season: string;
  /** "৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ" */ text: string;
  /** "শুক্রবার, ৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল" */ long: string;
}
export function toBanglaDate(date?: string | Date): BanglaDate;
/** Returns "YYYY-MM-DD". month: 1 = Boishakh. */
export function fromBanglaDate(year: number, month: number, day: number): string;
export function gregorianInBangla(date?: string | Date): string;
export const MONTHS: readonly string[];
export const MONTHS_EN: readonly string[];
export const WEEKDAYS: readonly string[];
export const SEASONS: readonly string[];

export function phoneticToBangla(input: string): string;

export interface Division { id: string; bn: string; en: string; districts: number }
export interface District { id: string; bn: string; en: string; website: string; division: string; upazilas: number }
export interface Upazila { id: string; bn: string; website: string; district: string; division: string }
export interface AreaHit { type: "division" | "district" | "upazila"; id: string; bn: string; en?: string; district?: string; division?: string; website?: string }
export function listDivisions(): Division[];
export function listDistricts(division?: string): District[];
export function listUpazilas(district: string): Upazila[];
export function findArea(query: string, options?: { limit?: number }): AreaHit[];
export const areasSource: { url: string; publisher: string; retrieved: string; counts: { divisions: number; districts: number; upazilas: number } };

export interface Holiday {
  date: string; weekday: string; bn: string;
  type: "general" | "executive" | "optional";
  group?: "muslim" | "hindu" | "christian" | "buddhist" | "ethnic";
  moon?: boolean; region?: string; name_bn: string; name_en: string;
}
export function listHolidays(year?: number, options?: { type?: "public" | "general" | "executive" | "optional" | "all"; month?: number }): Holiday[];
export function holidaysOn(date: string): Holiday[];
export function holidaySource(year: number): { url: string; publisher: string; note: string };
export const holidayYears: number[];

export type PhoneResult =
  | { valid: true; e164: string; local: string; display: string; operator: string }
  | { valid: false; input: string; reason: string };
export function parsePhone(input: string): PhoneResult;
