import { useState } from "react";
import { ReliefMap } from "../components/ReliefMap";
import { RANGES } from "../../shared/ranges";

export function RangeAtlasScreen({ onExit }: { onExit: () => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = RANGES.find((unit) => unit.id === activeId) ?? null;

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
        <p>12 unidades</p>
      </div>
      <h1>Mapa de cordilleras</h1>
      <p>Toca una para verla en naranja. El marrón es montaña y el verde es depresión. El número es para encontrarla en el mapa.</p>
      <ReliefMap
        activeId={active?.id}
        numbers="all"
        label={active ? `Mapa con ${active.name}` : "Mapa de España con las cordilleras"}
      />
      {active ? (
        <p className="feedback">
          <strong>
            {active.number}. {active.name}
          </strong>
          . {active.where}
        </p>
      ) : null}
      <ul className="atlas">
        {RANGES.map((unit) => (
          <li key={unit.id}>
            <button type="button" className={unit.id === activeId ? "row on" : "row"} onClick={() => setActiveId(unit.id)}>
              <span>
                {unit.number}. {unit.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
