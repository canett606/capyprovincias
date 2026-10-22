import { CANARY_FRAME, MAP_VIEW, PATHS } from "../../shared/mapPaths";
import { COMMUNITY_COLOR, getProvince } from "../../shared/provinces";

const QUIZ_FILL = "#d5ebe4";

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
  return (
    <svg className="spain" viewBox={`0 0 ${MAP_VIEW.w} ${MAP_VIEW.h}`} role="img" aria-label={label}>
      <rect width={MAP_VIEW.w} height={MAP_VIEW.h} rx="18" fill="#8ecfe0" />
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
      <text x={CANARY_FRAME.x + 10} y={CANARY_FRAME.y + 14} fill="#1b2a28" fontSize="11" fontFamily="Trebuchet MS, Segoe UI, sans-serif">
        Canarias
      </text>
      {ordered.map((id) => {
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
            strokeWidth={active ? 2.2 : 1}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
