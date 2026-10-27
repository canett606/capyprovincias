import { useState } from "react";
import { RiverMap } from "../components/RiverMap";
import { RIVERS } from "../../shared/rivers";

export function RiverAtlasScreen({ onExit }: { onExit: () => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = RIVERS.find((river) => river.id === activeId) ?? null;

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
        <p>22 ríos</p>
      </div>
      <h1>Mapa de ríos</h1>
      <p>Toca un río para verlo en naranja. El número es el de la ficha.</p>
      <RiverMap
        activeId={active?.id}
        numbers="all"
        label={active ? `Mapa con el río ${active.name}` : "Mapa de España con los 22 ríos"}
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
        {RIVERS.map((river) => (
          <li key={river.id}>
            <button type="button" className={river.id === activeId ? "row on" : "row"} onClick={() => setActiveId(river.id)}>
              <span>
                {river.number}. {river.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
