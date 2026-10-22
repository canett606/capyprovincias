import { readFileSync, writeFileSync } from "node:fs";

const NAME_TO_ID = {
  "Illes Balears": "balears",
  Asturias: "asturias",
  "A Coruña": "coruna",
  Girona: "girona",
  "Las Palmas": "las-palmas",
  Pontevedra: "pontevedra",
  "Santa Cruz De Tenerife": "tenerife",
  Cantabria: "cantabria",
  Málaga: "malaga",
  Almería: "almeria",
  Murcia: "murcia",
  Albacete: "albacete",
  Ávila: "avila",
  "Araba/Álava": "alava",
  Badajoz: "badajoz",
  "Alacant/Alicante": "alicante",
  Ourense: "ourense",
  Barcelona: "barcelona",
  Burgos: "burgos",
  Cáceres: "caceres",
  Cádiz: "cadiz",
  "Castelló/Castellón": "castellon",
  "Ciudad Real": "ciudad-real",
  Jaén: "jaen",
  Córdoba: "cordoba",
  Cuenca: "cuenca",
  Granada: "granada",
  Guadalajara: "guadalajara",
  "Gipuzkoa/Guipúzcoa": "gipuzkoa",
  Huelva: "huelva",
  Huesca: "huesca",
  León: "leon",
  Lleida: "lleida",
  "La Rioja": "rioja",
  Soria: "soria",
  Navarra: "navarra",
  Ceuta: "ceuta",
  Lugo: "lugo",
  Madrid: "madrid",
  Palencia: "palencia",
  Salamanca: "salamanca",
  Segovia: "segovia",
  Sevilla: "sevilla",
  Toledo: "toledo",
  Tarragona: "tarragona",
  Teruel: "teruel",
  "València/Valencia": "valencia",
  Valladolid: "valladolid",
  "Bizkaia/Vizcaya": "bizkaia",
  Zamora: "zamora",
  Zaragoza: "zaragoza",
  Melilla: "melilla",
};

const VIEW = { w: 360, h: 430 };
const MAIN = { x: 4, y: 4, w: 352, h: 312 };
const CANARY = { x: 12, y: 332, w: 158, h: 90 };

const geo = JSON.parse(readFileSync(new URL("../data/spain-provinces.geojson", import.meta.url), "utf8"));

function polygonsOf(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function isCanary(lon) {
  return lon < -12;
}

function bboxOf(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function scaler(bbox, rect, pad) {
  const [minX, minY, maxX, maxY] = bbox;
  const bw = Math.max(0.0001, maxX - minX);
  const bh = Math.max(0.0001, maxY - minY);
  const innerW = rect.w - pad * 2;
  const innerH = rect.h - pad * 2;
  const scale = Math.min(innerW / bw, innerH / bh);
  const ox = rect.x + pad + (innerW - bw * scale) / 2;
  const oy = rect.y + pad + (innerH - bh * scale) / 2;
  return (lon, lat) => [ox + (lon - minX) * scale, oy + (maxY - lat) * scale];
}

function distToSeg(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function simplify(points, epsilon) {
  if (points.length < 4) return points;
  let closed = false;
  let pts = points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) {
    closed = true;
    pts = points.slice(0, -1);
  }
  if (pts.length < 3) return points;
  const keep = new Array(pts.length).fill(false);
  keep[0] = true;
  keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    let max = 0;
    let index = -1;
    for (let i = start + 1; i < end; i += 1) {
      const distance = distToSeg(pts[i], pts[start], pts[end]);
      if (distance > max) {
        max = distance;
        index = i;
      }
    }
    if (index !== -1 && max > epsilon) {
      keep[index] = true;
      stack.push([start, index], [index, end]);
    }
  }
  const out = pts.filter((_, index) => keep[index]);
  if (closed) out.push(out[0]);
  return out;
}

function ringArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    sum += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
  }
  return Math.abs(sum) / 2;
}

function pathFrom(polygons, project) {
  const commands = [];
  for (const polygon of polygons) {
    polygon.forEach((ring, ringIndex) => {
      const projected = ring.map(([lon, lat]) => project(lon, lat));
      const simple = simplify(projected, ringIndex === 0 ? 1.05 : 0.8);
      if (simple.length < 4) return;
      if (ringIndex === 0 && ringArea(simple) < 1.2) return;
      const head = simple[0];
      let command = `M${head[0].toFixed(1)} ${head[1].toFixed(1)}`;
      for (let i = 1; i < simple.length; i += 1) {
        command += `L${simple[i][0].toFixed(1)} ${simple[i][1].toFixed(1)}`;
      }
      commands.push(`${command}Z`);
    });
  }
  return commands.join("");
}

function dot(project, lon, lat) {
  const [x, y] = project(lon, lat);
  const r = 4.5;
  return `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${(r * 2).toFixed(1)} 0a${r} ${r} 0 1 0 -${(r * 2).toFixed(1)} 0Z`;
}

const grouped = new Map();
for (const feature of geo.features) {
  const id = NAME_TO_ID[feature.properties.name];
  if (!id) {
    console.error("Nombre sin id:", feature.properties.name);
    process.exit(1);
  }
  const polygons = polygonsOf(feature.geometry);
  const flat = polygons.flat(2);
  const lon = flat.reduce((sum, point) => sum + point[0], 0) / flat.length;
  const bucket = grouped.get(id) ?? { canary: isCanary(lon), polygons: [] };
  bucket.polygons.push(...polygons);
  grouped.set(id, bucket);
}

const mainPoints = [];
const canaryPoints = [];
for (const bucket of grouped.values()) {
  const target = bucket.canary ? canaryPoints : mainPoints;
  for (const polygon of bucket.polygons) {
    for (const ring of polygon) target.push(...ring);
  }
}

const projectMain = scaler(bboxOf(mainPoints), MAIN, 6);
const projectCanary = scaler(bboxOf(canaryPoints), CANARY, 14);
const paths = {};

for (const [id, bucket] of grouped) {
  const project = bucket.canary ? projectCanary : projectMain;
  let d = pathFrom(bucket.polygons, project);
  if ((id === "ceuta" || id === "melilla") && d.length < 40) {
    const points = bucket.polygons.flat(2);
    const lon = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const lat = points.reduce((sum, point) => sum + point[1], 0) / points.length;
    d = dot(project, lon, lat);
  }
  if (!d) {
    console.error("Sin contorno:", id);
    process.exit(1);
  }
  paths[id] = d;
}

const missing = Object.values(NAME_TO_ID).filter((id) => !paths[id]);
if (missing.length) {
  console.error("Faltan contornos:", missing.join(", "));
  process.exit(1);
}

const lines = Object.keys(paths)
  .sort()
  .map((id) => `  ${JSON.stringify(id)}: ${JSON.stringify(paths[id])},`)
  .join("\n");

const source = `// Contornos simplificados a partir de click_that_hood (MIT). Ver NOTICE.md.
export const MAP_VIEW = ${JSON.stringify(VIEW)} as const;
export const CANARY_FRAME = ${JSON.stringify(CANARY)} as const;

export const PATHS: Record<string, string> = {
${lines}
};
`;

writeFileSync(new URL("../shared/mapPaths.ts", import.meta.url), source);
const bytes = Buffer.byteLength(source);
console.log(`shared/mapPaths.ts ${bytes} bytes, ${Object.keys(paths).length} zonas`);
