import { useEffect, useState } from "react";
import { playCue } from "../audio";
import { Capybara } from "../components/Capybara";
import { Gallows, gallowsPart } from "../components/Gallows";
import { SpainMap } from "../components/SpainMap";
import { loadSave, remember } from "../progress";
import { HANGMAN_MISSES, applyGuess, emptyBoard, revealChar, type HangmanBoard } from "../../shared/hangman";
import { hangKey } from "../../shared/normalize";
import { hangmanClue, planRound } from "../../shared/questions";
import { COMMUNITIES, getProvince, provincesIn } from "../../shared/provinces";

const KEY_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];

export function HangmanScreen({ onExit }: { onExit: () => void }) {
  const [community, setCommunity] = useState("todas");
  const [phase, setPhase] = useState<"brief" | "play" | "done">("brief");
  const [ids, setIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [board, setBoard] = useState<HangmanBoard>(emptyBoard());
  const [won, setWon] = useState(0);
  const [lost, setLost] = useState(0);
  const sound = loadSave().sound;
  const available = provincesIn(community).length;
  const province = ids[index] ? getProvince(ids[index]) : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key === "Enter") {
        if (phase === "brief" && available > 0) {
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
    const round = planRound({
      community,
      mode: "map",
      seed: Date.now() % 1_000_000_000,
      count: Math.min(8, provincesIn(community).length),
    });
    setIds(round.map((question) => question.provinceId));
    setIndex(0);
    setBoard(emptyBoard());
    setWon(0);
    setLost(0);
    setPhase(round.length ? "play" : "brief");
  }

  function guess(raw: string) {
    if (!province || phase !== "play") return;
    const next = applyGuess(province.name, board, raw);
    if (next === board) return;
    setBoard(next);
    if (next.status === "won") {
      playCue("ok", sound);
      setWon((count) => count + 1);
      remember(province.id, true);
    } else if (next.status === "lost") {
      playCue("no", sound);
      setLost((count) => count + 1);
      remember(province.id, false);
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
        <Capybara mood="think" label="Ahorcado" />
        <h1>Ahorcado</h1>
        <p>
          La pista no dice el nombre. Cada fallo añade un trazo y al sexto se completa el dibujo. La <strong>ñ</strong> es una letra
          distinta. Las tildes salen solas al acertar la vocal.
        </p>
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
        <p className="help">Salen {Math.min(8, available)} provincias.</p>
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
        <p>Las completadas pasan a Repasar fallos.</p>
        <button className="primary" type="button" onClick={begin}>
          Otra ronda
        </button>
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
      </section>
    );
  }

  if (!province) return null;
  const open = board.status !== "playing";
  const clue = hangmanClue(province);

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
      <h2>{clue}</h2>
      <p className="hang-word" aria-label={open ? province.name : "Provincia por letras"}>
        {[...province.name].map((char, charIndex) => {
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
            {board.status === "won" ? `Sí. ${province.name}.` : `Era ${province.name}.`}
          </p>
          <p>
            {province.community}. Capital: {province.capital}.
          </p>
          <SpainMap activeId={province.id} tone="quiz" label={`Mapa con ${province.name} marcada`} />
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
                const good = used && [...province.name].some((char) => hangKey(char) === letter);
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
