import type { Grade } from "./questions";
import { levenshtein, mulberry32 } from "./normalize";

const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  à: "a",
  è: "e",
  ò: "o",
  ï: "i",
};

/** Minúsculas, sin tildes. La ce con cedilla se queda, porque en març cuenta. */
export function plainKey(value: string): string {
  let out = "";
  for (const char of value.trim().toLowerCase()) {
    if (char === "ç") {
      out += "ç";
      continue;
    }
    out += ACCENTS[char] ?? char;
  }
  return out.replace(/[^a-zç]/g, "");
}

export type CalendarKind = "dia" | "mes";

export type CalendarItem = {
  id: string;
  name: string;
  spanish: string;
  kind: CalendarKind;
  order: number;
  note?: string;
};

export type NounGender = "masculi" | "femeni";
export type NounNumber = "singular" | "plural";
export type NounArticle = "el" | "la" | "l'" | "els" | "les";

export type Noun = {
  id: string;
  word: string;
  gender: NounGender;
  number: NounNumber;
  article: NounArticle;
  spanish: string;
  note: string;
  trap: boolean;
};

function day(order: number, name: string, spanish: string, note?: string): CalendarItem {
  return { id: plainKey(name), name, spanish, kind: "dia", order, note };
}

function month(order: number, name: string, spanish: string, note?: string): CalendarItem {
  return { id: plainKey(name), name, spanish, kind: "mes", order, note };
}

/** Los 7 días del cartel. En el cartel, dijous salía repetido: el jueves es uno solo. */
export const DAYS: readonly CalendarItem[] = [
  day(1, "Dilluns", "lunes"),
  day(2, "Dimarts", "martes"),
  day(3, "Dimecres", "miércoles"),
  day(4, "Dijous", "jueves"),
  day(5, "Divendres", "viernes"),
  day(6, "Dissabte", "sábado"),
  day(7, "Diumenge", "domingo"),
];

/** Los 12 meses del cartel, con la grafía del valenciano de la escuela. */
export const MONTHS: readonly CalendarItem[] = [
  month(1, "Gener", "enero", "Enero es gener."),
  month(2, "Febrer", "febrero", "Sin la o de febrero."),
  month(3, "Març", "marzo", "Con cedilla: Març. No vale marc ni marzo."),
  month(4, "Abril", "abril", "Se escribe igual que en castellano."),
  month(5, "Maig", "mayo", "Mayo es maig."),
  month(6, "Juny", "junio", "Junio es juny."),
  month(7, "Juliol", "julio", "Julio es juliol."),
  month(8, "Agost", "agosto", "Agosto es agost."),
  month(9, "Setembre", "septiembre", "Septiembre es setembre."),
  month(10, "Octubre", "octubre", "Se escribe igual que en castellano."),
  month(11, "Novembre", "noviembre", "Noviembre es novembre."),
  month(12, "Desembre", "diciembre", "Diciembre es desembre."),
];

export const CALENDAR: readonly CalendarItem[] = [...DAYS, ...MONTHS];
export const SCHOOL_DAYS = DAYS.slice(0, 5);
export const WEEKEND_DAYS = DAYS.slice(5);
export const MONTHS_FIRST = MONTHS.slice(0, 6);
export const MONTHS_SECOND = MONTHS.slice(6);

export const NOUN_PRACTICE = 12;
export const NOUN_EXAM = 16;

function noun(
  word: string,
  gender: NounGender,
  number: NounNumber,
  article: NounArticle,
  spanish: string,
  note: string,
  trap = false,
): Noun {
  return { id: plainKey(word), word, gender, number, article, spanish, note, trap };
}

/**
 * Paraules de primaria para el examen de gènere i nombre.
 * Las marcadas como trampa son las que no se adivinan solo por la última letra.
 */
