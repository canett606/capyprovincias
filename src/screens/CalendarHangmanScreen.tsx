import { useEffect, useState } from "react";
import { playCue } from "../audio";
import { Capybara } from "../components/Capybara";
import { Gallows, gallowsPart } from "../components/Gallows";
import { loadSave, rememberCalendar } from "../progress";
import { HANGMAN_MISSES, applyGuess, emptyBoard, revealChar, type HangmanBoard } from "../../shared/hangman";
import { hangKey } from "../../shared/normalize";
import { getCalendarItem, planCalendar, type CalendarItem, type CalendarKind } from "../../shared/valencia";

const KEY_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnmç"];

export function CalendarHangmanScreen({ onExit }: { onExit: () => void }) {
  const [kind, setKind] = useState<"todo" | CalendarKind>("todo");
  const [phase, setPhase] = useState<"brief" | "play" | "done">("brief");
  const [ids, setIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [board, setBoard] = useState<HangmanBoard>(emptyBoard());
  const [won, setWon] = useState(0);
  const [lost, setLost] = useState(0);
  const sound = loadSave().sound;
  const item: CalendarItem | null = ids[index] ? getCalendarItem(ids[index]) : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key === "Enter") {
        if (phase === "brief") {
          event.preventDefault();
          begin();
        } else if (phase === "play" && board.status !== "playing") {
          event.preventDefault();
          advance();
        }
        return;
      }
      if (phase !== "play" || board.status !== "playing") return;
      if (event.key.length !== 1) return;
      event.preventDefault();
      guess(event.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function begin() {
    const pool = kind === "todo" ? undefined : kind;
    const available = pool === "dia" ? 7 : pool === "mes" ? 12 : 19;
    const round = planCalendar({
      seed: Date.now() % 1_000_000_000,
      kind: pool,
      count: Math.min(8, available),
    });
    setIds(round.map((entry) => entry.id));
    setIndex(0);
    setBoard(emptyBoard());
    setWon(0);
    setLost(0);
    setPhase(round.length ? "play" : "brief");
  }

  function guess(raw: string) {
    if (!item || phase !== "play") return;
    const next = applyGuess(item.name, board, raw);
    if (next === board) return;
    setBoard(next);
    if (next.status === "won") {
      playCue("ok", sound);
      setWon((count) => count + 1);
      rememberCalendar(item.id, true);
    } else if (next.status === "lost") {
      playCue("no", sound);
      setLost((count) => count + 1);
      rememberCalendar(item.id, false);
    }
  }

  function advance() {
    if (index + 1 >= ids.length) {
      setPhase("done");
      return;
    }
    setIndex((value) => value + 1);
    setBoard(emptyBoard());
  }

  if (phase === "brief") {
    const available = kind === "dia" ? 7 : kind === "mes" ? 12 : 19;
    return (
      <section className="card">
        <Capybara mood="think" label="Ahorcado" />
        <h1>Ahorcado</h1>
        <p>
          Sale el día o el mes en castellano. Lo completas letra a letra en valenciano. La <strong>ç</strong> de Març es una letra
          distinta de la ce. Las tildes, si las hubiera, salen solas al acertar la vocal.
        </p>
        <label>
          Qué sale
          <select value={kind} onChange={(event) => setKind(event.target.value as "todo" | CalendarKind)}>
            <option value="todo">Dies y mesos</option>
            <option value="dia">Solo los días</option>
            <option value="mes">Solo los meses</option>
          </select>
        </label>
        <p className="help">Salen {Math.min(8, available)}.</p>
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
        <Capybara mood={lost === 0 ? "cheer" : "happy"} label="Resultado del ahorcado" />
        <h1>
          {won} salvadas, {lost} completadas
        </h1>
        <p>Las completadas pasan a Dies y meses fallados.</p>
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
  const open = board.status !== "playing";

  return (
    <section className="card hangman">
      <div className="play-top">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {ids.length}
        </p>
      </div>
      <Gallows misses={board.misses} />
      <p className="help">{gallowsPart(board.misses)}</p>
      <p className="eyebrow">{item.kind === "dia" ? "Dia de la setmana" : "Mes de l'any"}</p>
      <h2>¿Cómo se escribe «{item.spanish}»?</h2>
      <p className="hang-word" aria-label={open ? item.name : "Palabra por letras"}>
        {[...item.name].map((char, charIndex) => {
          const shown = revealChar(char, board, open);
          return (
            <span key={`${charIndex}-${char}`} className={hangKey(char) ? "hang-cell" : "hang-cell fixed"}>
              {shown ?? ""}
            </span>
          );
        })}
      </p>
      {open ? (
        <div className="feedback" role="status">
          <p className={board.status === "won" ? "correct" : "wrong"}>
            {board.status === "won" ? `Sí. ${item.name}.` : `Era ${item.name}.`}
          </p>
          <p>{item.kind === "dia" ? `Día ${item.order} de la semana.` : `Mes ${item.order} del año.`}</p>
          {item.note ? <p>{item.note}</p> : null}
          <button className="primary" type="button" onClick={advance}>
            {index + 1 >= ids.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      ) : (
        <div className="keys">
          {KEY_ROWS.map((row) => (
            <div key={row} className="keys-row">
              {[...row].map((letter) => {
                const used = board.guessed.includes(letter);
                const good = used && [...item.name].some((char) => hangKey(char) === letter);
                return (
                  <button
                    key={letter}
                    type="button"
                    className={`key-letter${used ? (good ? " good" : " bad") : ""}`}
                    disabled={used}
                    onClick={() => guess(letter)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
          <p className="help">
            {board.misses} de {HANGMAN_MISSES} fallos. La ç es otra letra.
          </p>
        </div>
      )}
    </section>
  );
}
