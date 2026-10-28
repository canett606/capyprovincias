import { useState } from "react";
import { playCue } from "../audio";
import { AnswerForm, useEnterAction } from "../components/AnswerForm";
import { Capybara } from "../components/Capybara";
import { ReliefMap } from "../components/ReliefMap";
import { loadSave, rememberRange } from "../progress";
import { getRange, gradeRange, planRanges, type RangeUnit } from "../../shared/ranges";
import type { Grade } from "../../shared/questions";

type Mode = "practica" | "examen" | "repaso";

const TITLES: Record<Mode, string> = {
  practica: "Escribir la cordillera",
  examen: "Repaso para examen",
  repaso: "Cordilleras falladas",
};

export function RangeQuizScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const misses = Object.keys(loadSave().ranges);
  const [phase, setPhase] = useState<"brief" | "play" | "done" | "empty">(mode === "repaso" ? (misses.length ? "play" : "empty") : "brief");
  const [units, setUnits] = useState<RangeUnit[]>(() =>
    mode === "repaso" && misses.length ? planRanges({ ids: misses, seed: Date.now() }) : [],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState<Grade | null>(null);
  const [retried, setRetried] = useState(false);
  const sound = loadSave().sound;
  const unit = units[index];
  const solved = verdict !== null && verdict.kind !== "close";

  function begin() {
    const ids = mode === "repaso" ? Object.keys(loadSave().ranges) : undefined;
    const next = planRanges({
      ids,
      seed: Date.now() % 1_000_000_000,
      count: mode === "practica" ? 8 : undefined,
    });
    setUnits(next);
    setIndex(0);
    setCorrect(0);
    setVerdict(null);
    setRetried(false);
    setPhase(next.length ? "play" : "empty");
  }

  function submit(value: string) {
    if (!unit || solved) return;
    const result = gradeRange(value, unit);
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
      rememberRange(unit.id, true);
    } else {
      playCue("no", sound);
      rememberRange(unit.id, false);
    }
  }

  function next() {
    if (index + 1 >= units.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setVerdict(null);
    setRetried(false);
  }

  useEnterAction(phase === "play" && solved, next);

  if (phase === "empty") {
    return (
      <section className="card">
        <Capybara mood="happy" label="Sin fallos" />
        <h1>{TITLES[mode]}</h1>
        <p>Todavía no hay cordilleras falladas para esta persona. Cuando fallen, se quedan aquí para repasarlas.</p>
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
            ? "Salen las 12 de la ficha, desordenadas. El naranja es la que tienes que escribir. Da igual la tilde."
            : "Se marca una en naranja. Escribe su nombre con el teclado. En el móvil sale el teclado de letras."}
        </p>
        <p className="help">{mode === "examen" ? "Las 12, como en el examen." : "Salen 8."}</p>
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
        <Capybara mood={correct === units.length ? "cheer" : "happy"} label="Resultado" />
        <h1>
          {correct} de {units.length}
        </h1>
        <p>
          {correct === units.length
            ? "Ronda limpia. Esas ya no están entre los fallos."
            : "Las que han fallado se quedan para esta persona, en Cordilleras falladas."}
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

  if (!unit) return null;
  const other = verdict?.kind === "other" ? getRange(verdict.otherId) : null;

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {units.length}
        </p>
      </div>
      <p className="eyebrow">{TITLES[mode]}</p>
      <h2 className="prompt">Escribe el nombre de la zona naranja.</h2>
      <ReliefMap
        activeId={unit.id}
        numbers={solved ? "active" : "off"}
        label={solved ? `Mapa con ${unit.name}` : "Mapa de España con una cordillera marcada"}
      />
      {solved ? (
        <div className="feedback" role="status">
          {verdict?.kind === "ok" ? <p className="correct">Sí. {unit.name}.</p> : null}
          {verdict?.kind === "ok" && verdict.alias ? <p>También se dice {verdict.alias}.</p> : null}
          {verdict?.kind === "other" ? (
            <p className="wrong">
              Esa es {other?.name}. La respuesta es {unit.name}.
            </p>
          ) : null}
          {verdict?.kind === "no" ? <p className="wrong">Era {unit.name}.</p> : null}
          <p>
            En el mapa lleva el {unit.number}. {unit.where} {unit.kind === "valle" ? "Es una depresión." : "Es un relieve montañoso."}
          </p>
        </div>
      ) : verdict?.kind === "close" ? (
        <p className="almost" role="status">
          Casi. Cambia una letra.
        </p>
      ) : null}
      <AnswerForm
        label="Cordillera"
        onSubmit={submit}
        onContinue={solved ? next : undefined}
        continueLabel={index + 1 >= units.length ? "Ver resultado" : "Siguiente"}
      />
    </section>
  );
}
