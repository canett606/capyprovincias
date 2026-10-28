import { describe, expect, it } from "vitest";
import { applyGuess, emptyBoard } from "../shared/hangman";
import { hangKey } from "../shared/normalize";
import {
  CALENDAR,
  DAYS,
  MONTHS,
  NOUNS,
  cedillaClose,
  gradeCalendar,
  nounPhrase,
  nounResult,
  planCalendar,
  planNouns,
  type Noun,
} from "../shared/valencia";

const PAIRS: readonly (readonly [string, string])[] = [
  ["llibre", "llibres"],
  ["gos", "gossos"],
  ["cotxe", "cotxes"],
  ["xiquet", "xiquets"],
  ["nen", "nens"],
  ["pare", "pares"],
  ["dia", "dies"],
  ["mapa", "mapes"],
  ["problema", "problemes"],
  ["riu", "rius"],
  ["arbre", "arbres"],
  ["quadern", "quaderns"],
  ["peix", "peixos"],
  ["cavall", "cavalls"],
  ["amic", "amics"],
  ["planeta", "planetes"],
  ["home", "homes"],
  ["gat", "gats"],
  ["casa", "cases"],
  ["taula", "taules"],
  ["cadira", "cadires"],
  ["xiqueta", "xiquetes"],
  ["nena", "nenes"],
  ["mare", "mares"],
  ["flor", "flors"],
  ["nit", "nits"],
  ["mà", "mans"],
  ["ciutat", "ciutats"],
  ["escola", "escoles"],
  ["pilota", "pilotes"],
  ["porta", "portes"],
  ["foto", "fotos"],
  ["moto", "motos"],
  ["dent", "dents"],
  ["classe", "classes"],
];

describe("dies i mesos", () => {
  it("son los del cartel, con un solo dijous", () => {
    expect(DAYS.map((item) => item.name)).toEqual([
      "Dilluns",
      "Dimarts",
      "Dimecres",
      "Dijous",
      "Divendres",
      "Dissabte",
      "Diumenge",
    ]);
    expect(MONTHS.map((item) => item.name)).toEqual([
      "Gener",
      "Febrer",
      "Març",
      "Abril",
      "Maig",
      "Juny",
      "Juliol",
      "Agost",
      "Setembre",
      "Octubre",
      "Novembre",
      "Desembre",
    ]);
    expect(new Set(CALENDAR.map((item) => item.id)).size).toBe(CALENDAR.length);
  });

  it("acepta mayúsculas y avisa si falta la cedilla o es otro día", () => {
    const dilluns = DAYS[0];
    const març = MONTHS[2];
    const abril = MONTHS[3];
    expect(gradeCalendar("  DILLUNS ", dilluns)).toEqual({ kind: "ok", alias: null });
    expect(gradeCalendar("Març", març)).toEqual({ kind: "ok", alias: null });
    expect(gradeCalendar("marc", març)).toEqual({ kind: "close" });
    expect(cedillaClose("marc", març)).toBe(true);
    expect(gradeCalendar("marzo", març)).toEqual({ kind: "no" });
    expect(gradeCalendar("abril", abril)).toEqual({ kind: "ok", alias: null });
    expect(gradeCalendar("dijous", dilluns)).toEqual({ kind: "other", otherId: "dijous" });
    expect(gradeCalendar("julio", MONTHS[6])).toEqual({ kind: "close" });
    expect(gradeCalendar("", març)).toEqual({ kind: "no" });
  });

  it("prepara rondas de días, de meses o de los fallos", () => {
    expect(planCalendar({ seed: 1 })).toHaveLength(19);
    expect(planCalendar({ seed: 1, kind: "dia" })).toHaveLength(7);
    expect(planCalendar({ seed: 1, kind: "mes", count: 10 })).toHaveLength(10);
    const failed = planCalendar({ seed: 3, ids: ["març", "dilluns", "no-esta"] });
    expect(failed.map((item) => item.id).sort()).toEqual(["dilluns", "març"]);
  });
});

