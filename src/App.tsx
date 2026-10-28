import { useEffect, useState } from "react";
import { playCue } from "./audio";
import { Capybara } from "./components/Capybara";
import { activePerson, choosePerson, clearActive, listPeople, loadSave, personBlurb, personKey, writeSave } from "./progress";
import { AtlasScreen } from "./screens/AtlasScreen";
import { HangmanScreen } from "./screens/HangmanScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { RangeAtlasScreen } from "./screens/RangeAtlasScreen";
import { RangeHangmanScreen } from "./screens/RangeHangmanScreen";
import { RangeQuizScreen } from "./screens/RangeQuizScreen";
import { CalendarHangmanScreen } from "./screens/CalendarHangmanScreen";
import { CalendarQuizScreen } from "./screens/CalendarQuizScreen";
import { CalendarSheetScreen } from "./screens/CalendarSheetScreen";
import { NounRulesScreen } from "./screens/NounRulesScreen";
import { NounScreen } from "./screens/NounScreen";
import { RiverAtlasScreen } from "./screens/RiverAtlasScreen";
import { RiverHangmanScreen } from "./screens/RiverHangmanScreen";
import { RiverQuizScreen } from "./screens/RiverQuizScreen";
import { ValenciaHome } from "./screens/ValenciaHome";

function routeOf(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  return raw.split("?")[0] || "/";
}

export function App() {
  const [route, setRoute] = useState(routeOf);
  const [save, setSave] = useState(loadSave);
  useEffect(() => {
    const onHash = () => {
      setRoute(routeOf());
      setSave(loadSave());
    };
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/";
    if (!activePerson() && routeOf() !== "/") window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const apply = () => {
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--keyboard", `${Math.round(covered)}px`);
    };
    apply();
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    return () => {
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
      document.documentElement.style.removeProperty("--keyboard");
    };
  }, []);

  const go = (path: string) => {
    playCue("tap", save.sound);
    window.location.hash = path;
  };

  let screen = <Gate onGo={go} />;
  if (!activePerson()) screen = <Gate onGo={go} />;
  else if (route === "/provincias-inicio") screen = <Home save={save} onSave={setSave} onGo={go} />;
  else if (route === "/rios-inicio") screen = <RiverHome save={save} onSave={setSave} onGo={go} />;
  else if (route === "/cordilleras-inicio") screen = <RangeHome save={save} onSave={setSave} onGo={go} />;
  else if (route === "/preguntas") screen = <QuizScreen mode="text" onExit={() => go("/provincias-inicio")} />;
  else if (route === "/mapa") screen = <QuizScreen mode="map" onExit={() => go("/provincias-inicio")} />;
  else if (route === "/repaso") screen = <QuizScreen mode="review" onExit={() => go("/provincias-inicio")} />;
  else if (route === "/ahorcado") screen = <HangmanScreen onExit={() => go("/provincias-inicio")} />;
  else if (route === "/provincias") screen = <AtlasScreen onExit={() => go("/provincias-inicio")} />;
  else if (route === "/rios") screen = <RiverQuizScreen mode="practica" onExit={() => go("/rios-inicio")} />;
  else if (route === "/rios-examen") screen = <RiverQuizScreen mode="examen" onExit={() => go("/rios-inicio")} />;
  else if (route === "/rios-repaso") screen = <RiverQuizScreen mode="repaso" onExit={() => go("/rios-inicio")} />;
  else if (route === "/rios-ahorcado") screen = <RiverHangmanScreen onExit={() => go("/rios-inicio")} />;
  else if (route === "/rios-mapa") screen = <RiverAtlasScreen onExit={() => go("/rios-inicio")} />;
  else if (route === "/cordilleras") screen = <RangeQuizScreen mode="practica" onExit={() => go("/cordilleras-inicio")} />;
  else if (route === "/cordilleras-examen") screen = <RangeQuizScreen mode="examen" onExit={() => go("/cordilleras-inicio")} />;
  else if (route === "/cordilleras-repaso") screen = <RangeQuizScreen mode="repaso" onExit={() => go("/cordilleras-inicio")} />;
  else if (route === "/cordilleras-ahorcado") screen = <RangeHangmanScreen onExit={() => go("/cordilleras-inicio")} />;
  else if (route === "/cordilleras-mapa") screen = <RangeAtlasScreen onExit={() => go("/cordilleras-inicio")} />;
  else if (route === "/valencia-inicio") screen = <ValenciaHome save={save} onSave={setSave} onGo={go} />;
  else if (route === "/noms") screen = <NounScreen mode="practica" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/noms-examen") screen = <NounScreen mode="examen" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/noms-repaso") screen = <NounScreen mode="repaso" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/noms-norma") screen = <NounRulesScreen onExit={() => go("/valencia-inicio")} onPractice={() => go("/noms")} />;
  else if (route === "/calendari") screen = <CalendarQuizScreen mode="preguntas" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/calendari-test") screen = <CalendarQuizScreen mode="test" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/calendari-repaso") screen = <CalendarQuizScreen mode="repaso" onExit={() => go("/valencia-inicio")} />;
  else if (route === "/calendari-ahorcado") screen = <CalendarHangmanScreen onExit={() => go("/valencia-inicio")} />;
  else if (route === "/calendari-fitxa") screen = <CalendarSheetScreen onExit={() => go("/valencia-inicio")} />;

  return (
    <main className="app">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <div id="contenido">{screen}</div>
    </main>
  );
}

