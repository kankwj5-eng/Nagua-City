> **Estado actualizado (20 de octubre de 2026).** El visor de 14 modelos descrito aquí es un **laboratorio histórico**. El juego actual incorpora **16 GLB** (Mateo + nueve NPC, dos camionetas, dos motos y dos caponeras) desde `game/assets-v4/`. La compilación de GitHub Pages ejecuta `scripts/package_original_v4.py` y publica los recursos nuevos. El archivo base original en Git LFS permanece como respaldo. Ver `docs/ESTADO_MODELOS_V4.md`. No asumir que las verificaciones automatizadas sustituyen una prueba de jugabilidad Android.

# Nagua City V4 — integración separada de los modelos nuevos

El objetivo final es reemplazar todo el elenco y el parque vehicular antiguos
y eliminar sus recursos y referencias del código. Este directorio contiene
componentes probables por separado, NO reemplaza todavía el arranque real.

## Qué existe actualmente

- `zip-loader.js` abre **Nagua-City-V4-14-Modelos-Nuevos.zip** en el
  navegador. Verifica los 10 personajes y 4 vehículos y rechaza otros GLB,
  nombres imprevistos, datos corruptos o huellas SHA-256 distintas. Los
  archivos se descomprimen **solo cuando se solicitan**.
- `preview.html` ofrece un visor táctil de un solo modelo a la vez:
  animaciones de personas y giro/rodadura de los cuatro vehículos.
  Consume el ZIP **sin enviarlo a ningún servidor**.
- `city-bridge.js` conecta los diez modelos de personas y los cuatro
  vehículos con posicionamiento, peatones, animación, movimiento, entradas/
  salidas y conducción. Acepta el motor físico compartido inyectado como
  `drivePhysics`, sin importar código de rig o animación obsoletos.
- Hay pruebas de ZIP, animación y juego simulado en GitHub Actions.

## Probar el visor

En la ejecución **Empaquetar laboratorio V4 táctil** del PR #54 descargá
el artefacto `nagua-v4-visor-14-modelos` y descomprimilo. Abrí
`game/v4/preview.html` y seleccioná el ZIP de 14 modelos del usuario.
Babylon.js se carga de su CDN (requiere conexión), pero los archivos
del usuario se leen localmente.

## Lo que todavía falta para el juego final

- Publicación de los catorce modelos (todavía no están en el repositorio);
  alternativamente, importar el ZIP local a un arranque nuevo.
- Integración del puente con las calles, obstáculos, tráfico, cámara y
  controles táctiles de la ciudad completa.
- Conectar combate, audio, misiones, calidad móvil y rendimiento real.
- Retirar las rutas y los medios del juego viejo del runtime **completo**;
  ejecutar auditorías estrictas hasta obtener cero referencias obsoletas.
- Pasar pruebas del juego real antes de fusionar PR #54 a `main`.

**No publicar la copia de limpieza como juego**: le faltan los nuevos
modelos y conexiones definitivas.
