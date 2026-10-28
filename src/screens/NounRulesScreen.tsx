import { Capybara } from "../components/Capybara";

const RULES: readonly { title: string; body: string }[] = [
  {
    title: "Acaba en -a y es uno solo",
    body: "Casi siempre femení singular: la casa, la taula, la cadira, la pilota.",
  },
  {
    title: "No acaba en -a y es uno solo",
    body: "Casi siempre masculí singular: el llibre, el gos, el cotxe, el riu.",
  },
  {
    title: "Más de uno",
    body: "Es plural. casa → les cases. llibre → els llibres. gos → els gossos. peix → els peixos.",
  },
  {
    title: "Masculí que acaba en -a",
    body: "el dia, el mapa, el problema, el planeta. El plural también: els dies, els mapes, els problemes, els planetes.",
  },
  {
    title: "Femení que no acaba en -a",
    body: "la flor, la nit, la mà, la ciutat, la llet, la dent, la mare, la classe. Y acaba en -o, pero es femení: la foto, la moto. El plural: les fotos, les motos.",
  },
  {
    title: "Si empieza por vocal o h",
    body: "Se dice l'arbre, l'amic, l'escola, l'home. En plural vuelve el artículo: els arbres, els amics, les escoles, els homes.",
  },
];

export function NounRulesScreen({ onExit, onPractice }: { onExit: () => void; onPractice: () => void }) {
  return (
    <section className="card">
      <Capybara mood="think" label="La norma" />
      <h1>La norma</h1>
      <p>En el examen di dos cosas de cada paraula: masculí o femení, y singular o plural.</p>
      {RULES.map((rule) => (
        <article className="rule" key={rule.title}>
          <strong>{rule.title}</strong>
          <p>{rule.body}</p>
        </article>
      ))}
      <button className="primary" type="button" onClick={onPractice}>
        Practicar
      </button>
      <button className="ghost" type="button" onClick={onExit}>
        Volver
      </button>
    </section>
  );
}
