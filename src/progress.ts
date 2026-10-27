const KEY = "capyprovincias-v2";
const LEGACY = "capyprovincias-v1";

export type Save = {
  sound: boolean;
  wrong: Record<string, number>;
  rivers: Record<string, number>;
  ranges: Record<string, number>;
};

export type Person = {
  key: string;
  name: string;
  sound: boolean;
  wrong: Record<string, number>;
  rivers: Record<string, number>;
  ranges: Record<string, number>;
  sessions: number;
  last: string;
};

type Bank = {
  active: string | null;
  users: Record<string, Person>;
};

const EMPTY_SAVE: Save = { sound: true, wrong: {}, rivers: {}, ranges: {} };

export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 16);
}

export function personKey(raw: string): string {
  return cleanName(raw)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function listPeople(): Person[] {
  return Object.values(readBank().users).sort((a, b) => b.last.localeCompare(a.last) || a.name.localeCompare(b.name, "es"));
}

export function activePerson(): Person | null {
  const bank = readBank();
  if (!bank.active) return null;
  return bank.users[bank.active] ?? null;
}

export function choosePerson(rawName: string): Person | null {
  const name = cleanName(rawName);
  const key = personKey(name);
  if (!key) return null;
  const bank = readBank();
  const today = localDay();
  let person = bank.users[key];
  if (!person) {
    person = {
      key,
      name,
      sound: true,
      wrong: {},
      rivers: {},
      ranges: {},
      sessions: 0,
      last: "",
    };
    if (Object.keys(bank.users).length === 0) {
      const legacy = readLegacy();
      if (legacy) {
        person.sound = legacy.sound;
        person.wrong = legacy.wrong;
        person.rivers = legacy.rivers;
        try {
          localStorage.removeItem(LEGACY);
        } catch {
          // Si no se puede borrar, la próxima persona nueva ya no es la primera.
        }
      }
    }
  }
  if (person.last !== today) {
    person.sessions += 1;
    person.last = today;
  }
  bank.users[key] = person;
  bank.active = key;
  writeBank(bank);
  return person;
}

export function clearActive(): void {
  const bank = readBank();
  bank.active = null;
  writeBank(bank);
}

export function personBlurb(person: Person): string {
  const provinces = Object.keys(person.wrong).length;
  const rivers = Object.keys(person.rivers).length;
  const ranges = Object.keys(person.ranges).length;
  const faults = [
    provinces ? `${provinces} ${provinces === 1 ? "provincia" : "provincias"}` : "",
    rivers ? `${rivers} ${rivers === 1 ? "río" : "ríos"}` : "",
    ranges ? `${ranges} ${ranges === 1 ? "relieve" : "relieves"}` : "",
  ].filter(Boolean);
  const days = `${person.sessions} ${person.sessions === 1 ? "día" : "días"}`;
  const pending = faults.length ? faults.join(" · ") : "sin fallos guardados";
  return `${days} · ${pending}`;
}

export function loadSave(): Save {
  const person = activePerson();
  if (!person) return { sound: EMPTY_SAVE.sound, wrong: {}, rivers: {}, ranges: {} };
  return {
    sound: person.sound,
    wrong: { ...person.wrong },
    rivers: { ...person.rivers },
    ranges: { ...person.ranges },
  };
}

export function writeSave(save: Save): void {
  const bank = readBank();
  const key = bank.active;
  if (!key || !bank.users[key]) return;
  const person = bank.users[key];
  bank.users[key] = {
    ...person,
    sound: save.sound,
    wrong: counts(save.wrong),
    rivers: counts(save.rivers),
    ranges: counts(save.ranges),
  };
  writeBank(bank);
}

export function remember(id: string, ok: boolean): void {
  const save = loadSave();
  if (!activePerson()) return;
  if (ok) delete save.wrong[id];
  else save.wrong[id] = (save.wrong[id] ?? 0) + 1;
  writeSave(save);
}

export function rememberRiver(id: string, ok: boolean): void {
  const save = loadSave();
  if (!activePerson()) return;
  if (ok) delete save.rivers[id];
  else save.rivers[id] = (save.rivers[id] ?? 0) + 1;
  writeSave(save);
}

export function rememberRange(id: string, ok: boolean): void {
  const save = loadSave();
  if (!activePerson()) return;
  if (ok) delete save.ranges[id];
  else save.ranges[id] = (save.ranges[id] ?? 0) + 1;
  writeSave(save);
}

function readBank(): Bank {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { active: null, users: {} };
    const parsed = JSON.parse(raw) as Partial<Bank>;
    const users: Record<string, Person> = {};
    if (parsed.users && typeof parsed.users === "object") {
      for (const [key, value] of Object.entries(parsed.users)) {
        const person = sanitizePerson(key, value);
        if (person) users[person.key] = person;
      }
    }
    const active = typeof parsed.active === "string" && users[parsed.active] ? parsed.active : null;
    return { active, users };
  } catch {
    return { active: null, users: {} };
  }
}

function writeBank(bank: Bank): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(bank));
  } catch {
    // Safari privado puede bloquear el almacén. La partida sigue en memoria.
  }
}

function sanitizePerson(key: string, value: unknown): Person | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Person>;
  const name = cleanName(String(row.name ?? ""));
  const safeKey = personKey(name);
  if (!safeKey || safeKey !== key) return null;
  return {
    key: safeKey,
    name,
    sound: row.sound !== false,
    wrong: counts(row.wrong),
    rivers: counts(row.rivers),
    ranges: counts(row.ranges),
    sessions: Math.max(0, Math.floor(Number(row.sessions) || 0)),
    last: typeof row.last === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.last) ? row.last : "",
  };
}

function readLegacy(): Save | null {
  try {
    const raw = localStorage.getItem(LEGACY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Save>;
    return {
      sound: parsed.sound !== false,
      wrong: counts(parsed.wrong),
      rivers: counts(parsed.rivers),
      ranges: counts(parsed.ranges),
    };
  } catch {
    return null;
  }
}

function counts(raw: unknown): Record<string, number> {
  const next: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return next;
  for (const [id, count] of Object.entries(raw)) {
    if (typeof count === "number" && count > 0) next[id] = count;
  }
  return next;
}

function localDay(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
