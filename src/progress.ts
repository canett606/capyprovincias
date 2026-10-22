const KEY = "capyprovincias-v1";

export type Save = {
  sound: boolean;
  wrong: Record<string, number>;
};

const EMPTY: Save = { sound: true, wrong: {} };

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, wrong: {} };
    const parsed = JSON.parse(raw) as Partial<Save>;
    const wrong: Record<string, number> = {};
    for (const [id, count] of Object.entries(parsed.wrong ?? {})) {
      if (typeof count === "number" && count > 0) wrong[id] = count;
    }
    return { sound: parsed.sound !== false, wrong };
  } catch {
    return { ...EMPTY, wrong: {} };
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
