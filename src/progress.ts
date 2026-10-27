const KEY = "capyprovincias-v1";

export type Save = {
  sound: boolean;
  wrong: Record<string, number>;
  rivers: Record<string, number>;
};

const EMPTY: Save = { sound: true, wrong: {}, rivers: {} };

function counts(raw: unknown): Record<string, number> {
  const next: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return next;
  for (const [id, count] of Object.entries(raw)) {
    if (typeof count === "number" && count > 0) next[id] = count;
  }
  return next;
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, wrong: {}, rivers: {} };
    const parsed = JSON.parse(raw) as Partial<Save>;
    return { sound: parsed.sound !== false, wrong: counts(parsed.wrong), rivers: counts(parsed.rivers) };
  } catch {
    return { ...EMPTY, wrong: {}, rivers: {} };
  }
}

export function writeSave(save: Save): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Safari privado puede bloquear el almacén. La partida sigue en memoria.
  }
}

export function remember(id: string, ok: boolean): void {
  const save = loadSave();
  if (ok) delete save.wrong[id];
  else save.wrong[id] = (save.wrong[id] ?? 0) + 1;
  writeSave(save);
}

export function rememberRiver(id: string, ok: boolean): void {
  const save = loadSave();
  if (ok) delete save.rivers[id];
  else save.rivers[id] = (save.rivers[id] ?? 0) + 1;
  writeSave(save);
}
