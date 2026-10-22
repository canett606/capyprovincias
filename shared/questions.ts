import { fold, foldTight, levenshtein, mulberry32 } from "./normalize";
import { PROVINCES, provincesIn, type Province } from "./provinces";

export type Question = {
  provinceId: string;
  prompt: string;
  kind: "capital" | "ciudad" | "mapa";
};

export type Grade =
  | { kind: "ok"; alias: string | null }
  | { kind: "close" }
  | { kind: "other"; otherId: string }
  | { kind: "no" };

export const ROUND_SIZE = 10;

function keysOf(value: string): string[] {
  const folded = fold(value);
  const tight = foldTight(value);
  return folded === tight ? [folded] : [folded, tight];
}

export function acceptedKeys(province: Province): string[] {
  const keys = new Set<string>();
  for (const label of [province.name, ...province.aliases]) {
    for (const key of keysOf(label)) {
      if (key) keys.add(key);
    }
  }
  return [...keys];
}

export function clueSpoils(clue: string, province: Province): boolean {
  const haystack = fold(clue);
  return acceptedKeys(province).some((key) => key.length >= 4 && haystack.includes(key));
}

export function textQuestions(province: Province): Question[] {
  const questions: Question[] = [];
  if (!clueSpoils(province.capital, province)) {
    questions.push({
      provinceId: province.id,
      kind: "capital",
      prompt: `¿Qué provincia tiene como capital ${province.capital}?`,
    });
  }
  for (const city of province.cities) {
    if (clueSpoils(city, province)) continue;
    questions.push({
      provinceId: province.id,
      kind: "ciudad",
      prompt: `¿En qué provincia está ${city}?`,
    });
  }
  return questions;
}

export function mapQuestion(province: Province): Question {
  return {
    provinceId: province.id,
    kind: "mapa",
    prompt: "Escribe el nombre de la provincia marcada.",
  };
}

export function hangmanClue(province: Province): string {
  const question = textQuestions(province)[0];
  if (!question) throw new Error(`Sin pista para ${province.name}`);
  return question.prompt;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function spread(items: Question[]): Question[] {
  const list = [...items];
  for (let index = 1; index < list.length; index += 1) {
    if (list[index].provinceId !== list[index - 1].provinceId) continue;
    const swap = list.findIndex((item, itemIndex) => itemIndex > index && item.provinceId !== list[index - 1].provinceId);
    if (swap > index) [list[index], list[swap]] = [list[swap], list[index]];
  }
  return list;
}

export function planRound(input: {
  community: string;
  ids?: readonly string[];
  mode: "text" | "map";
  seed: number;
  count?: number;
}): Question[] {
  const pool = input.ids
    ? input.ids.flatMap((id) => PROVINCES.filter((province) => province.id === id))
    : provincesIn(input.community);
  const questions = input.mode === "map" ? pool.map((province) => mapQuestion(province)) : pool.flatMap((province) => textQuestions(province));
  const random = mulberry32(input.seed);
  const count = input.count ?? ROUND_SIZE;
  return spread(shuffle(questions, random).slice(0, Math.min(count, questions.length)));
}

export function gradeAnswer(raw: string, province: Province): Grade {
  const folded = fold(raw);
  if (!folded) return { kind: "no" };
  const accepted = acceptedKeys(province);
  if (accepted.includes(folded)) {
    const canonical = new Set(keysOf(province.name));
    const alias = province.aliases.find((label) => keysOf(label).includes(folded)) ?? null;
    return { kind: "ok", alias: canonical.has(folded) ? null : alias };
  }
  const other = PROVINCES.find((item) => item.id !== province.id && acceptedKeys(item).includes(folded));
  if (other) return { kind: "other", otherId: other.id };
  const distance = Math.min(...accepted.map((key) => levenshtein(key, folded)));
  if (distance === 1) return { kind: "close" };
  return { kind: "no" };
}
