export type Province = {
  id: string;
  name: string;
  aliases: string[];
  community: string;
  capital: string;
  cities: string[];
};

export const COMMUNITIES = [
  "Andalucía",
  "Aragón",
  "Principado de Asturias",
  "Illes Balears",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y León",
  "Cataluña",
  "Extremadura",
  "Galicia",
  "Comunidad de Madrid",
  "Región de Murcia",
  "Comunidad Foral de Navarra",
  "País Vasco",
  "La Rioja",
  "Comunitat Valenciana",
] as const;

export const COMMUNITY_COLOR: Record<string, string> = {
  Andalucía: "#f3c7a4",
  Aragón: "#f6e3a4",
  "Principado de Asturias": "#c9e3bf",
  "Illes Balears": "#f6d0e3",
  Canarias: "#f8d7ae",
  Cantabria: "#c5dff4",
  "Castilla-La Mancha": "#e4d2f0",
  "Castilla y León": "#dce8b0",
  Cataluña: "#f6cdc8",
  Extremadura: "#f0ddb4",
  Galicia: "#bfe3c8",
  "Comunidad de Madrid": "#f6c6d6",
  "Región de Murcia": "#f7c9aa",
  "Comunidad Foral de Navarra": "#d3e7b4",
  "País Vasco": "#c9d6f4",
  "La Rioja": "#f3c0c0",
  "Comunitat Valenciana": "#ffe0ad",
};

