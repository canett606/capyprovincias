import { CANARY_FRAME, PATHS } from "../../shared/mapPaths";
import { COMMUNITY_COLOR, getProvince } from "../../shared/provinces";

const QUIZ_FILL = "#d5ebe4";
const CANARY_IDS = new Set(["las-palmas", "tenerife"]);
const CANARY_LIFT = -56;

export function SpainMap({
  activeId,
  tone,
  label,
}: {
  activeId?: string;
  tone: "quiz" | "atlas";
  label: string;
}) {
  const ids = Object.keys(PATHS);
  const ordered = [...ids.filter((id) => id !== activeId), ...(activeId ? [activeId] : [])];
  const draw = (id: string) => {
        const known = id === "ceuta" || id === "melilla" ? null : getProvince(id);
        const active = id === activeId;
        const city = id === "ceuta" || id === "melilla";
        const fill = active ? "#ef7d1a" : city ? "#e7d3c4" : tone === "atlas" && known ? COMMUNITY_COLOR[known.community] : QUIZ_FILL;
        return (
          <path
            key={id}
            d={PATHS[id]}
            fill={fill}
            stroke={active ? "#1b2a28" : "#fffaf3"}
            strokeWidth={active ? 2.4 : 1.15}
            strokeLinejoin="round"
          />
        );
      };
  return (
    <div className="spain-frame">
      <svg className="spain" viewBox="6 46 348 328" role="img" aria-label={label}>
        <rect x="6" y="46" width="348" height="328" rx="18" fill="#8ecfe0" />
        {ordered.filter((id) => !CANARY_IDS.has(id)).map(draw)}
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
          {ordered.filter((id) => CANARY_IDS.has(id)).map(draw)}
        </g>
      </svg>
    </div>
  );
}
