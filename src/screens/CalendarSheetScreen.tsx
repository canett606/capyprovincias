import { useState } from "react";
import { Capybara } from "../components/Capybara";
import { DAYS, MONTHS_FIRST, MONTHS_SECOND, SCHOOL_DAYS, WEEKEND_DAYS, type CalendarItem } from "../../shared/valencia";

export function CalendarSheetScreen({ onExit }: { onExit: () => void }) {
  const [covered, setCovered] = useState(false);
  const [open, setOpen] = useState<string[]>([]);

  function toggle(id: string) {
    setOpen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section className="card">
      <Capybara mood="happy" label="Els dies i els mesos" />
      <h1>Els dies i els mesos</h1>
      <p>Primero míralos. Luego tapa el valenciano y pulsa cada uno para comprobar cómo se escribe.</p>
      <button
        className="primary"
        type="button"
        onClick={() => {
          setCovered((value) => !value);
          setOpen([]);
        }}
      >
        {covered ? "Ver las respuestas" : "Tapar el valenciano"}
      </button>
      <SheetGroup title="Dies lectius" help="De dilluns a divendres. Lunes a viernes." items={SCHOOL_DAYS} covered={covered} open={open} onToggle={toggle} />
      <SheetGroup title="Cap de setmana" help="Sábado y domingo." items={WEEKEND_DAYS} covered={covered} open={open} onToggle={toggle} />
      <SheetGroup title="Primera meitat de l'any" help="Enero a junio." items={MONTHS_FIRST} covered={covered} open={open} onToggle={toggle} />
      <SheetGroup title="Segona meitat de l'any" help="Julio a diciembre." items={MONTHS_SECOND} covered={covered} open={open} onToggle={toggle} />
      <p className="help">Son {DAYS.length} días y {MONTHS_FIRST.length + MONTHS_SECOND.length} meses. Dijous, el jueves, solo está una vez.</p>
      <button className="ghost" type="button" onClick={onExit}>
        Volver
      </button>
    </section>
  );
}

function SheetGroup({
  title,
  help,
  items,
  covered,
  open,
  onToggle,
}: {
  title: string;
  help: string;
  items: readonly CalendarItem[];
  covered: boolean;
  open: readonly string[];
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <h2>{title}</h2>
      <p className="help">{help}</p>
      <ul className="atlas">
        {items.map((item) => {
          const shown = !covered || open.includes(item.id);
          const tone = item.kind === "dia" ? `d${item.order}` : item.order <= 6 ? "m1" : "m2";
          return (
            <li key={item.id}>
              <button
                type="button"
                className={shown ? "sheet-card" : "sheet-card hidden"}
                data-tone={tone}
                aria-expanded={shown}
                onClick={() => onToggle(item.id)}
              >
                <strong>{shown ? item.name : "· · ·"}</strong>
                <span>{item.spanish}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
