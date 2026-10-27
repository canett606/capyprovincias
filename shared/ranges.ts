import { fold, levenshtein, mulberry32 } from "./normalize";
import type { Grade } from "./questions";

export type RangeKind = "monte" | "valle";

export type RangeUnit = {
  id: string;
  name: string;
  number: number;
  kind: RangeKind;
  aliases: string[];
  clue: string;
  where: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  label: readonly [number, number];
};

/** Las 12 unidades de la ficha de 5º. Las formas son propias, sobre el contorno de España. */
export const RANGES: readonly RangeUnit[] = [
  {
    id: "macizo-galaico",
    name: "Macizo Galaico",
    number: 1,
    kind: "monte",
    aliases: [],
    clue: "Ocupa el noroeste, entre el Cantábrico y el Atlántico.",
    where: "Galicia.",
    cx: 54,
    cy: 90,
    rx: 18,
    ry: 12,
    rotate: -8,
    label: [54, 90],
  },
  {
    id: "montes-de-leon",
    name: "Montes de León",
    number: 2,
    kind: "monte",
    aliases: ["Montes Leoneses"],
    clue: "Cierran el noroeste por el este, antes de la meseta.",
    where: "Entre Galicia y la meseta norte.",
    cx: 88,
    cy: 106,
    rx: 18,
    ry: 11,
    rotate: -10,
    label: [88, 106],
  },
  {
    id: "cordillera-cantabrica",
    name: "Cordillera Cantábrica",
    number: 3,
    kind: "monte",
    aliases: ["Montes Cantábricos"],
    clue: "Sigue la costa del norte, desde el oeste hasta cerca del País Vasco.",
    where: "Asturias, Cantabria y el norte de Castilla y León.",
    cx: 142,
    cy: 80,
    rx: 38,
    ry: 10,
    rotate: -4,
    label: [142, 80],
  },
  {
    id: "pirineos",
    name: "Pirineos",
    number: 4,
    kind: "monte",
    aliases: ["Los Pirineos", "Pirineo"],
    clue: "Separan la península de Francia, de oeste a este.",
    where: "Del País Vasco a Girona, en la frontera.",
    cx: 246,
    cy: 76,
    rx: 40,
    ry: 11,
    rotate: 12,
    label: [246, 82],
  },
  {
    id: "sistema-iberico",
    name: "Sistema Ibérico",
    number: 5,
    kind: "monte",
    aliases: [],
    clue: "Baja en diagonal desde La Rioja y Soria hacia el Mediterráneo.",
    where: "Borde este de la meseta, hacia Valencia.",
    cx: 204,
    cy: 158,
    rx: 13,
    ry: 32,
    rotate: 36,
    label: [196, 152],
  },
  {
    id: "depresion-ebro",
    name: "Depresiones del Ebro",
    number: 6,
    kind: "valle",
    aliases: ["Depresión del Ebro", "Depresion del Ebro"],
    clue: "Es el valle ancho del noreste, entre la frontera y la meseta.",
    where: "Valle del noreste, hacia el Mediterráneo.",
    cx: 248,
    cy: 112,
    rx: 26,
    ry: 12,
    rotate: 8,
    label: [250, 106],
  },
  {
    id: "cordillera-catalana",
    name: "Cordillera Catalana",
    number: 7,
    kind: "monte",
    aliases: ["Cordillera Costero Catalana", "Cordilleras Costeras Catalanas"],
    clue: "Va paralela a la costa del Mediterráneo, junto a Barcelona.",
    where: "Costa de Cataluña.",
    cx: 276,
    cy: 118,
    rx: 10,
    ry: 22,
    rotate: 10,
    label: [298, 130],
  },
  {
    id: "sistema-central",
    name: "Sistema Central",
    number: 8,
    kind: "monte",
    aliases: [],
    clue: "Cruza el centro y separa las dos submesetas.",
    where: "De la frontera portuguesa hacia el este, por el centro.",
    cx: 128,
    cy: 126,
    rx: 52,
    ry: 11,
    rotate: -8,
    label: [104, 114],
  },
  {
    id: "montes-de-toledo",
    name: "Montes de Toledo",
    number: 9,
    kind: "monte",
    aliases: [],
    clue: "Quedan al sur del Tajo y parten la submeseta sur.",
    where: "Sur de la submeseta sur.",
    cx: 142,
    cy: 164,
    rx: 34,
    ry: 9,
    rotate: -4,
    label: [118, 154],
  },
  {
    id: "sierra-morena",
    name: "Sierra Morena",
    number: 10,
    kind: "monte",
    aliases: [],
    clue: "Separa la meseta del valle que abre Andalucía hacia el Atlántico.",
    where: "Sur de la meseta, de este a oeste.",
    cx: 136,
    cy: 186,
    rx: 42,
    ry: 9,
    rotate: 6,
    label: [136, 186],
  },
  {
    id: "depresion-guadalquivir",
    name: "Depresiones del Guadalquivir",
    number: 11,
    kind: "valle",
    aliases: ["Depresión del Guadalquivir", "Depresion del Guadalquivir"],
    clue: "Es el valle triangular que se abre al Atlántico por el suroeste.",
    where: "Andalucía occidental, hacia el Atlántico.",
    cx: 98,
    cy: 206,
    rx: 28,
    ry: 10,
    rotate: 16,
    label: [108, 214],
  },
  {
    id: "sistema-betico",
    name: "Sistema Bético",
    number: 12,
    kind: "monte",
    aliases: ["Sistemas Béticos", "Cordilleras Béticas"],
    clue: "Ocupa el sur y el sureste, de Cádiz hacia Alicante.",
    where: "Sur y sureste peninsular.",
    cx: 188,
    cy: 234,
    rx: 36,
    ry: 9,
    rotate: -12,
    label: [178, 232],
  },
];

