// Type definitions for banglakit.
export const version: string;

export type Lang = "bn" | "en";

export function toBanglaDigits(input: string | number): string;
export function toEnglishDigits(input: string | number): string;
export function numberToWords(value: number | string | bigint, lang?: Lang): string;
export function takaInWords(amount: number | string, lang?: Lang): string;
export function formatNumber(value: number | string, options?: { bangla?: boolean }): string;
export function formatTaka(amount: number | string, options?: { bangla?: boolean; symbol?: boolean }): string;
export function ordinal(value: number | string | bigint, lang?: Lang): string;
export function formatPercent(value: number | string, options?: { bangla?: boolean }): string;
export function percentInWords(value: number | string, lang?: Lang): string;

export interface BanglaDate {
  year: number; month: number; day: number;
  monthName: string; monthNameEn: string; weekday: string; season: string;
  /** "revised-2019" from 14 April 2019, otherwise "revised-1402". */
  rules: "revised-2019" | "revised-1402";
  /** Set for dates before 14 April 1995. */
  note?: string;
  /** "৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ" */
  text: string;
  /** "শুক্রবার, ৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল" */
  long: string;
}
export function toBanglaDate(date?: string | Date): BanglaDate;
/** Returns "YYYY-MM-DD". month: 1 = Boishakh. Years 1426 and later use the 2019 revision. */
export function fromBanglaDate(year: number, month: number, day: number): string;
export function gregorianInBangla(date?: string | Date): string;
export const MONTHS: readonly string[];
export const MONTHS_EN: readonly string[];
export const WEEKDAYS: readonly string[];
export const WEEKDAYS_EN: readonly string[];
export const SEASONS: readonly string[];
export const GREGORIAN_MONTHS: readonly string[];
export const RITU: readonly { bn: string; en: string; months: readonly number[] }[];

export interface HijriDate {
  year: number; month: number; day: number;
  monthName: string; monthNameEn: string;
  calendar: "tabular-islamic"; note: string; text: string;
}
export function toHijri(date?: string | Date): HijriDate;
export function fromHijri(year: number, month: number, day: number): string;
export function isHijriLeap(year: number): boolean;
export const HIJRI_MONTHS_BN: readonly string[];
export const HIJRI_MONTHS_EN: readonly string[];
export const HIJRI_NOTE: string;

export interface BanglaTime {
  text: string; digits: string; hour: number; minute: number; hour12: number;
  period: string; periodEn: string; note: string;
}
export function formatTime(input: string): BanglaTime;

export function phoneticToBangla(input: string): string;
export function normalizeBangla(input: string): string;
export function romanize(input: string, options?: { style?: "iso" | "ascii" }): string;
export function compareBangla(a: string, b: string): number;
export function sortBangla(items: readonly string[]): string[];
export function countSyllables(input: string): number;
export function countWords(input: string): { tokens: number; bangla: number };
export function splitSentences(input: string): string[];
export function banglaStopwords(): string[];
export function isStopword(word: string): boolean;
export function removeStopwords(input: string): string;

export interface Division { id: string; bn: string; en: string; code: string; districts: number }
export interface District { id: string; bn: string; en: string; code: string; website: string; division: string; upazilas: number }
export interface Upazila { id: string; bn: string; en: string; website: string; district: string; division: string }
export interface AreaHit { type: "division" | "district" | "upazila"; id: string; bn: string; en: string; code?: string; district?: string; division?: string; website?: string }
export function listDivisions(): Division[];
export function listDistricts(division?: string): District[];
export function listUpazilas(district: string): Upazila[];
export function findArea(query: string, options?: { limit?: number }): AreaHit[];
export const areasSource: { url: string; publisher: string; retrieved: string; counts: { divisions: number; districts: number; upazilas: number }; geocodes: { url: string; publisher: string; retrieved: string } };

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
  | { valid: true; e164: string; local: string; display: string; operator: string; operator_bn: string; prefix: string; mnp: string }
  | { valid: false; input: string; reason: string };
export function parsePhone(input: string): PhoneResult;

export type IdResult =
  | { valid: true; checks: "format only"; digits: string; length: number; kind: string; birthYear?: number; assigned?: "not checked" }
  | { valid: false; checks: "format only"; input: string; reason: string; digits?: string; length?: number; legacy?: boolean };
export function parseNid(input: string): IdResult;
export function parseTin(input: string): IdResult;
export function parseBin(input: string): IdResult;
export function parsePostcode(input: string): IdResult;
