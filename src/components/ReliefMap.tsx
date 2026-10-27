import { CANARY_FRAME, PATHS } from "../../shared/mapPaths";
import { RANGES, type RangeUnit } from "../../shared/ranges";

const CANARY_IDS = new Set(["las-palmas", "tenerife"]);
const CANARY_LIFT = -56;
const LAND = "#d5ebe4";

export function ReliefMap({
  activeId,
  numbers,
  label,
}: {
  activeId?: string;
  numbers: "all" | "active" | "off";
  label: string;
}) {
  const ids = Object.keys(PATHS);
  const drawLand = (id: string) => (
    <path key={id} d={PATHS[id]} fill={LAND} stroke={LAND} strokeWidth={1.3} strokeLinejoin="round" />
  );
  const ordered = [...RANGES.filter((unit) => unit.id !== activeId), ...RANGES.filter((unit) => unit.id === activeId)];

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
        {ordered.map((unit) => (
          <RangeShape key={unit.id} unit={unit} active={unit.id === activeId} numbers={numbers} />
        ))}
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
      </svg>
    </div>
  );
}

function RangeShape({
  unit,
  active,
  numbers,
}: {
  unit: RangeUnit;
  active: boolean;
  numbers: "all" | "active" | "off";
}) {
  const valley = unit.kind === "valle";
  const fill = active ? "#ef7d1a" : valley ? "#7dcea0" : "#c4a574";
  const stroke = active ? "#9a4e08" : valley ? "#1f7a4d" : "#6b4423";
  return (
    <g>
      <ellipse
        cx={unit.cx}
        cy={unit.cy}
        rx={unit.rx}
        ry={unit.ry}
        transform={`rotate(${unit.rotate} ${unit.cx} ${unit.cy})`}
        fill={fill}
        fillOpacity={active ? 0.92 : 0.78}
        stroke="#fffaf3"
        strokeWidth={active ? 3.2 : 2}
      />
      <ellipse
        cx={unit.cx}
        cy={unit.cy}
        rx={unit.rx}
        ry={unit.ry}
        transform={`rotate(${unit.rotate} ${unit.cx} ${unit.cy})`}
        fill="none"
        stroke={stroke}
        strokeWidth={active ? 2.2 : 1.4}
        strokeDasharray={valley ? "4 2" : undefined}
      />
      {numbers === "all" || (numbers === "active" && active) ? (
        <text
          x={unit.cx}
          y={unit.cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#1b2a28"
          stroke="#fffaf3"
          strokeWidth="2.4"
          paintOrder="stroke"
          fontSize="11"
          fontWeight="700"
          fontFamily="Trebuchet MS, Segoe UI, sans-serif"
        >
          {unit.number}
        </text>
      ) : null}
    </g>
  );
}
