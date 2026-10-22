import { describe, expect, it } from "vitest";
import { applyGuess, emptyBoard, solutionKeys } from "../shared/hangman";
import { PATHS } from "../shared/mapPaths";
import { PROVINCES } from "../shared/provinces";
import { clueSpoils, gradeAnswer, hangmanClue, textQuestions } from "../shared/questions";

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

describe("mapa", () => {
  it("tiene contorno para cada provincia", () => {
    for (const province of PROVINCES) {
      expect(PATHS[province.id]?.length ?? 0, province.id).toBeGreaterThan(8);
    }
    expect(PATHS.ceuta).toBeTruthy();
    expect(PATHS.melilla).toBeTruthy();
  });
});