export const NOUNS: readonly Noun[] = [
  noun("llibre", "masculi", "singular", "el", "libro", "Uno solo y no acaba en -a: masculí."),
  noun("gos", "masculi", "singular", "el", "perro", "Uno solo y no acaba en -a: masculí."),
  noun("cotxe", "masculi", "singular", "el", "coche", "Uno solo y no acaba en -a: masculí."),
  noun("xiquet", "masculi", "singular", "el", "niño", "Uno solo y no acaba en -a: masculí."),
  noun("nen", "masculi", "singular", "el", "niño", "Uno solo y no acaba en -a: masculí."),
  noun("pare", "masculi", "singular", "el", "padre", "Uno solo y no acaba en -a: masculí."),
  noun("dia", "masculi", "singular", "el", "día", "Acaba en -a, pero es masculí: el dia.", true),
  noun("mapa", "masculi", "singular", "el", "mapa", "Acaba en -a, pero es masculí: el mapa.", true),
  noun("problema", "masculi", "singular", "el", "problema", "Acaba en -a, pero es masculí: el problema.", true),
  noun("riu", "masculi", "singular", "el", "río", "Uno solo y no acaba en -a: masculí."),
  noun("arbre", "masculi", "singular", "l'", "árbol", "Empieza por vocal: l'arbre. Masculí singular.", false),
  noun("quadern", "masculi", "singular", "el", "cuaderno", "Uno solo y no acaba en -a: masculí."),
  noun("peix", "masculi", "singular", "el", "pez", "Uno solo y no acaba en -a: masculí."),
  noun("cavall", "masculi", "singular", "el", "caballo", "Uno solo y no acaba en -a: masculí."),
  noun("amic", "masculi", "singular", "l'", "amigo", "Empieza por vocal: l'amic. Masculí singular."),
  noun("planeta", "masculi", "singular", "el", "planeta", "Acaba en -a, pero es masculí: el planeta.", true),
  noun("home", "masculi", "singular", "l'", "hombre", "La h no suena: l'home, no el home.", true),
  noun("gat", "masculi", "singular", "el", "gato", "Uno solo y no acaba en -a: masculí."),

  noun("casa", "femeni", "singular", "la", "casa", "Acaba en -a y es uno solo: femení."),
  noun("taula", "femeni", "singular", "la", "mesa", "Acaba en -a y es uno solo: femení."),
  noun("cadira", "femeni", "singular", "la", "silla", "Acaba en -a y es uno solo: femení."),
  noun("xiqueta", "femeni", "singular", "la", "niña", "Acaba en -a y es uno solo: femení."),
  noun("nena", "femeni", "singular", "la", "niña", "Acaba en -a y es uno solo: femení."),
  noun("mare", "femeni", "singular", "la", "madre", "Acaba en -e y es femení: la mare.", true),
  noun("flor", "femeni", "singular", "la", "flor", "No acaba en -a y es femení: la flor.", true),
  noun("nit", "femeni", "singular", "la", "noche", "No acaba en -a y es femení: la nit.", true),
  noun("mà", "femeni", "singular", "la", "mano", "No acaba en -a y es femení: la mà.", true),
  noun("ciutat", "femeni", "singular", "la", "ciudad", "No acaba en -a y es femení: la ciutat.", true),
  noun("escola", "femeni", "singular", "l'", "escuela", "Empieza por vocal: l'escola. Femení singular."),
  noun("pilota", "femeni", "singular", "la", "pelota", "Acaba en -a y es uno solo: femení."),
  noun("porta", "femeni", "singular", "la", "puerta", "Acaba en -a y es uno solo: femení."),
  noun("foto", "femeni", "singular", "la", "foto", "Acaba en -o, pero es femení: la foto.", true),
  noun("moto", "femeni", "singular", "la", "moto", "Acaba en -o, pero es femení: la moto.", true),
  noun("llet", "femeni", "singular", "la", "leche", "No acaba en -a y es femení: la llet.", true),
  noun("dent", "femeni", "singular", "la", "diente", "No acaba en -a y es femení: la dent.", true),
  noun("classe", "femeni", "singular", "la", "clase", "Acaba en -e, no en -a, y es femení: la classe.", true),

  noun("llibres", "masculi", "plural", "els", "libros", "Más de un llibre: els llibres."),
  noun("gossos", "masculi", "plural", "els", "perros", "Más de un gos. La ese se dobla: els gossos.", true),
  noun("cotxes", "masculi", "plural", "els", "coches", "Más de un cotxe: els cotxes."),
  noun("xiquets", "masculi", "plural", "els", "niños", "Más de un xiquet: els xiquets."),
  noun("nens", "masculi", "plural", "els", "niños", "Más de un nen: els nens."),
  noun("pares", "masculi", "plural", "els", "padres", "Más de un pare: els pares."),
  noun("dies", "masculi", "plural", "els", "días", "Viene de dia. Acaba en -es, pero es masculí: els dies.", true),
  noun("mapes", "masculi", "plural", "els", "mapas", "Viene de mapa. Sigue siendo masculí: els mapes.", true),
  noun("problemes", "masculi", "plural", "els", "problemas", "Viene de problema. Sigue siendo masculí: els problemes.", true),
  noun("peixos", "masculi", "plural", "els", "peces", "Más de un peix: els peixos.", true),
  noun("cavalls", "masculi", "plural", "els", "caballos", "Más de un cavall: els cavalls."),
  noun("amics", "masculi", "plural", "els", "amigos", "Más de un amic: els amics."),
  noun("planetes", "masculi", "plural", "els", "planetas", "Viene de planeta. Sigue siendo masculí: els planetes.", true),
  noun("arbres", "masculi", "plural", "els", "árboles", "Más de un arbre: els arbres."),
  noun("rius", "masculi", "plural", "els", "ríos", "Más de un riu: els rius."),
  noun("quaderns", "masculi", "plural", "els", "cuadernos", "Más de un quadern: els quaderns."),
  noun("homes", "masculi", "plural", "els", "hombres", "Más de un home: els homes."),
  noun("gats", "masculi", "plural", "els", "gatos", "Más de un gat: els gats."),

  noun("cases", "femeni", "plural", "les", "casas", "Más de una casa: les cases."),
  noun("taules", "femeni", "plural", "les", "mesas", "Más de una taula: les taules."),
  noun("cadires", "femeni", "plural", "les", "sillas", "Más de una cadira: les cadires."),
  noun("xiquetes", "femeni", "plural", "les", "niñas", "Más de una xiqueta: les xiquetes."),
  noun("nenes", "femeni", "plural", "les", "niñas", "Más de una nena: les nenes."),
  noun("mares", "femeni", "plural", "les", "madres", "Más de una mare: les mares."),
  noun("flors", "femeni", "plural", "les", "flores", "Más de una flor. Sigue siendo femení: les flors.", true),
  noun("nits", "femeni", "plural", "les", "noches", "Más de una nit: les nits.", true),
  noun("mans", "femeni", "plural", "les", "manos", "Más de una mà: les mans.", true),
  noun("ciutats", "femeni", "plural", "les", "ciudades", "Más de una ciutat: les ciutats.", true),
  noun("escoles", "femeni", "plural", "les", "escuelas", "Más de una escola: les escoles."),
  noun("pilotes", "femeni", "plural", "les", "pelotas", "Más de una pilota: les pilotes."),
  noun("portes", "femeni", "plural", "les", "puertas", "Más de una porta: les portes."),
  noun("fotos", "femeni", "plural", "les", "fotos", "Viene de foto. La -os no lo hace masculí: les fotos.", true),
  noun("motos", "femeni", "plural", "les", "motos", "Viene de moto: les motos. Femení plural.", true),
  noun("dents", "femeni", "plural", "les", "dientes", "Más de una dent: les dents.", true),
  noun("classes", "femeni", "plural", "les", "clases", "Más de una classe: les classes."),
  noun("finestres", "femeni", "plural", "les", "ventanas", "Más de una finestra: les finestres."),
];

