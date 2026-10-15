# Nagua City

Repositorio oficial del juego de conducción y exploración de Managua.

## Dirección del juego

- Explorar la ciudad, conducir carros y motos y realizar piruetas.
- Sin historia guiada ni misiones narrativas.
- Personaje masculino joven nicaragüense, moreno, ropa holgada y chinelas.
- Conservar el aspecto del asfalto y del cielo.
- Corregir casco, caminata, vehículos incompletos y parpadeo de la moto.
- Optimizar cargas, memoria y rendimiento con mediciones verificables.
- Interfaz en español; entrega jugable en HTML independiente.

## Archivo oficial y rendimiento

La base del usuario es `Managua_Del_taller_al_lago(1).html`, almacenada en Git LFS. Las mejoras de rendimiento se aplican por bloques pequeños; el original se conserva.

- Plan y mediciones: [docs/RENDIMIENTO.md](docs/RENDIMIENTO.md).
- Construcción: `python3 scripts/build_performance.py`.
- Pruebas: `node --max-old-space-size=512 tests/performance-block01.cjs`, `tests/performance-block02.cjs` `tests/performance-block03.cjs` `tests/performance-block04.cjs` y `tests/performance-block05.cjs`, `tests/performance-block06.cjs` (ejecutar cada archivo con Node).
- Resultado: `dist/Managua.html`, con todos los recursos integrados.

El bloque 01 reduce buffers repetidos de animación. El bloque 02 evita registros y cálculos redundantes al planificar el streaming. El bloque 03 reduce el almacenamiento de valores exactamente representables en 32 bits, sin redondearlos. El bloque 04 agrupa la preparación de piezas de vehículos en intervalos de trabajo, evitando una pausa de temporizador por cada pieza. El bloque 05 comparte geometrías idénticas de vehículos. El bloque 06 crea jardines por proximidad. No modifica la historia ni la calidad visual. Las correcciones visuales de la sesión interrumpida no llegaron a guardarse y no se dan por recuperadas.

Las mediciones de buffers o de un navegador de pruebas no certifican los FPS en un teléfono físico.

Este juego es independiente de DroidDeck y del proyecto de consola Linux gaming para Android.
