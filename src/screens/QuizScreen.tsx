import { useState } from "react";
import { playCue } from "../audio";
import { AnswerForm } from "../components/AnswerForm";
import { Capybara } from "../components/Capybara";
import { SpainMap } from "../components/SpainMap";
import { loadSave, remember } from "../progress";
import { COMMUNITIES, getProvince } from "../../shared/provinces";
import { gradeAnswer, planRound, type Grade, type Question } from "../../shared/questions";

type Mode = "text" | "map" | "review";

const TITLES: Record<Mode, string> = {
  text: "Preguntas",
  map: "Mapa",
  review: "Repasar fallos",
};

export function QuizScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const misses = Object.keys(loadSave().wrong);
  const [community, setCommunity] = useState("todas");
  const [phase, setPhase] = useState<"brief" | "play" | "done" | "empty">(mode === "review" ? (misses.length ? "play" : "empty") : "brief");
  const [questions, setQuestions] = useState<Question[]>(() =>
    mode === "review" && misses.length ? planRound({ community: "todas", ids: misses, mode: "text", seed: Date.now() }) : [],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState<Grade | null>(null);
  const [retried, setRetried] = useState(false);
  const sound = loadSave().sound;
  const question = questions[index];
  const province = question ? getProvince(question.provinceId) : null;
  const solved = verdict !== null && verdict.kind !== "close";
  const preview = planRound({ community, mode: mode === "map" ? "map" : "text", seed: 1, count: 99 });

  function begin() {
    const ids = mode === "review" ? Object.keys(loadSave().wrong) : undefined;
    const next = planRound({
      community,
      ids,
      mode: mode === "map" ? "map" : "text",
      seed: Date.now() % 1_000_000_000,
    });
    setQuestions(next);
    setIndex(0);
    setCorrect(0);
    setVerdict(null);
    setRetried(false);
    setPhase(next.length ? "play" : "empty");
  }

  function submit(value: string) {
    if (!province || solved) return;
    const result = gradeAnswer(value, province);
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
      remember(province.id, true);
    } else {
      playCue("no", sound);
      remember(province.id, false);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
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
        <p>Todavía no hay fallos guardados en este teléfono. Juega una ronda y aquí aparecerán las provincias que se resistan.</p>
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
        {mode === "map" ? (
          <p>Se marca una provincia en el mapa. Escribe su nombre. Canarias está en el recuadro de abajo.</p>
        ) : (
          <p>Lee la pista y escribe la provincia. Da igual la tilde. También valen los dos nombres, como Bizkaia y Vizcaya, o A Coruña y La Coruña.</p>
        )}
        <label>
          Comunidad
          <select value={community} onChange={(event) => setCommunity(event.target.value)}>
            <option value="todas">Las 50</option>
            {COMMUNITIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <p className="help">Salen {Math.min(10, preview.length)} preguntas.</p>
        <button className="primary" type="button" onClick={begin} disabled={preview.length === 0}>
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
        <Capybara mood={correct === questions.length ? "cheer" : "happy"} label="Resultado" />
        <h1>
          {correct} de {questions.length}
        </h1>
        <p>{correct === questions.length ? "Ronda limpia. El capibara aplaude con la naranja." : "Las que han fallado quedan en Repasar fallos, en este teléfono."}</p>
        <button className="primary" type="button" onClick={begin}>
          Otra ronda
        </button>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (!question || !province) return null;
  const other = verdict?.kind === "other" ? getProvince(verdict.otherId) : null;
  const showMap = mode === "map" || solved;

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {questions.length}
        </p>
      </div>
      <p className="eyebrow">{mode === "map" ? "Mapa" : question.kind === "capital" ? "Capital" : "Ciudad"}</p>
      <h2 className="prompt">{question.prompt}</h2>
      {showMap ? (
        <SpainMap
          activeId={province.id}
          tone="quiz"
          label={solved ? `Mapa con ${province.name} marcada` : "Mapa de España con una provincia marcada"}
        />
      ) : null}
      {solved ? (
        <div className="feedback" role="status">
          {verdict?.kind === "ok" ? <p className="correct">Sí. {province.name}.</p> : null}
          {verdict?.kind === "ok" && verdict.alias ? <p>También se dice {verdict.alias}.</p> : null}
          {verdict?.kind === "other" && other ? (
            <p className="wrong">
              Esa es {other.name}. La respuesta es {province.name}.
            </p>
          ) : null}
          {verdict?.kind === "no" ? <p className="wrong">Era {province.name}.</p> : null}
          <p>
            {province.community}. Capital: {province.capital}.
          </p>
          <button className="primary" type="button" onClick={next}>
            {index + 1 >= questions.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      ) : (
        <>
          {verdict?.kind === "close" ? (
            <p className="almost" role="status">
              Casi. Cambia una letra.
            </p>
          ) : null}
          <AnswerForm onSubmit={submit} />
        </>
      )}
    </section>
  );
}
