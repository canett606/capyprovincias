import { fold, levenshtein, mulberry32 } from "./normalize";
import type { Grade } from "./questions";

export type River = {
  id: string;
  name: string;
  number: number;
  aliases: string[];
  clue: string;
  where: string;
  major: boolean;
  d: string;
  label: readonly [number, number];
};

function course(points: ReadonlyArray<readonly [number, number]>): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
}

/** Los 22 ríos de la ficha de 5º. El trazado es propio, colocado sobre el contorno de España. */
export const RIVERS: readonly River[] = [
  {
    id: "duero",
    name: "Duero",
    number: 1,
    aliases: ["Douro"],
    clue: "Nace en Soria y cruza Castilla camino de Portugal.",
    where: "De Soria, por Valladolid y Zamora, hasta la frontera.",
    major: true,
    d: course([
      [186, 112],
      [160, 106],
      [124, 104],
      [90, 108],
      [68, 112],
    ]),
    label: [122, 96],
  },
  {
    id: "mijares",
    name: "Mijares",
    number: 2,
    aliases: ["Millars"],
    clue: "Llega al Mediterráneo por la costa de Castellón.",
    where: "Desde el interior de Teruel hasta Castellón.",
    major: false,
    d: course([
      [214, 124],
      [230, 128],
      [248, 136],
    ]),
    label: [228, 120],
  },
  {
    id: "andarax",
    name: "Andarax",
    number: 3,
    aliases: [],
    clue: "Es corto y llega al Mediterráneo por Almería.",
    where: "Interior de Almería, hacia el sureste.",
    major: false,
    d: course([
      [174, 206],
      [184, 214],
      [194, 224],
    ]),
    label: [168, 214],
  },
  {
    id: "guadalquivir",
    name: "Guadalquivir",
    number: 4,
    aliases: [],
    clue: "Pasa por Córdoba y Sevilla y sale al Atlántico.",
    where: "De Jaén a la desembocadura, entre Huelva y Cádiz.",
    major: true,
    d: course([
      [170, 186],
      [148, 196],
      [124, 206],
      [104, 216],
      [90, 226],
    ]),
    label: [136, 190],
  },
  {
    id: "mino",
    name: "Miño",
    number: 5,
    aliases: ["Minho"],
    clue: "Recorre Galicia de norte a sur y llega al Atlántico.",
    where: "Por Lugo y Ourense, hasta el sur de Galicia.",
    major: true,
    d: course([
      [58, 64],
      [50, 76],
      [40, 88],
      [24, 98],
    ]),
    label: [36, 74],
  },
  {
    id: "navia",
    name: "Navia",
    number: 6,
    aliases: [],
    clue: "Sale al Cantábrico por el oeste de Asturias.",
    where: "Occidente de Asturias.",
    major: false,
    d: course([
      [82, 73],
      [74, 66],
      [70, 58],
    ]),
    label: [86, 64],
  },
  {
    id: "bidasoa",
    name: "Bidasoa",
    number: 7,
    aliases: [],
    clue: "Hace de frontera con Francia y sale al Cantábrico.",
    where: "Entre Gipuzkoa y Francia.",
    major: false,
    d: course([
      [188, 74],
      [194, 68],
      [200, 62],
    ]),
    label: [208, 70],
  },
  {
    id: "tajo",
    name: "Tajo",
    number: 8,
    aliases: ["Tejo"],
    clue: "Pasa al sur de Madrid y sigue hacia Portugal.",
    where: "Por Toledo y Cáceres, hasta la frontera.",
    major: true,
    d: course([
      [196, 134],
      [165, 140],
      [138, 148],
      [100, 152],
      [58, 156],
    ]),
    label: [130, 140],
  },
  {
    id: "tinto",
    name: "Tinto",
    number: 9,
    aliases: [],
    clue: "Es el más oriental de los dos ríos de la ría de Huelva.",
    where: "Este de la ría de Huelva.",
    major: false,
    d: course([
      [82, 200],
      [78, 210],
      [74, 220],
    ]),
    label: [88, 208],
  },
  {
    id: "segura",
    name: "Segura",
    number: 10,
    aliases: [],
    clue: "Cruza Murcia y desemboca en el Mediterráneo.",
    where: "De la sierra de Jaén a la costa de Alicante.",
    major: false,
    d: course([
      [170, 178],
      [192, 186],
      [214, 192],
      [238, 198],
    ]),
    label: [198, 178],
  },
  {
    id: "ebro",
    name: "Ebro",
    number: 11,
    aliases: ["Ebre"],
    clue: "Cruza Zaragoza y abre un delta en Tarragona.",
    where: "Del norte de Burgos al delta, junto a Tarragona.",
    major: true,
    d: course([
      [150, 76],
      [178, 90],
      [214, 104],
      [248, 114],
      [278, 124],
    ]),
    label: [200, 90],
  },
  {
    id: "guadiana",
    name: "Guadiana",
    number: 12,
    aliases: [],
    clue: "Atraviesa La Mancha y Badajoz y llega al Atlántico.",
    where: "Por Ciudad Real y Badajoz, hasta el suroeste.",
    major: true,
    d: course([
      [162, 172],
      [130, 176],
      [96, 182],
      [72, 194],
      [58, 206],
    ]),
    label: [118, 166],
  },
  {
    id: "guadalete",
    name: "Guadalete",
    number: 13,
    aliases: [],
    clue: "Desemboca en la bahía de Cádiz.",
    where: "Norte de la provincia de Cádiz.",
    major: false,
    d: course([
      [112, 212],
      [104, 222],
      [96, 234],
    ]),
    label: [114, 226],
  },
  {
    id: "nalon",
    name: "Nalón",
    number: 14,
    aliases: [],
    clue: "Es el más largo de Asturias y sale al Cantábrico.",
    where: "Centro de Asturias.",
    major: false,
    d: course([
      [116, 72],
      [106, 64],
      [100, 58],
    ]),
    label: [122, 62],
  },
  {
    id: "ter",
    name: "Ter",
    number: 15,
    aliases: [],
    clue: "Baja del Pirineo de Girona hasta el Mediterráneo.",
    where: "Provincia de Girona.",
    major: false,
    d: course([
      [298, 86],
      [308, 92],
      [320, 100],
    ]),
    label: [300, 96],
  },
  {
    id: "guadalhorce",
    name: "Guadalhorce",
    number: 16,
    aliases: [],
    clue: "Desemboca en el Mediterráneo junto a Málaga.",
    where: "Interior de Málaga, hacia la costa.",
    major: false,
    d: course([
      [148, 208],
      [136, 220],
      [124, 234],
    ]),
    label: [148, 222],
  },
  {
    id: "llobregat",
    name: "Llobregat",
    number: 17,
    aliases: [],
    clue: "Cruza Barcelona y desemboca al sur de la ciudad.",
    where: "De norte a sur por la provincia de Barcelona.",
    major: false,
    d: course([
      [284, 92],
      [292, 102],
      [300, 116],
    ]),
    label: [278, 100],
  },
  {
    id: "odiel",
    name: "Odiel",
    number: 18,
    aliases: [],
    clue: "Es el más occidental de los dos ríos de la ría de Huelva.",
    where: "Oeste de la ría de Huelva.",
    major: false,
    d: course([
      [68, 198],
      [64, 208],
      [60, 218],
    ]),
    label: [72, 192],
  },
  {
    id: "turia",
    name: "Turia",
    number: 19,
    aliases: ["Guadalaviar"],
    clue: "Atraviesa Valencia y llega al Mediterráneo.",
    where: "Desde Teruel hasta la ciudad de Valencia.",
    major: false,
    d: course([
      [208, 128],
      [220, 142],
      [230, 154],
      [238, 162],
    ]),
    label: [214, 148],
  },
  {
    id: "vinalopo",
    name: "Vinalopó",
    number: 20,
    aliases: [],
    clue: "Recorre el interior de Alicante y casi no llega al mar.",
    where: "Interior de Alicante.",
    major: false,
    d: course([
      [220, 176],
      [228, 184],
      [234, 192],
    ]),
    label: [212, 186],
  },
  {
    id: "jucar",
    name: "Júcar",
    number: 21,
    aliases: ["Xúquer"],
    clue: "Sale de Cuenca y desemboca en el Mediterráneo, en Cullera.",
    where: "De Cuenca a la costa sur de Valencia.",
    major: false,
    d: course([
      [186, 142],
      [196, 156],
      [210, 168],
      [230, 176],
    ]),
    label: [196, 164],
  },
  {
    id: "nervion",
    name: "Nervión",
    number: 22,
    aliases: ["Nerbioi"],
    clue: "Pasa por Bilbao y desemboca en el Cantábrico.",
    where: "Bizkaia, hasta la ría de Bilbao.",
    major: false,
    d: course([
      [164, 76],
      [168, 68],
      [174, 62],
    ]),
    label: [156, 70],
  },
];