function keysOf(value: string): string[] {
  const folded = fold(value);
  const tight = folded.replace(/ /g, "");
  return folded === tight ? [folded] : [folded, tight];
}

export function getRange(id: string): RangeUnit {
  const unit = RANGES.find((item) => item.id === id);
  if (!unit) throw new Error(`Relieve desconocido: ${id}`);
  return unit;
}

export function acceptedRangeKeys(unit: RangeUnit): string[] {
  const keys = new Set<string>();
  for (const label of [unit.name, ...unit.aliases]) {
    for (const key of keysOf(label)) {
      if (key) keys.add(key);
    }
  }
  return [...keys];
}

export function rangeClueSpoils(clue: string, unit: RangeUnit): boolean {
  const haystack = fold(clue);
  return acceptedRangeKeys(unit).some((key) => key.length >= 4 && haystack.includes(key));
}

function answerKey(raw: string): string {
  return fold(raw).replace(/^(?:los |las |el |la )+/, "").trim();
}

export function gradeRange(raw: string, unit: RangeUnit): Grade {
  const folded = answerKey(raw);
  if (!folded) return { kind: "no" };
  const accepted = acceptedRangeKeys(unit);
  if (accepted.includes(folded)) {
    const canonical = new Set(keysOf(unit.name));
    const alias = unit.aliases.find((label) => keysOf(label).includes(folded)) ?? null;
    return { kind: "ok", alias: canonical.has(folded) ? null : alias };
  }
  const other = RANGES.find((item) => item.id !== unit.id && acceptedRangeKeys(item).includes(folded));
  if (other) return { kind: "other", otherId: other.id };
  const distance = Math.min(...accepted.map((key) => levenshtein(key, folded)));
  if (distance === 1) return { kind: "close" };
  return { kind: "no" };
}

export function planRanges(input: { ids?: readonly string[]; seed: number; count?: number }): RangeUnit[] {
  const pool = input.ids ? input.ids.flatMap((id) => RANGES.filter((unit) => unit.id === id)) : [...RANGES];
  const copy = [...pool];
  const random = mulberry32(input.seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  const count = input.count ?? copy.length;
  return copy.slice(0, Math.min(count, copy.length));
}
