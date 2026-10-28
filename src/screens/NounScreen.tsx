import { useState, type ReactNode } from "react";
import { useEnterAction } from "../components/AnswerForm";
import { playCue } from "../audio";
import { Capybara } from "../components/Capybara";
import { loadSave, rememberNoun } from "../progress";
import {
  NOUN_EXAM,
  NOUN_PRACTICE,
  nounResult,
  planNouns,
  type Noun,
  type NounGender,
  type NounNumber,
} from "../../shared/valencia";

type Mode = "practica" | "examen" | "repaso";

const TITLES: Record<Mode, string> = {
  practica: "Practicar",
  examen: "Examen",
  repaso: "Paraules falladas",
};

export function NounScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const misses = Object.keys(loadSave().nouns);
  const [phase, setPhase] = useState<"brief" | "play" | "done" | "empty">(mode === "repaso" ? (misses.length ? "play" : "empty") : "brief");
  const [nouns, setNouns] = useState<Noun[]>(() =>
    mode === "repaso" && misses.length ? planNouns({ ids: misses, seed: Date.now() }) : [],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gender, setGender] = useState<NounGender | null>(null);
  const [number, setNumber] = useState<NounNumber | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const sound = loadSave().sound;
  const noun = nouns[index];
  const solved = line !== null;

  function begin() {
    const ids = mode === "repaso" ? Object.keys(loadSave().nouns) : undefined;
    const next = planNouns({
      ids,
      seed: Date.now() % 1_000_000_000,
      count: mode === "practica" ? NOUN_PRACTICE : mode === "examen" ? NOUN_EXAM : undefined,
    });
    setNouns(next);
    setIndex(0);
    setCorrect(0);
    setGender(null);
    setNumber(null);
    setLine(null);
    setHint(false);
    setPhase(next.length ? "play" : "empty");
  }

  function submit() {
    if (!noun || !gender || !number || solved) return;
    const result = nounResult(noun, gender, number);
    setLine(result.line);
    if (result.ok) {
      playCue("ok", sound);
      setCorrect((count) => count + 1);
      rememberNoun(noun.id, true);
    } else {
      playCue("no", sound);
      rememberNoun(noun.id, false);
    }
  }

  function next() {
    if (index + 1 >= nouns.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setGender(null);
    setNumber(null);
    setLine(null);
    setHint(false);
  }

  useEnterAction(phase === "play" && solved, next);

  if (phase === "empty") {
    return (
      <section className="card">
        <Capybara mood="happy" label="Sin fallos" />
        <h1>{TITLES[mode]}</h1>
        <p>Todavía no hay paraules falladas en este teléfono. Practica y aquí se quedarán las que fallen.</p>
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
        <p>Sale una paraula en valenciano. Di las dos cosas: masculí o femení, y singular o plural.</p>
        <p className="help">
          {mode === "examen"
            ? `Salen ${NOUN_EXAM}, con las trampas del examen. Sin pista.`
            : `Salen ${NOUN_PRACTICE}. Por ejemplo: gossos es masculí plural, y foto es femení singular.`}
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
        <Capybara mood={correct === nouns.length ? "cheer" : "happy"} label="Resultado" />
        <h1>
          {correct} de {nouns.length}
        </h1>
        <p>
          {correct === nouns.length
            ? "Ronda limpia. Esas paraules ya no están entre los fallos."
            : "Las que han fallado se quedan en este teléfono, en Paraules falladas."}
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

  if (!noun) return null;

  return (
    <section className="card">
      <div className="play-top">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {nouns.length}
        </p>
      </div>
      <p className="eyebrow">{TITLES[mode]}</p>
      <h2 className="word-big">{noun.word}</h2>
      <p className="help">Masculí o femení. Singular o plural.</p>
      {solved ? (
        <div className="feedback" role="status">
          <p className={line?.startsWith("Sí") ? "correct" : "wrong"}>{line}</p>
          <p>{noun.note}</p>
          <p>En castellano: {noun.spanish}.</p>
          <button className="primary" type="button" onClick={next}>
            {index + 1 >= nouns.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      ) : (
        <>
          {hint ? <p className="help">En castellano: {noun.spanish}.</p> : null}
          <div className="choice-row" role="group" aria-label="Gènere">
            <Choice on={gender === "masculi"} onClick={() => setGender("masculi")}>
              masculí
              <small>masculino</small>
            </Choice>
            <Choice on={gender === "femeni"} onClick={() => setGender("femeni")}>
              femení
              <small>femenino</small>
            </Choice>
          </div>
          <div className="choice-row" role="group" aria-label="Nombre">
            <Choice on={number === "singular"} onClick={() => setNumber("singular")}>
              singular
              <small>uno solo</small>
            </Choice>
            <Choice on={number === "plural"} onClick={() => setNumber("plural")}>
              plural
              <small>más de uno</small>
            </Choice>
          </div>
          <button className="primary" type="button" disabled={!gender || !number} onClick={submit}>
            Comprobar
          </button>
          {mode === "examen" ? null : (
            <button className="ghost" type="button" onClick={() => setHint(true)}>
              No sé qué significa
            </button>
          )}
        </>
      )}
    </section>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={on ? "choice on" : "choice"} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}
