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
};

/** Minúsculas, sin tildes. La eñe pasa a ene para poder escribir en el móvil. */
export function fold(value: string): string {
  let out = "";
  for (const char of value.trim().toLowerCase()) {
    if (char === "ñ") {
      out += "n";
      continue;
    }
    out += ACCENTS[char] ?? char;
  }
  return out.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function foldTight(value: string): string {
  return fold(value).replace(/ /g, "");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length > 48 || b.length > 48) return 99;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Letra del ahorcado. La eñe no es ene. La tilde no se adivina. */
export function hangKey(char: string): string | null {
  const lower = char.toLowerCase();
  if (lower === "ñ") return "ñ";
  if (ACCENTS[lower]) return ACCENTS[lower];
  if (/^[a-z]$/.test(lower)) return lower;
  return null;
}
