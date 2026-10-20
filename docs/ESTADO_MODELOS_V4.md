# Estado real de los 16 modelos V4 de Nagua City

Actualizado: 20 de octubre de 2026. Fuente de verdad: `game/assets-v4/specifications.json` y los dieciséis archivos `game/assets-v4/<id>.glb.gz`.

## Modelos encontrados

- **10 personajes:** `01_mateo` (protagonista, 79 huesos y 37 clips declarados), `02_ernesto`, `03_daniel`, `04_luis`, `05_rafael`, `06_valeria`, `07_marisol`, `08_xiomara`, `09_rosa`, `10_elena` (52 huesos y 12 clips declarados por NPC).
- **2 camionetas:** `hilux` (grafito), `landcruiser` (roja).
- **2 motocicletas:** `pulsar` (NS200), `taypan` (150).
- **2 caponeras:** `mototaxi-roja`, `canonera-abierta`.

Se comprobó que aparecen tanto en `main` como en `prep/personajes-nicaragua-diez-v4`. Los archivos ya están en `main`: **no reimportar ZIP ni agregar versiones duplicadas**.

## Ruta real de publicación

1. `scripts/build_modular.py` construye el motor 3D a partir de `game/src/`.
2. `scripts/package_original_v4.py` añade los 16 GLB y `v4-original-specifications`, elimina `asset-humans`, `asset-animation38`, `asset-actor-motion`, `pack48-humans`, los `resource48-humans-*` y la geometría de vehículos antiguos de `asset-vehicles`. Conserva materiales urbanos y el HTML original en Git LFS sin alteraciones.
3. El arranque original no debe seguir intentando leer `asset-humans`; se quita únicamente esa entrada de la precarga cuando se genera la build V4.
4. `game/src/characters/0292-prepare-humans.js` y `0293-make-human.js` usan `originalV4`. `game/src/vehicles/0287-create-vehicle.js`, `0289-install-fleet.js`, `0369-step-fleet13.js` y `0361-apply-player-wheels13.js` integran seis vehículos con tráfico, rueda y dirección animada.
5. `scripts/build_pwa.py` separa recursos grandes del HTML web. El motor independiente en `dist/Managua-portable.html` y la versión publicada no son idénticos byte por byte, pero proceden de la misma compilación modular.

## Verificación real y lo pendiente

- Integridad: `node tests/performance-block04.cjs` descomprime los 16 GLB, compara bytes, cabecera y SHA-256; rechaza los archivos alterados.
- Modelo y mapa: `python3 -m unittest discover -s tests -p 'test_full_original_v4.py' -v`.
- Arranque sin recurso humano eliminado: `python3 -m unittest discover -s tests -p 'test_v4_bootstrap.py' -v`.
- Navegador Chromium sobre el sitio compilado: `node scripts/test_fast_web_browser.cjs`. Verifica arranque, carga web progresiva, Mateo, NPC V4, seis modelos en garaje y que ninguna instancia de persona o vehículo utiliza el catálogo viejo; deja informe `dist/fast-web-browser.json`.
- Los scripts y los resultados de GitHub Actions son verificaciones técnicas. **No afirman** FPS estables, ausencia de defectos visuales, calidad de movimientos o manejo en Android físico. Para eso hay que inspeccionar capturas y jugar en un celular.

## Precauciones

- Nunca sobrescribir ni eliminar `Managua_Del_taller_al_lago(1).html` (Git LFS).
- No borrar edificios, calles, vegetación, colisiones ni archivos fuente de la ciudad.
- No cargar `_LOD1` antiguos de las personas ni añadir vehículos no incluidos en los seis IDs.
- Ante regresión, no publicar el PR hasta resolver la prueba fallida.