function Gate({ onGo }: { onGo: (path: string) => void }) {
  const [people, setPeople] = useState(listPeople);
  const [draft, setDraft] = useState("");
  const person = activePerson();
  const known = personKey(draft);

  function refresh() {
    setPeople(listPeople());
  }

  function enter(name: string) {
    if (!choosePerson(name)) return;
    setDraft("");
    refresh();
  }

  if (!person) {
    return (
      <section>
        <header className="hero">
          <Capybara mood="happy" label="¿Quién practica?" />
          <p className="eyebrow">Un enlace, cada persona</p>
          <h1>¿Quién practica?</h1>
          <p>Escribe tu nombre. Los fallos y el repaso se guardan aparte para cada persona, en este aparato.</p>
          {people.length > 0 ? (
            <nav className="menu" aria-label="Personas">
              {people.map((item) => (
                <button className="primary" type="button" key={item.key} onClick={() => enter(item.name)}>
                  {item.name}
                  <small>{personBlurb(item)}</small>
                </button>
              ))}
            </nav>
          ) : null}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              enter(draft);
            }}
          >
            <label>
              {people.length > 0 ? "Otra persona" : "Tu nombre"}
              <input
                value={draft}
                maxLength={16}
                autoComplete="nickname"
                enterKeyHint="go"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  enter(draft);
                }}
              />
            </label>
            <button className="primary" type="submit" aria-disabled={!known}>
              Empezar
            </button>
          </form>
        </header>
      </section>
    );
  }

  const verbs = `https://canett606.github.io/capyverbs/?usuario=${encodeURIComponent(person.name)}`;
  return (
    <section>
      <header className="hero">
        <Capybara mood="happy" label="Elige un juego" />
        <p className="eyebrow">Hola, {person.name}</p>
        <h1>Elige</h1>
        <p>Entra en el que quieras. Tu repaso no se mezcla con el de otra persona.</p>
      </header>
      <nav className="menu" aria-label="Juegos">
        <button className="primary" type="button" onClick={() => onGo("/valencia-inicio")}>
          CapyValencià
          <small>Gènere, dies i mesos</small>
        </button>
        <a className="primary" href={verbs}>
          CapyVerbs
          <small>Los verbos irregulares</small>
        </a>
        <button className="primary" type="button" onClick={() => onGo("/provincias-inicio")}>
          CapyProvincias
          <small>Las 50 provincias</small>
        </button>
        <button className="primary" type="button" onClick={() => onGo("/rios-inicio")}>
          CapyRíos
          <small>Los 22 ríos del examen</small>
        </button>
        <button className="primary" type="button" onClick={() => onGo("/cordilleras-inicio")}>
          CapyCordilleras
          <small>Cordilleras, montes y depresiones</small>
        </button>
      </nav>
      <div className="menu">
        <button
          className="ghost"
          type="button"
          onClick={() => {
            clearActive();
            refresh();
          }}
        >
          Cambiar de persona
        </button>
      </div>
    </section>
  );
}

