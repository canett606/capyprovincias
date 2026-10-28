import { useState } from "react";
import { playCue } from "../audio";
import { AnswerForm } from "../components/AnswerForm";
import { Capybara } from "../components/Capybara";
import { loadSave, rememberCalendar } from "../progress";
import {
  cedillaClose,
  getCalendarItem,
  gradeCalendar,
  planCalendar,
  type CalendarItem,
  type CalendarKind,
} from "../../shared/valencia";
import type { Grade } from "../../shared/questions";

type Mode = "preguntas" | "test" | "repaso";

const TITLES: Record<Mode, string> = {
  preguntas: "Preguntas",
  test: "Test",
  repaso: "Dies y meses fallados",
};

export function CalendarQuizScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const misses = Object.keys(loadSave().calendar);
  const [kind, setKind] = useState<"todo" | CalendarKind>("todo");
  const [phase, setPhase] = useState<"brief" | "play" | "done" | "empty">(mode === "repaso" ? (misses.length ? "play" : "empty") : "brief");
  const [items, setItems] = useState<CalendarItem[]>(() =>
    mode === "repaso" && misses.length ? planCalendar({ ids: misses, seed: Date.now() }) : [],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState<Grade | null>(null);
  const [retried, setRetried] = useState(false);
  const [cedilla, setCedilla] = useState(false);
  const sound = loadSave().sound;
  const item = items[index];
  const solved = verdict !== null && verdict.kind !== "close";

  function begin() {
    const ids = mode === "repaso" ? Object.keys(loadSave().calendar) : undefined;
    const next = planCalendar({
      ids,
      seed: Date.now() % 1_000_000_000,
      kind: ids ? undefined : kind === "todo" ? undefined : kind,
      count: mode === "preguntas" ? 10 : undefined,
    });
    setItems(next);
    setIndex(0);
    setCorrect(0);
    setVerdict(null);
    setRetried(false);
    setCedilla(false);
    setPhase(next.length ? "play" : "empty");
  }

  function submit(value: string) {
    if (!item || solved) return;
    const result = gradeCalendar(value, item);
    if (result.kind === "close" && !retried) {
      setVerdict(result);
      setCedilla(cedillaClose(value, item));
      setRetried(true);
      return;
    }
    const final = result.kind === "close" ? ({ kind: "no" } as const) : result;
    setVerdict(final);
    setCedilla(false);
    if (final.kind === "ok") {
      playCue("ok", sound);
      setCorrect((count) => count + 1);
      rememberCalendar(item.id, true);
    } else {
      playCue("no", sound);
      rememberCalendar(item.id, false);
    }
  }

  function next() {
    if (index + 1 >= items.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setVerdict(null);
    setRetried(false);
    setCedilla(false);
  }

  if (phase === "empty") {
    return (
      <section className="card">
        <Capybara mood="happy" label="Sin fallos" />
        <h1>{TITLES[mode]}</h1>
        <p>Todavía no hay días ni meses fallados. Haz las preguntas o el test y aquí se quedarán.</p>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (phase === "brief") {
    const pool = kind === "todo" ? 19 : kind === "dia" ? 7 : 12;
    const round = mode === "preguntas" ? Math.min(10, pool) : pool;
    return (
      <section className="card">
        <Capybara mood="think" label={TITLES[mode]} />
        <h1>{TITLES[mode]}</h1>
        <p>
          {mode === "test"
            ? "Te digo el día o el mes en castellano. Lo escribes en valenciano, como en el examen. Da igual mayúscula o minúscula."
            : "Te digo el día o el mes en castellano. Lo escribes en valenciano. Si te falta una letra, puedes corregir."}
        </p>
        <label>
          Qué sale
          <select value={kind} onChange={(event) => setKind(event.target.value as "todo" | CalendarKind)}>
            <option value="todo">Dies y mesos</option>
            <option value="dia">Solo los días</option>
            <option value="mes">Solo los meses</option>
          </select>
        </label>
        <p className="help">
          Salen {round}. Abril y octubre se escriben igual. Març lleva ç.
        </p>
        <button className="primary" type="button" onClick={begin}>
          Empezar
        </button>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="card">
        <Capybara mood={correct === items.length ? "cheer" : "happy"} label="Resultado" />
        <h1>
          {correct} de {items.length}
        </h1>
        <p>
          {correct === items.length
            ? "Ronda limpia. Esos ya no están entre los fallos."
            : "Los que han fallado se quedan en este teléfono, en Dies y meses fallados."}
        </p>
        <button className="primary" type="button" onClick={begin}>
          Otra ronda
        </button>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (!item) return null;
  const other = verdict?.kind === "other" ? getCalendarItem(verdict.otherId) : null;
  const place = item.kind === "dia" ? `Día ${item.order} de la semana.` : `Mes ${item.order} del año.`;

  return (
    <section className="card">
      <div className="play-top">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {items.length}
        </p>
      </div>
      <p className="eyebrow">{item.kind === "dia" ? "Dia de la setmana" : "Mes de l'any"}</p>
      <h2 className="prompt">Escribe en valenciano</h2>
      <p className="word-big">{item.spanish}</p>
      {solved ? (
        <div className="feedback" role="status">
          {verdict?.kind === "ok" ? <p className="correct">Sí. {item.name}.</p> : null}
          {verdict?.kind === "other" ? (
            <p className="wrong">
              Ese es {other?.name}. La respuesta es {item.name}.
            </p>
          ) : null}
          {verdict?.kind === "no" ? <p className="wrong">Era {item.name}.</p> : null}
          <p>{place}</p>
          {item.note ? <p>{item.note}</p> : null}
          <button className="primary" type="button" onClick={next}>
            {index + 1 >= items.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      ) : (
        <>
          {verdict?.kind === "close" ? (
            <p className="almost" role="status">
              {cedilla ? `Casi. Lleva ç: ${item.name}.` : "Casi. Cambia una letra."}
            </p>
          ) : null}
          <AnswerForm label="En valenciano" lang="ca" extraKeys={["ç"]} onSubmit={submit} />
        </>
      )}
    </section>
  );
}
