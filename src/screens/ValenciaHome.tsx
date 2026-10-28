import { Capybara } from "../components/Capybara";
import { activePerson, writeSave, type Save } from "../progress";

export function ValenciaHome({
  save,
  onSave,
  onGo,
}: {
  save: Save;
  onSave: (save: Save) => void;
  onGo: (path: string) => void;
}) {
  const nounMisses = Object.keys(save.nouns).length;
  const calendarMisses = Object.keys(save.calendar).length;
  const who = activePerson();
  return (
    <section>
      <button className="ghost back" type="button" onClick={() => onGo("/")}>
        Elegir otro juego
      </button>
      <header className="hero">
        <Capybara mood="happy" label="CapyValencià" />
        <p className="eyebrow">{who ? who.name : "Valencià"}</p>
        <h1>CapyValencià</h1>
        <p>El examen de gènere i nombre, y los dies i mesos. Se escribe con el teclado, también en el móvil.</p>
      </header>
      <section className="card stack">
        <h2>Examen: gènere i nombre</h2>
        <p>Di si la paraula es masculí o femení, y si es singular o plural.</p>
        <nav className="menu" aria-label="Gènere i nombre">
          <button className="primary" type="button" onClick={() => onGo("/noms")}>
            Practicar
          </button>
          <button className="primary" type="button" onClick={() => onGo("/noms-examen")}>
            Examen
          </button>
          <button className="primary" type="button" onClick={() => onGo("/noms-repaso")}>
            Paraules falladas{nounMisses ? ` (${nounMisses})` : ""}
          </button>
          <button className="primary" type="button" onClick={() => onGo("/noms-norma")}>
            La norma
          </button>
        </nav>
      </section>
      <section className="card stack">
        <h2>Dies i mesos</h2>
        <p>Apréndelos en la ficha y luego escríbelos: preguntas, test, ahorcado y repaso.</p>
        <nav className="menu" aria-label="Dies i mesos">
          <button className="primary" type="button" onClick={() => onGo("/calendari-fitxa")}>
            La ficha
          </button>
          <button className="primary" type="button" onClick={() => onGo("/calendari")}>
            Preguntas
          </button>
          <button className="primary" type="button" onClick={() => onGo("/calendari-ahorcado")}>
            Ahorcado
          </button>
          <button className="primary" type="button" onClick={() => onGo("/calendari-test")}>
            Test
          </button>
          <button className="primary" type="button" onClick={() => onGo("/calendari-repaso")}>
            Dies y meses fallados{calendarMisses ? ` (${calendarMisses})` : ""}
          </button>
        </nav>
      </section>
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