export const PROVINCES: Province[] = [
  { id: "almeria", name: "Almería", aliases: [], community: "Andalucía", capital: "Almería", cities: ["Roquetas de Mar", "El Ejido"] },
  { id: "cadiz", name: "Cádiz", aliases: [], community: "Andalucía", capital: "Cádiz", cities: ["Jerez de la Frontera", "Algeciras"] },
  { id: "cordoba", name: "Córdoba", aliases: [], community: "Andalucía", capital: "Córdoba", cities: ["Lucena", "Montilla", "Puente Genil"] },
  { id: "granada", name: "Granada", aliases: [], community: "Andalucía", capital: "Granada", cities: ["Motril", "Baza"] },
  { id: "huelva", name: "Huelva", aliases: [], community: "Andalucía", capital: "Huelva", cities: ["Lepe", "Almonte"] },
  { id: "jaen", name: "Jaén", aliases: [], community: "Andalucía", capital: "Jaén", cities: ["Linares", "Úbeda", "Andújar"] },
  { id: "malaga", name: "Málaga", aliases: [], community: "Andalucía", capital: "Málaga", cities: ["Marbella", "Antequera"] },
  { id: "sevilla", name: "Sevilla", aliases: [], community: "Andalucía", capital: "Sevilla", cities: ["Dos Hermanas", "Écija", "Utrera"] },
  { id: "huesca", name: "Huesca", aliases: [], community: "Aragón", capital: "Huesca", cities: ["Jaca", "Monzón"] },
  { id: "teruel", name: "Teruel", aliases: [], community: "Aragón", capital: "Teruel", cities: ["Alcañiz"] },
  { id: "zaragoza", name: "Zaragoza", aliases: [], community: "Aragón", capital: "Zaragoza", cities: ["Calatayud", "Tarazona"] },
  { id: "asturias", name: "Asturias", aliases: [], community: "Principado de Asturias", capital: "Oviedo", cities: ["Gijón", "Avilés"] },
  { id: "balears", name: "Illes Balears", aliases: ["Islas Baleares", "Baleares", "Balears"], community: "Illes Balears", capital: "Palma", cities: ["Ibiza", "Maó", "Inca", "Manacor"] },
  { id: "las-palmas", name: "Las Palmas", aliases: ["Las Palmas de Gran Canaria"], community: "Canarias", capital: "Las Palmas de Gran Canaria", cities: ["Arrecife", "Puerto del Rosario", "Telde"] },
  { id: "tenerife", name: "Santa Cruz de Tenerife", aliases: ["Tenerife"], community: "Canarias", capital: "Santa Cruz de Tenerife", cities: ["San Cristóbal de La Laguna", "Icod de los Vinos"] },
  { id: "cantabria", name: "Cantabria", aliases: [], community: "Cantabria", capital: "Santander", cities: ["Torrelavega", "Castro Urdiales"] },
  { id: "albacete", name: "Albacete", aliases: [], community: "Castilla-La Mancha", capital: "Albacete", cities: ["Hellín", "Almansa"] },
  { id: "ciudad-real", name: "Ciudad Real", aliases: [], community: "Castilla-La Mancha", capital: "Ciudad Real", cities: ["Puertollano", "Tomelloso", "Valdepeñas"] },
  { id: "cuenca", name: "Cuenca", aliases: [], community: "Castilla-La Mancha", capital: "Cuenca", cities: ["Tarancón"] },
  { id: "guadalajara", name: "Guadalajara", aliases: [], community: "Castilla-La Mancha", capital: "Guadalajara", cities: ["Sigüenza", "Azuqueca de Henares"] },
  { id: "toledo", name: "Toledo", aliases: [], community: "Castilla-La Mancha", capital: "Toledo", cities: ["Talavera de la Reina", "Illescas"] },
  { id: "avila", name: "Ávila", aliases: [], community: "Castilla y León", capital: "Ávila", cities: ["Arévalo"] },
  { id: "burgos", name: "Burgos", aliases: [], community: "Castilla y León", capital: "Burgos", cities: ["Aranda de Duero", "Miranda de Ebro"] },
  { id: "leon", name: "León", aliases: [], community: "Castilla y León", capital: "León", cities: ["Ponferrada", "Astorga"] },
  { id: "palencia", name: "Palencia", aliases: [], community: "Castilla y León", capital: "Palencia", cities: ["Aguilar de Campoo"] },
  { id: "salamanca", name: "Salamanca", aliases: [], community: "Castilla y León", capital: "Salamanca", cities: ["Ciudad Rodrigo", "Béjar"] },
  { id: "segovia", name: "Segovia", aliases: [], community: "Castilla y León", capital: "Segovia", cities: ["Cuéllar"] },
  { id: "soria", name: "Soria", aliases: [], community: "Castilla y León", capital: "Soria", cities: ["Almazán", "El Burgo de Osma"] },
  { id: "valladolid", name: "Valladolid", aliases: [], community: "Castilla y León", capital: "Valladolid", cities: ["Medina del Campo", "Laguna de Duero"] },
  { id: "zamora", name: "Zamora", aliases: [], community: "Castilla y León", capital: "Zamora", cities: ["Benavente", "Toro"] },
  { id: "barcelona", name: "Barcelona", aliases: [], community: "Cataluña", capital: "Barcelona", cities: ["L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell"] },
  { id: "girona", name: "Girona", aliases: ["Gerona"], community: "Cataluña", capital: "Girona", cities: ["Figueres", "Blanes", "Olot"] },
  { id: "lleida", name: "Lleida", aliases: ["Lérida", "Lerida"], community: "Cataluña", capital: "Lleida", cities: ["Balaguer", "La Seu d'Urgell"] },
  { id: "tarragona", name: "Tarragona", aliases: [], community: "Cataluña", capital: "Tarragona", cities: ["Reus", "Tortosa"] },
  { id: "badajoz", name: "Badajoz", aliases: [], community: "Extremadura", capital: "Badajoz", cities: ["Mérida", "Don Benito"] },
  { id: "caceres", name: "Cáceres", aliases: [], community: "Extremadura", capital: "Cáceres", cities: ["Plasencia", "Trujillo"] },
  { id: "coruna", name: "A Coruña", aliases: ["La Coruña", "Coruña"], community: "Galicia", capital: "A Coruña", cities: ["Santiago de Compostela", "Ferrol"] },
  { id: "lugo", name: "Lugo", aliases: [], community: "Galicia", capital: "Lugo", cities: ["Monforte de Lemos", "Viveiro"] },
  { id: "ourense", name: "Ourense", aliases: ["Orense"], community: "Galicia", capital: "Ourense", cities: ["Verín", "O Barco de Valdeorras"] },
  { id: "pontevedra", name: "Pontevedra", aliases: [], community: "Galicia", capital: "Pontevedra", cities: ["Vigo", "Vilagarcía de Arousa"] },
  { id: "madrid", name: "Madrid", aliases: [], community: "Comunidad de Madrid", capital: "Madrid", cities: ["Alcalá de Henares", "Móstoles", "Getafe"] },
  { id: "murcia", name: "Murcia", aliases: [], community: "Región de Murcia", capital: "Murcia", cities: ["Cartagena", "Lorca"] },
  { id: "navarra", name: "Navarra", aliases: ["Nafarroa"], community: "Comunidad Foral de Navarra", capital: "Pamplona", cities: ["Tudela", "Estella"] },
  { id: "alava", name: "Álava", aliases: ["Araba", "Araba/Álava"], community: "País Vasco", capital: "Vitoria-Gasteiz", cities: ["Llodio", "Amurrio"] },
  { id: "bizkaia", name: "Bizkaia", aliases: ["Vizcaya", "Bizkaia/Vizcaya"], community: "País Vasco", capital: "Bilbao", cities: ["Barakaldo", "Getxo"] },
  { id: "gipuzkoa", name: "Gipuzkoa", aliases: ["Guipúzcoa", "Guipuzcoa", "Gipuzkoa/Guipúzcoa"], community: "País Vasco", capital: "Donostia-San Sebastián", cities: ["Irún", "Eibar"] },
  { id: "rioja", name: "La Rioja", aliases: ["Rioja"], community: "La Rioja", capital: "Logroño", cities: ["Calahorra", "Haro"] },
  { id: "alicante", name: "Alicante", aliases: ["Alacant", "Alacant/Alicante"], community: "Comunitat Valenciana", capital: "Alicante", cities: ["Elche", "Benidorm", "Orihuela"] },
  { id: "castellon", name: "Castellón", aliases: ["Castelló", "Castellon", "Castelló/Castellón"], community: "Comunitat Valenciana", capital: "Castellón de la Plana", cities: ["Vila-real", "Burriana", "Vinaròs"] },
  { id: "valencia", name: "Valencia", aliases: ["València", "València/Valencia"], community: "Comunitat Valenciana", capital: "Valencia", cities: ["Gandía", "Torrent", "Sagunto", "Xàtiva"] },
];

export function getProvince(id: string): Province {
  const province = PROVINCES.find((item) => item.id === id);
  if (!province) throw new Error(`Provincia desconocida: ${id}`);
  return province;
}

export function provincesIn(community: string): Province[] {
  if (community === "todas") return PROVINCES;
  return PROVINCES.filter((province) => province.community === community);
}
