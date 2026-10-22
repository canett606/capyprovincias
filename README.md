# CapyProvincias

Juego para practicar las 50 provincias de España. Misma idea que CapyVerbs: se abre en el móvil, se puede instalar y no hace falta una cuenta.

El mapa del ejemplo trae ríos, coordenadas y ciudades que no son la pregunta. Aquí se pregunta la provincia. Ceuta y Melilla se ven en el mapa porque están en España, pero son ciudades autónomas y no entran en las partidas.

## Qué puedes hacer

- **Preguntas:** escribes la provincia a partir de su capital o de una ciudad que está dentro.
- **Ahorcado:** la misma pista, letra a letra. La ñ cuenta aparte. Las tildes salen al acertar la vocal.
- **Mapa:** una provincia queda marcada y escribes el nombre.
- **Repasar fallos:** insiste en las que has fallado en este teléfono.
- **Las 50 provincias:** lista con capital, comunidad y el otro nombre si lo hay.

Da igual escribir Málaga o Malaga. También vale el otro nombre oficial: Bizkaia o Vizcaya, A Coruña o La Coruña, Girona o Gerona.

## En el iPhone

1. Abre la página en Safari.
2. Pulsa Compartir y luego **Añadir a pantalla de inicio**.
3. Ábrela desde el icono. La primera visita descarga la app. Después las partidas siguen sin cobertura.

En GitHub Pages la dirección es `https://canett606.github.io/capyprovincias/`.

## Publicar

El workflow `.github/workflows/pages.yml` construye con `VITE_BASE=/capyprovincias/` y publica `dist`. En el repositorio hay que activar Pages con el origen **GitHub Actions**. El repositorio tiene que llamarse `capyprovincias` para que esa base coincida.

## Comandos

```bash
npm ci
npm test
npm run dev
npm run build
```

En local la dirección es `http://localhost:5173/#/`.
