import { CANARY_FRAME, PATHS } from "../../shared/mapPaths";
import { RIVERS } from "../../shared/rivers";

const CANARY_IDS = new Set(["las-palmas", "tenerife"]);
const CANARY_LIFT = -56;
const LAND = "#d5ebe4";

export function RiverMap({
  activeId,
  numbers,
  label,
  onPick,
}: {
  activeId?: string;
  numbers: "all" | "active" | "off";
  label: string;
  onPick?: (id: string) => void;
}) {
  const ids = Object.keys(PATHS);
  const drawLand = (id: string) => (
    <path key={id} d={PATHS[id]} fill={LAND} stroke={LAND} strokeWidth={1.3} strokeLinejoin="round" />
  );
  const ordered = [...RIVERS.filter((river) => river.id !== activeId), ...RIVERS.filter((river) => river.id === activeId)];
  const picked = onPick ? RIVERS.find((river) => river.id === activeId) : undefined;

  return (
    <div className="spain-frame">
      <svg className="spain" viewBox="6 46 348 328" role="img" aria-label={label}>
        <rect x="6" y="46" width="348" height="328" rx="18" fill="#8ecfe0" />
        {ids.filter((id) => !CANARY_IDS.has(id)).map(drawLand)}
        <text x="300" y="58" fill="#14566a" fontSize="12" fontFamily="Trebuchet MS, Segoe UI, sans-serif">
          Francia
        </text>
        <text
          x="16"
          y="170"
          fill="#14566a"
          fontSize="12"
          fontFamily="Trebuchet MS, Segoe UI, sans-serif"
          transform="rotate(-90 16 170)"
        >
          Portugal
        </text>
        {ordered.map((river) => {
          const active = river.id === activeId;
          const width = active ? 4.4 : river.major ? 2.5 : 1.7;
          return (
            <g key={river.id}>
              <path d={river.d} fill="none" stroke="#fffaf3" strokeWidth={width + 1.8} strokeLinecap="round" strokeLinejoin="round" />
              <path
                d={river.d}
                fill="none"
                stroke={active ? "#ef7d1a" : "#1d5f9e"}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {!onPick && (numbers === "all" || (numbers === "active" && active)) ? (
                <text
                  x={river.label[0]}
                  y={river.label[1]}
                  fill="#1b2a28"
                  stroke="#fffaf3"
                  strokeWidth="2.4"
                  paintOrder="stroke"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Trebuchet MS, Segoe UI, sans-serif"
                >
                  {river.number}
                </text>
              ) : null}
            </g>
          );
        })}
        <g transform={`translate(0 ${CANARY_LIFT})`}>
          <rect
            x={CANARY_FRAME.x}
            y={CANARY_FRAME.y}
            width={CANARY_FRAME.w}
            height={CANARY_FRAME.h}
            rx="12"
            fill="#d7f3f8"
            stroke="#1b2a28"
            strokeWidth="1.4"
          />
          <text x={CANARY_FRAME.x + 10} y={CANARY_FRAME.y + 16} fill="#1b2a28" fontSize="13" fontFamily="Trebuchet MS, Segoe UI, sans-serif">
            Canarias
          </text>
          {ids.filter((id) => CANARY_IDS.has(id)).map(drawLand)}
        </g>
        {onPick
          ? ordered.map((river) => {
              const [x, y] = river.label;
              const active = river.id === activeId;
              return (
                <g
                  key={`${river.id}-hit`}
                  className="river-hit"
                  role="button"
                  tabIndex={0}
                  aria-label={`Número ${river.number}`}
                  onClick={() => onPick(river.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onPick(river.id);
                    }
                  }}
                >
                  <circle cx={x + 6} cy={y - 4} r="16" fill="transparent" />
                  <circle className="badge" cx={x + 6} cy={y - 4} r="9" fill={active ? "#ef7d1a" : "#fffaf3"} stroke="#1b2a28" strokeWidth="1.3" />
                  <text
                    x={x + 6}
                    y={y - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#1b2a28"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Trebuchet MS, Segoe UI, sans-serif"
                    pointerEvents="none"
                  >
                    {river.number}
                  </text>
                </g>
              );
            })
          : null}
      </svg>
      {picked ? (
        <div className="map-name" role="status">
          <strong>
            {picked.number}. {picked.name}
          </strong>
          <p>{picked.where}</p>
        </div>
      ) : null}
    </div>
  );
}
