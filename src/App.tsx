import { useEffect, useState } from "react";
import { playCue } from "./audio";
import { Capybara } from "./components/Capybara";
import { loadSave, writeSave } from "./progress";
import { AtlasScreen } from "./screens/AtlasScreen";
import { HangmanScreen } from "./screens/HangmanScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { RiverAtlasScreen } from "./screens/RiverAtlasScreen";
import { RiverHangmanScreen } from "./screens/RiverHangmanScreen";
import { RiverQuizScreen } from "./screens/RiverQuizScreen";

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
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (path: string) => {
    playCue("tap", save.sound);
    window.location.hash = path;
  };

  let screen = <Home save={save} onSave={setSave} onGo={go} />;
  if (route === "/preguntas") screen = <QuizScreen mode="text" onExit={() => go("/")} />;
  else if (route === "/mapa") screen = <QuizScreen mode="map" onExit={() => go("/")} />;
  else if (route === "/repaso") screen = <QuizScreen mode="review" onExit={() => go("/")} />;
  else if (route === "/ahorcado") screen = <HangmanScreen onExit={() => go("/")} />;
  else if (route === "/provincias") screen = <AtlasScreen onExit={() => go("/")} />;
  else if (route === "/rios") screen = <RiverQuizScreen mode="practica" onExit={() => go("/")} />;
  else if (route === "/rios-examen") screen = <RiverQuizScreen mode="examen" onExit={() => go("/")} />;
  else if (route === "/rios-repaso") screen = <RiverQuizScreen mode="repaso" onExit={() => go("/")} />;
  else if (route === "/rios-ahorcado") screen = <RiverHangmanScreen onExit={() => go("/")} />;
  else if (route === "/rios-mapa") screen = <RiverAtlasScreen onExit={() => go("/")} />;

  return (
    <main className="app">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <div id="contenido">{screen}</div>
    </main>
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
  const riverMisses = Object.keys(save.rivers).length;
  return (
    <section>
      <header className="hero">
        <Capybara mood="happy" label="CapyProvincias" />
        <p className="eyebrow">Mapa de provincias</p>
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
      <h2 className="block-title">Ríos del examen</h2>
      <p className="help">Los 22 de la ficha. Escribe el nombre con el teclado, también en el móvil.</p>
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
    </section>
  );
}