describe("gènere i nombre", () => {
  it("cada paraula tiene artículo coherente y un id único", () => {
    expect(NOUNS).toHaveLength(72);
    expect(new Set(NOUNS.map((item) => item.id)).size).toBe(NOUNS.length);
    for (const item of NOUNS) {
      expect(item.article, item.word).toBe(articleOf(item));
      expect(item.spanish.length, item.word).toBeGreaterThan(1);
      if (item.number === "plural") expect(item.word.endsWith("s"), item.word).toBe(true);
    }
  });

  it("el plural conserva el gènere del singular", () => {
    for (const [singular, plural] of PAIRS) {
      if (singular === plural) continue;
      const left = NOUNS.find((item) => item.word === singular);
      const right = NOUNS.find((item) => item.word === plural);
      expect(left?.number, singular).toBe("singular");
      expect(right?.number, plural).toBe("plural");
      expect(left?.gender, singular).toBe(right?.gender);
    }
  });

  it("mezcla los cuatro tipos y mete trampas", () => {
    for (const seed of [1, 2, 42]) {
      const practice = planNouns({ seed, count: 12 });
      expect(practice).toHaveLength(12);
      expect(new Set(practice.map((item) => item.id)).size).toBe(12);
      expect(countOf(practice, "masculi", "singular")).toBe(3);
      expect(countOf(practice, "femeni", "singular")).toBe(3);
      expect(countOf(practice, "masculi", "plural")).toBe(3);
      expect(countOf(practice, "femeni", "plural")).toBe(3);
      expect(practice.filter((item) => item.trap).length).toBeGreaterThanOrEqual(4);
    }
    const exam = planNouns({ seed: 7, count: 16 });
    expect(exam.filter((item) => item.trap).length).toBeGreaterThanOrEqual(8);
  });

  it("dice la forma con artículo y distingue qué ha fallado", () => {
    const dia = NOUNS.find((item) => item.word === "dia");
    const foto = NOUNS.find((item) => item.word === "foto");
    const arbre = NOUNS.find((item) => item.word === "arbre");
    expect(dia && nounPhrase(dia)).toBe("masculí singular: el dia");
    expect(foto && nounPhrase(foto)).toBe("femení singular: la foto");
    expect(arbre && nounPhrase(arbre)).toBe("masculí singular: l'arbre");
    expect(dia && nounResult(dia, "masculi", "singular").ok).toBe(true);
    expect(dia && nounResult(dia, "femeni", "singular")).toEqual({
      ok: false,
      line: "El nombre sí. Era masculí singular: el dia.",
    });
    expect(dia && nounResult(dia, "masculi", "plural").line).toBe("El gènere sí. Era masculí singular: el dia.");
    expect(foto && nounResult(foto, "masculi", "plural").line).toBe("Era femení singular: la foto.");
  });
});

describe("ahorcado del calendari", () => {
  it("la ce no abre la cedilla de Març", () => {
    expect(hangKey("ç")).toBe("ç");
    expect(hangKey("c")).toBe("c");
    const missed = applyGuess("Març", emptyBoard(), "c");
    expect(missed.misses).toBe(1);
    let board = applyGuess("Març", missed, "ç");
    board = applyGuess("Març", board, "m");
    board = applyGuess("Març", board, "a");
    board = applyGuess("Març", board, "r");
    expect(board.status).toBe("won");
  });
});

function articleOf(item: Noun): string {
  if (item.number === "plural") return item.gender === "masculi" ? "els" : "les";
  if (/^[aeiouàèéíòóúh]/i.test(item.word)) return "l'";
  return item.gender === "masculi" ? "el" : "la";
}

function countOf(items: readonly Noun[], gender: Noun["gender"], number: Noun["number"]): number {
  return items.filter((item) => item.gender === gender && item.number === number).length;
}
