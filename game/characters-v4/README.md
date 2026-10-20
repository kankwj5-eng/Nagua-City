> **Estado actualizado (20 de octubre de 2026).** Este archivo describe el adaptador aislado de una fase anterior. Los **10 GLB definitivos**, incluido Mateo, ahora sí están versionados en `game/assets-v4/`, con hashes en `specifications.json`. El juego modular los utiliza mediante `game/src/vehicles/0286a-original-v4-runtime.js`, `prepareHumans` y `makeHuman`. La entrega web elimina del HTML los paquetes de humanos y animaciones anteriores. Las pruebas de Chromium y Android físico deben determinar si cada rig y animación se ven correctamente; no equivale a una certificación visual.

# Motor del elenco Nicaragua v4

Código aislado y comprobable antes de retirar las dependencias originales.

- Catálogo estricto de **diez GLB**: Mateo y nueve NPC.
- **Sin LOD1 ni modelos número 11–20**, ni alias a otros personajes.
- Carga los diez modelos, valida animaciones reales en Babylon.js y crea
  instancias con animación independiente.
- Permite reproducir Idle, Walk, Run y las animaciones de golpe/reacción.
- Reconoce los huesos nuevos `wrist.L/R`, `upperarm01.L/R`,
  `lowerarm01.L/R`, `foot.L/R` y `head`.
- Aún **NO se incorpora al runtime publicado**: hasta completar la
  sustitución deben permanecer las funciones de combate, conducción,
  cinemáticas y cámara que esperan el esqueleto anterior.

Integración pendiente: montar `cast-runtime.js` desde el código modular,
cargar `cast.json` y los GLB en `assets/characters-v4`, adaptar las
uniones de personaje con controles/animación e impedir la inclusión de las
antiguas cargas humanas en la PWA. Después borrar las fuentes antiguas
de personajes y sus recursos, **no dejarlas escondidas**.

Prueba local: `node tests/cast-v4-runtime.cjs`.