export function getNoun(id: string): Noun | null {
  return NOUNS.find((item) => item.id === id) ?? null;
}

export function getCalendarItem(id: string): CalendarItem | null {
  return CALENDAR.find((item) => item.id === id) ?? null;
}

export function nounPhrase(nounItem: Noun): string {
  const spoken = nounItem.article === "l'" ? `l'${nounItem.word}` : `${nounItem.article} ${nounItem.word}`;
  const gender = nounItem.gender === "masculi" ? "masculí" : "femení";
  return `${gender} ${nounItem.number}: ${spoken}`;
}

export function nounResult(nounItem: Noun, gender: NounGender, number: NounNumber): { ok: boolean; line: string } {
  const phrase = nounPhrase(nounItem);
  const genderOk = gender === nounItem.gender;
  const numberOk = number === nounItem.number;
  if (genderOk && numberOk) return { ok: true, line: `Sí. ${phrase}.` };
  if (genderOk) return { ok: false, line: `El gènere sí. Era ${phrase}.` };
  if (numberOk) return { ok: false, line: `El nombre sí. Era ${phrase}.` };
  return { ok: false, line: `Era ${phrase}.` };
}

function shuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = mulberry32(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function planNouns(input: { ids?: readonly string[]; seed: number; count?: number }): Noun[] {
  if (input.ids) {
    const pool = input.ids.flatMap((id) => NOUNS.filter((item) => item.id === id));
    return shuffle(pool, input.seed);
  }
  if (input.count === undefined || input.count >= NOUNS.length) return shuffle(NOUNS, input.seed);
  const groups: Noun[][] = [
    NOUNS.filter((item) => item.gender === "masculi" && item.number === "singular"),
    NOUNS.filter((item) => item.gender === "femeni" && item.number === "singular"),
    NOUNS.filter((item) => item.gender === "masculi" && item.number === "plural"),
    NOUNS.filter((item) => item.gender === "femeni" && item.number === "plural"),
  ];
  const random = mulberry32(input.seed);
  const quota = Math.ceil(input.count / groups.length);
  const picked: Noun[] = [];
  for (const group of groups) {
    const traps = shuffle(
      group.filter((item) => item.trap),
      Math.floor(random() * 1_000_000_000),
    );
    const rest = shuffle(
      group.filter((item) => !item.trap),
      Math.floor(random() * 1_000_000_000),
    );
    const trapTake = Math.min(traps.length, Math.max(1, Math.floor(quota / 2)));
    const fromTraps = traps.slice(0, trapTake);
    const need = quota - fromTraps.length;
    const fromRest = rest.slice(0, need);
    const missing = need - fromRest.length;
    picked.push(...fromTraps, ...fromRest, ...traps.slice(trapTake, trapTake + missing));
  }
  return shuffle(picked, input.seed + 1).slice(0, input.count);
}

export function gradeCalendar(raw: string, item: CalendarItem): Grade {
  const key = plainKey(raw);
  if (!key) return { kind: "no" };
  const mine = plainKey(item.name);
  if (key === mine) return { kind: "ok", alias: null };
  const other = CALENDAR.find((entry) => entry.id !== item.id && plainKey(entry.name) === key);
  if (other) return { kind: "other", otherId: other.id };
  const loose = (value: string) => value.replace(/ç/g, "c");
  if (loose(key) === loose(mine) || levenshtein(key, mine) === 1 || levenshtein(loose(key), loose(mine)) === 1) {
    return { kind: "close" };
  }
  return { kind: "no" };
}

export function cedillaClose(raw: string, item: CalendarItem): boolean {
  const given = plainKey(raw);
  const wanted = plainKey(item.name);
  return given !== wanted && given.replace(/ç/g, "c") === wanted.replace(/ç/g, "c");
}

export function planCalendar(input: { ids?: readonly string[]; seed: number; count?: number; kind?: CalendarKind }): CalendarItem[] {
  const pool = input.ids
    ? input.ids.flatMap((id) => CALENDAR.filter((item) => item.id === id))
    : CALENDAR.filter((item) => !input.kind || item.kind === input.kind);
  const copy = shuffle(pool, input.seed);
  const count = input.count ?? copy.length;
  return copy.slice(0, Math.min(count, copy.length));
}
