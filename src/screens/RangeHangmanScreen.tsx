import { useEffect, useState } from "react";
import { playCue } from "../audio";
import { Capybara } from "../components/Capybara";
import { Gallows, gallowsPart } from "../components/Gallows";
import { ReliefMap } from "../components/ReliefMap";
import { loadSave, rememberRange } from "../progress";
import { HANGMAN_MISSES, applyGuess, emptyBoard, revealChar, type HangmanBoard } from "../../shared/hangman";
import { hangKey } from "../../shared/normalize";
import { getRange, planRanges, type RangeUnit } from "../../shared/ranges";

const KEY_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];

export function RangeHangmanScreen({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"brief" | "play" | "done">("brief");
  const [ids, setIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [board, setBoard] = useState<HangmanBoard>(emptyBoard());
  const [won, setWon] = useState(0);
  const [lost, setLost] = useState(0);
  const sound = loadSave().sound;
  const unit: RangeUnit | null = ids[index] ? getRange(ids[index]) : null;

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
    const round = planRanges({ seed: Date.now() % 1_000_000_000, count: 8 });
    setIds(round.map((item) => item.id));
    setIndex(0);
    setBoard(emptyBoard());
    setWon(0);
    setLost(0);
    setPhase(round.length ? "play" : "brief");
  }

  function guess(raw: string) {
    if (!unit || phase !== "play") return;
    const next = applyGuess(unit.name, board, raw);
    if (next === board) return;
    setBoard(next);
    if (next.status === "won") {
      playCue("ok", sound);
      setWon((count) => count + 1);
      rememberRange(unit.id, true);
    } else if (next.status === "lost") {
      playCue("no", sound);
      setLost((count) => count + 1);
      rememberRange(unit.id, false);
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
    return (
      <section className="card">
        <Capybara mood="think" label="Ahorcado de cordilleras" />
        <h1>Ahorcado de cordilleras</h1>
        <p>
          La pista no dice el nombre. Cada fallo añade un trazo y al sexto se completa el dibujo. La <strong>ñ</strong> es una letra
          distinta. Las tildes salen solas al acertar la vocal.
        </p>
        <p className="help">Salen 8. También puedes usar el teclado del móvil.</p>
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
          {won} salvados, {lost} completados
        </h1>
        <p>Los completados pasan a Cordilleras falladas de esta persona.</p>
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
  const open = board.status !== "playing";

  return (
    <section className="card hangman">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Salir
        </button>
        <p>
          {index + 1} de {ids.length}
        </p>
      </div>
      <Gallows misses={board.misses} />
      <p className="help">{gallowsPart(board.misses)}</p>
      <p className="eyebrow">Pista</p>
      <h2>{unit.clue}</h2>
      <p className="hang-word" aria-label={open ? unit.name : "Cordillera por letras"}>
        {[...unit.name].map((char, charIndex) => {
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
            {board.status === "won" ? `Sí. ${unit.name}.` : `Era ${unit.name}.`}
          </p>
          <p>
            En el mapa lleva el {unit.number}. {unit.where}
          </p>
          <ReliefMap activeId={unit.id} numbers="active" label={`Mapa con ${unit.name}`} />
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
                const good = used && [...unit.name].some((char) => hangKey(char) === letter);
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
            {board.misses} de {HANGMAN_MISSES} fallos
          </p>
        </div>
      )}
    </section>
  );
}
