import { describe, expect, it } from "vitest";
import { applyGuess, emptyBoard, solutionKeys } from "../shared/hangman";
import { PATHS } from "../shared/mapPaths";
import { PROVINCES } from "../shared/provinces";
import { clueSpoils, gradeAnswer, hangmanClue, textQuestions } from "../shared/questions";
import { RIVERS, gradeRiver, riverClueSpoils } from "../shared/rivers";

describe("provincias", () => {
  it("son las 50, sin repetir id", () => {
    expect(PROVINCES).toHaveLength(50);
    expect(new Set(PROVINCES.map((province) => province.id)).size).toBe(50);
  });

  it("cada pista se puede contestar sin que el enunciado diga la solución", () => {
    for (const province of PROVINCES) {
      const questions = textQuestions(province);
      expect(questions.length, province.name).toBeGreaterThan(0);
      for (const question of questions) {
        expect(clueSpoils(question.prompt, province), question.prompt).toBe(false);
      }
      expect(clueSpoils(hangmanClue(province), province)).toBe(false);
    }
  });

  it("acepta tildes, espacios y el otro nombre", () => {
    const malaga = PROVINCES.find((province) => province.id === "malaga");
    const bizkaia = PROVINCES.find((province) => province.id === "bizkaia");
    const coruna = PROVINCES.find((province) => province.id === "coruna");
    const real = PROVINCES.find((province) => province.id === "ciudad-real");
    expect(malaga && gradeAnswer("malaga", malaga)).toEqual({ kind: "ok", alias: null });
    expect(bizkaia && gradeAnswer("Vizcaya", bizkaia)).toMatchObject({ kind: "ok", alias: "Vizcaya" });
    expect(coruna && gradeAnswer("la coruña", coruna)).toMatchObject({ kind: "ok", alias: "La Coruña" });
    expect(real && gradeAnswer("ciudadreal", real)).toEqual({ kind: "ok", alias: null });
  });

  it("no da por buena otra provincia y avisa si falta una letra", () => {
    const cadiz = PROVINCES.find((province) => province.id === "cadiz");
    const sevilla = PROVINCES.find((province) => province.id === "sevilla");
    expect(cadiz && gradeAnswer("Sevilla", cadiz)).toEqual({ kind: "other", otherId: "sevilla" });
    expect(sevilla && gradeAnswer("Sevila", sevilla)).toEqual({ kind: "close" });
  });
});

describe("ahorcado", () => {
  it("la eñe no se abre con la ene y la tilde sale con la vocal", () => {
    const coruna = applyGuess("A Coruña", emptyBoard(), "n");
    expect(coruna.misses).toBe(1);
    expect(solutionKeys("A Coruña")).toContain("ñ");
    expect(solutionKeys("A Coruña")).not.toContain("n");
    const alava = applyGuess("Álava", emptyBoard(), "a");
    expect(alava.misses).toBe(0);
    expect(alava.status).toBe("playing");
    let board = emptyBoard();
    for (const letter of ["a", "l", "v"]) board = applyGuess("Álava", board, letter);
    expect(board.status).toBe("won");
  });
});

describe("ríos", () => {
  it("son los 22 de la ficha, numerados del 1 al 22", () => {
    expect(RIVERS).toHaveLength(22);
    expect(new Set(RIVERS.map((river) => river.id)).size).toBe(22);
    expect(RIVERS.map((river) => river.number).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 22 }, (_, index) => index + 1),
    );
  });

  it("la pista no contiene el nombre y el trazado existe", () => {
    for (const river of RIVERS) {
      expect(riverClueSpoils(river.clue, river), river.name).toBe(false);
      expect(river.d.length, river.id).toBeGreaterThan(12);
    }
  });

  it("acepta el nombre sin tilde y el otro nombre", () => {
    const mino = RIVERS.find((river) => river.id === "mino");
    const jucar = RIVERS.find((river) => river.id === "jucar");
    const nervion = RIVERS.find((river) => river.id === "nervion");
    expect(mino && gradeRiver("mino", mino)).toEqual({ kind: "ok", alias: null });
    expect(jucar && gradeRiver("Xúquer", jucar)).toMatchObject({ kind: "ok", alias: "Xúquer" });
    expect(nervion && gradeRiver("rio nerbioi", nervion)).toMatchObject({ kind: "ok", alias: "Nerbioi" });
  });

  it("no da por bueno otro río y avisa si falta una letra", () => {
    const tajo = RIVERS.find((river) => river.id === "tajo");
    const ebro = RIVERS.find((river) => river.id === "ebro");
    expect(tajo && gradeRiver("Ebro", tajo)).toEqual({ kind: "other", otherId: "ebro" });
    expect(ebro && gradeRiver("Ebro", ebro)).toEqual({ kind: "ok", alias: null });
    expect(tajo && gradeRiver("Tajo", tajo)).toEqual({ kind: "ok", alias: null });
    expect(ebro && gradeRiver("Ebr", ebro)).toEqual({ kind: "close" });
  });
});

describe("mapa", () => {
  it("tiene contorno para cada provincia", () => {
    for (const province of PROVINCES) {
      expect(PATHS[province.id]?.length ?? 0, province.id).toBeGreaterThan(8);
    }
    expect(PATHS.ceuta).toBeTruthy();
    expect(PATHS.melilla).toBeTruthy();
  });
});