function keysOf(value: string): string[] {
  const folded = fold(value);
  const tight = folded.replace(/ /g, "");
  return folded === tight ? [folded] : [folded, tight];
}

export function getRiver(id: string): River {
  const river = RIVERS.find((item) => item.id === id);
  if (!river) throw new Error(`Río desconocido: ${id}`);
  return river;
}

export function acceptedRiverKeys(river: River): string[] {
  const keys = new Set<string>();
  for (const label of [river.name, ...river.aliases]) {
    for (const key of keysOf(label)) {
      if (key) keys.add(key);
    }
  }
  return [...keys];
}

export function riverClueSpoils(clue: string, river: River): boolean {
  const haystack = fold(clue);
  return acceptedRiverKeys(river).some((key) => key.length >= 4 && haystack.includes(key));
}

function answerKey(raw: string): string {
  return fold(raw).replace(/^(?:el |la |rio )+/, "").trim();
}

export function gradeRiver(raw: string, river: River): Grade {
  const folded = answerKey(raw);
  if (!folded) return { kind: "no" };
  const accepted = acceptedRiverKeys(river);
  if (accepted.includes(folded)) {
    const canonical = new Set(keysOf(river.name));
    const alias = river.aliases.find((label) => keysOf(label).includes(folded)) ?? null;
    return { kind: "ok", alias: canonical.has(folded) ? null : alias };
  }
  const other = RIVERS.find((item) => item.id !== river.id && acceptedRiverKeys(item).includes(folded));
  if (other) return { kind: "other", otherId: other.id };
  const distance = Math.min(...accepted.map((key) => levenshtein(key, folded)));
  if (distance === 1) return { kind: "close" };
  return { kind: "no" };
}

export function planRivers(input: { ids?: readonly string[]; seed: number; count?: number }): River[] {
  const pool = input.ids ? input.ids.flatMap((id) => RIVERS.filter((river) => river.id === id)) : [...RIVERS];
  const copy = [...pool];
  const random = mulberry32(input.seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  const count = input.count ?? copy.length;
  return copy.slice(0, Math.min(count, copy.length));
}
