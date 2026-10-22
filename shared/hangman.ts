import { hangKey } from "./normalize";

export const HANGMAN_MISSES = 6;

export type HangmanBoard = {
  guessed: string[];
  misses: number;
  status: "playing" | "won" | "lost";
};

export function emptyBoard(): HangmanBoard {
  return { guessed: [], misses: 0, status: "playing" };
}

export function solutionKeys(solution: string): string[] {
  const keys: string[] = [];
  for (const char of solution) {
    const key = hangKey(char);
    if (key && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

export function applyGuess(solution: string, board: HangmanBoard, raw: string): HangmanBoard {
  if (board.status !== "playing") return board;
  const letter = hangKey(raw);
  if (!letter || board.guessed.includes(letter)) return board;
  const guessed = [...board.guessed, letter];
  const keys = solutionKeys(solution);
  const hit = keys.includes(letter);
  const misses = hit ? board.misses : board.misses + 1;
  const won = keys.every((key) => guessed.includes(key));
  const status = won ? "won" : misses >= HANGMAN_MISSES ? "lost" : "playing";
  return { guessed, misses, status };
}

export function revealChar(char: string, board: HangmanBoard, open: boolean): string | null {
  const key = hangKey(char);
  if (!key) return char;
  if (open || board.guessed.includes(key)) return char.toLocaleUpperCase("es");
  return null;
}
