import { useState } from "react";
import { playCue } from "../audio";
import { AnswerForm } from "../components/AnswerForm";
import { Capybara } from "../components/Capybara";
import { RiverMap } from "../components/RiverMap";
import { loadSave, rememberRiver } from "../progress";
import { getRiver, gradeRiver, planRivers, type River } from "../../shared/rivers";
import type { Grade } from "../../shared/questions";

type Mode = "practica" | "examen" | "repaso";

const TITLES: Record<Mode, string> = {
  practica: "Escribir el río",
  examen: "Repaso para examen",
  repaso: "Ríos fallados",
};

export function RiverQuizScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const misses = Object.keys(loadSave().rivers);
  const [phase, setPhase] = useState<"brief" | "play" | "done" | "empty">(mode === "repaso" ? (misses.length ? "play" : "empty") : "brief");
  const [rivers, setRivers] = useState<River[]>(() =>
    mode === "repaso" && misses.length ? planRivers({ ids: misses, seed: Date.now() }) : [],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState<Grade | null>(null);
  const [retried, setRetried] = useState(false);
  const sound = loadSave().sound;
  const river = rivers[index];
  const solved = verdict !== null && verdict.kind !== "close";

  function begin() {
    const ids = mode === "repaso" ? Object.keys(loadSave().rivers) : undefined;
    const next = planRivers({
      ids,
      seed: Date.now() % 1_000_000_000,
      count: mode === "practica" ? 10 : undefined,
    });
    setRivers(next);
    setIndex(0);
    setCorrect(0);
    setVerdict(null);
    setRetried(false);
    setPhase(next.length ? "play" : "empty");
  }

  function submit(value: string) {
    if (!river || solved) return;
    const result = gradeRiver(value, river);
    if (result.kind === "close" && !retried) {
      setVerdict(result);
      setRetried(true);
      return;
    }
    const final = result.kind === "close" ? ({ kind: "no" } as const) : result;
    setVerdict(final);
    if (final.kind === "ok") {
      playCue("ok", sound);
      setCorrect((count) => count + 1);
      rememberRiver(river.id, true);
    } else {
      playCue("no", sound);
      rememberRiver(river.id, false);
    }
  }

  function next() {
    if (index + 1 >= rivers.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setVerdict(null);
    setRetried(false);
  }

  if (phase === "empty") {
    return (
      <section className="card">
        <Capybara mood="happy" label="Sin fallos" />
        <h1>{TITLES[mode]}</h1>
        <p>Todavía no hay ríos fallados en este teléfono. Haz el repaso y aquí se quedarán los que fallen.</p>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (phase === "brief") {
    return (
      <section className="card">
        <Capybara mood="think" label={TITLES[mode]} />
        <h1>{TITLES[mode]}</h1>
        <p>
          {mode === "examen"
            ? "Salen los 22 ríos, desordenados. El naranja es el que tienes que escribir. Da igual la tilde."
            : "Se marca un río en naranja. Escribe su nombre con el teclado. En el móvil sale el teclado de letras."}
        </p>
        <p className="help">{mode === "examen" ? "Los 22, como en el examen." : "Salen 10 ríos."}</p>
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
        <Capybara mood={correct === rivers.length ? "cheer" : "happy"} label="Resultado" />
        <h1>
          {correct} de {rivers.length}
        </h1>
        <p>
          {correct === rivers.length
            ? "Ronda limpia. Esos ríos ya no están entre los fallos."
            : "Los que han fallado se quedan en este teléfono, en Ríos fallados."}
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

  if (!river) return null;
  const other = verdict?.kind === "other" ? getRiver(verdict.otherId) : null;

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {rivers.length}
        </p>
      </div>
      <p className="eyebrow">{TITLES[mode]}</p>
      <h2 className="prompt">Escribe el nombre del río naranja.</h2>
      <RiverMap
        activeId={river.id}
        numbers={solved ? "active" : "off"}
        label={solved ? `Mapa con el río ${river.name}` : "Mapa de España con un río marcado"}
      />
      {solved ? (
        <div className="feedback" role="status">
          {verdict?.kind === "ok" ? <p className="correct">Sí. {river.name}.</p> : null}
          {verdict?.kind === "ok" && verdict.alias ? <p>También se dice {verdict.alias}.</p> : null}
          {verdict?.kind === "other" ? (
            <p className="wrong">
              Ese es {other?.name}. La respuesta es {river.name}.
            </p>
          ) : null}
          {verdict?.kind === "no" ? <p className="wrong">Era {river.name}.</p> : null}
          <p>
            En la ficha es el {river.number}. {river.where}
          </p>
          <button className="primary" type="button" onClick={next}>
            {index + 1 >= rivers.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      ) : (
        <>
          {verdict?.kind === "close" ? (
            <p className="almost" role="status">
              Casi. Cambia una letra.
            </p>
          ) : null}
          <AnswerForm label="Río" onSubmit={submit} />
        </>
      )}
    </section>
  );
}
