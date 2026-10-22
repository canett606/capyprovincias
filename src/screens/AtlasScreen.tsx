import { useMemo, useState } from "react";
import { SpainMap } from "../components/SpainMap";
import { COMMUNITIES, PROVINCES, type Province } from "../../shared/provinces";

export function AtlasScreen({ onExit }: { onExit: () => void }) {
  const [community, setCommunity] = useState("todas");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("madrid");
  const needle = query.trim().toLocaleLowerCase("es");
  const visible = useMemo(
    () =>
      PROVINCES.filter((province) => community === "todas" || province.community === community).filter((province) => {
        if (!needle) return true;
        const blob = [province.name, province.community, province.capital, ...province.aliases, ...province.cities]
          .join(" ")
          .toLocaleLowerCase("es");
        return blob.includes(needle);
      }),
    [community, needle],
  );
  const current = PROVINCES.find((province) => province.id === selected) ?? visible[0];

  return (
    <section className="card">
      <div className="play-top dark">
        <button className="ghost" type="button" onClick={onExit}>
          Volver
        </button>
        <p>50 provincias</p>
      </div>
      <h1>Las provincias</h1>
      <p className="help">Ceuta y Melilla salen en el mapa, en beige. Son ciudades autónomas, no provincias, y no entran en los juegos.</p>
      {current ? <ProvinceNote province={current} /> : null}
      <SpainMap activeId={current?.id} tone="atlas" label={current ? `Mapa con ${current.name} marcada` : "Mapa de las provincias"} />
      <label>
        Buscar
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Vigo, Bizkaia, Galicia…" />
      </label>
      <label>
        Comunidad
        <select value={community} onChange={(event) => setCommunity(event.target.value)}>
          <option value="todas">Todas</option>
          {COMMUNITIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <ul className="atlas">
        {visible.map((province) => (
          <li key={province.id}>
            <button type="button" className={province.id === current?.id ? "row on" : "row"} onClick={() => setSelected(province.id)}>
              <span>{province.name}</span>
              <small>{province.capital}</small>
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? <p>Ninguna provincia coincide con esa búsqueda.</p> : null}
    </section>
  );
}

function ProvinceNote({ province }: { province: Province }) {
  return (
    <p>
      <strong>{province.name}</strong>. {province.community}. Capital: {province.capital}.
      {province.aliases.length ? ` También vale ${province.aliases.join(", ")}.` : ""}
    </p>
  );
}