function Home({
  save,
  onSave,
  onGo,
}: {
  save: ReturnType<typeof loadSave>;
  onSave: (save: ReturnType<typeof loadSave>) => void;
  onGo: (path: string) => void;
}) {
  const misses = Object.keys(save.wrong).length;
  const who = activePerson();
  return (
    <section>
      <button className="ghost back" type="button" onClick={() => onGo("/")}>
        Elegir otro juego
      </button>
      <header className="hero">
        <Capybara mood="happy" label="CapyProvincias" />
        <p className="eyebrow">{who ? who.name : "Mapa de provincias"}</p>
        <h1>CapyProvincias</h1>
        <p>Las 50 provincias de España. Escribes el nombre en este móvil, sin cuenta.</p>
      </header>
      <nav className="menu" aria-label="Modos">
        <button className="primary" type="button" onClick={() => onGo("/preguntas")}>
          Preguntas
        </button>
        <button className="primary" type="button" onClick={() => onGo("/ahorcado")}>
          Ahorcado
        </button>
        <button className="primary" type="button" onClick={() => onGo("/mapa")}>
          Mapa
        </button>
        <button className="primary" type="button" onClick={() => onGo("/repaso")}>
          Repasar fallos{misses ? ` (${misses})` : ""}
        </button>
      </nav>
      <div className="subnav">
        <button className="ghost" type="button" onClick={() => onGo("/provincias")}>
          Las 50 provincias
        </button>
        <button
          className="ghost"
          type="button"
          onClick={() => {
            const next = { ...save, sound: !save.sound };
            writeSave(next);
            onSave(next);
          }}
        >
          Sonido: {save.sound ? "sí" : "no"}
        </button>
      </div>
    </section>
  );
}

function RiverHome({
  save,
  onSave,
  onGo,
}: {
  save: ReturnType<typeof loadSave>;
  onSave: (save: ReturnType<typeof loadSave>) => void;
  onGo: (path: string) => void;
}) {
  const riverMisses = Object.keys(save.rivers).length;
  const who = activePerson();
  return (
    <section>
      <button className="ghost back" type="button" onClick={() => onGo("/")}>
        Elegir otro juego
      </button>
      <header className="hero">
        <Capybara mood="happy" label="CapyRíos" />
        <p className="eyebrow">{who ? who.name : "Hidrografía"}</p>
        <h1>CapyRíos</h1>
        <p>Los 22 ríos de la ficha. Escribe el nombre con el teclado, también en el móvil.</p>
      </header>
      <nav className="menu" aria-label="Ríos">
        <button className="primary" type="button" onClick={() => onGo("/rios")}>
          Escribir el río
        </button>
        <button className="primary" type="button" onClick={() => onGo("/rios-ahorcado")}>
          Ahorcado
        </button>
        <button className="primary" type="button" onClick={() => onGo("/rios-examen")}>
          Repaso para examen
        </button>
        <button className="primary" type="button" onClick={() => onGo("/rios-repaso")}>
          Ríos fallados{riverMisses ? ` (${riverMisses})` : ""}
        </button>
        <button className="primary" type="button" onClick={() => onGo("/rios-mapa")}>
          Mapa de ríos
        </button>
      </nav>
      <div className="subnav">
        <button
          className="ghost"
          type="button"
          onClick={() => {
            const next = { ...save, sound: !save.sound };
            writeSave(next);
            onSave(next);
          }}
        >
          Sonido: {save.sound ? "sí" : "no"}
        </button>
      </div>
    </section>
  );
}

function RangeHome({
  save,
  onSave,
  onGo,
}: {
  save: ReturnType<typeof loadSave>;
  onSave: (save: ReturnType<typeof loadSave>) => void;
  onGo: (path: string) => void;
}) {
  const misses = Object.keys(save.ranges).length;
  const who = activePerson();
  return (
    <section>
      <button className="ghost back" type="button" onClick={() => onGo("/")}>
        Elegir otro juego
      </button>
      <header className="hero">
        <Capybara mood="happy" label="CapyCordilleras" />
        <p className="eyebrow">{who ? who.name : "Relieve"}</p>
        <h1>CapyCordilleras</h1>
        <p>Las 12 de la ficha: cordilleras, montes y depresiones. Escribe el nombre con el teclado, también en el móvil.</p>
      </header>
      <nav className="menu" aria-label="Cordilleras">
        <button className="primary" type="button" onClick={() => onGo("/cordilleras")}>
          Escribir el nombre
        </button>
        <button className="primary" type="button" onClick={() => onGo("/cordilleras-ahorcado")}>
          Ahorcado
        </button>
        <button className="primary" type="button" onClick={() => onGo("/cordilleras-examen")}>
          Repaso para examen
        </button>
        <button className="primary" type="button" onClick={() => onGo("/cordilleras-repaso")}>
          Cordilleras falladas{misses ? ` (${misses})` : ""}
        </button>
        <button className="primary" type="button" onClick={() => onGo("/cordilleras-mapa")}>
          Mapa del relieve
        </button>
      </nav>
      <div className="subnav">
        <button
          className="ghost"
          type="button"
          onClick={() => {
            const next = { ...save, sound: !save.sound };
            writeSave(next);
            onSave(next);
          }}
        >
          Sonido: {save.sound ? "sí" : "no"}
        </button>
      </div>
    </section>
  );
}
