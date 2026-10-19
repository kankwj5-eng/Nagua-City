# Integración V4 sobre la ciudad original

Se migran **solo diez personajes** (Mateo + nueve NPC) y **cuatro vehículos**
(Hilux grafito, Land Cruiser roja, Pulsar NS200 y Serpento Taypan 150) al
mapa auténtico de Nagua City. **Sin archivos LOD1 ni assets anteriores.**

## Trabajo realizado

- `game/v4/official-city.js`: recupera las **81 zonas base**, las
  **38 zonas de extensiones**, 68 imágenes de material y 4.559 obstáculos
  del mundo original; dibuja sus mallas mediante Babylon.js bajo demanda.
  Preserva las alturas de calles y los límites de la ciudad.
- `scripts/build_original_city_v4.py`: sustituye las calles de muestra
  del HTML autónomo V4, inyecta las zonas reales y las colisiones, sitúa
  los catorce modelos nuevos y usa la física vehicular original
  `Physics40` y `Driving`.
- Solo se empaquetan los **14 GLB nuevos** que ya contenía el HTML V4
  previo. Los antiguos catálogos `asset-humans`, `asset-vehicles`,
  `asset-animation38` y `asset-actor-motion` quedan excluidos.
- La compilación resultante es **un solo HTML**: no requiere archivos
  ZIP, enlaces ni scripts externos. El renderizador y cargador GLB
  ya están incluidos en el HTML V4 de entrada.
- Los tests comparan los recuentos con el Git LFS original y prueban el
  filtrado de los medios viejos.

## Generar HTML autónomo a partir del juego original

En un checkout completo de Nagua City:

```bash
git lfs pull
python3 scripts/build_original_city_v4.py \
  --source 'Managua_Del_taller_al_lago(1).html' \
  --demo dist/Nagua-City-V4-14-Modelos.html \
  --output dist/original-v4/Nagua-City-Original-V4.html
```

`dist/Nagua-City-V4-14-Modelos.html` es el HTML previo con los 14
GLB enviados por el usuario. Este archivo binario no está en GitHub;
debe copiarse al directorio `dist` antes de compilar. Por eso **la tarea
CI valida el mapa y el código, pero no publica el HTML final**.

## Pendiente

**Esta es una integración real del mapa y la física, no una migración
completa del motor antiguo.** Faltan misiones, vida urbana avanzada,
tráfico y conducción de NPC, accesorios, tiendas, cámaras especiales,
sonidos y tests reales de FPS/arranque en Android. El navegador Chromium
del entorno de pruebas no completó la carga interactiva del HTML de
72 MB; está validado estructuralmente y mediante las pruebas aisladas.

No fusionar con `main` ni sustituir la versión jugable hasta superar
las pruebas end-to-end y la migración de todos los sistemas restantes.
