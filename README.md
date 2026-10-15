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
- Pruebas: `node --max-old-space-size=512 tests/performance-block01.cjs`, `tests/performance-block02.cjs` `tests/performance-block03.cjs` `tests/performance-block04.cjs`, `tests/performance-block05.cjs`, `tests/performance-block06.cjs` `tests/performance-block07.cjs` y `tests/performance-block08.cjs` (ejecutar cada archivo con Node).
- Resultado: `dist/Managua.html`, con todos los recursos integrados.

El bloque 01 reduce buffers repetidos de animación. El bloque 02 evita registros y cálculos redundantes al planificar el streaming. El bloque 03 reduce el almacenamiento de valores exactamente representables en 32 bits, sin redondearlos. El bloque 04 agrupa la preparación de piezas de vehículos en intervalos de trabajo, evitando una pausa de temporizador por cada pieza. Los bloques 05–07 comparten buffers idénticos de vehículos, cargan jardines por proximidad y corrigen matrices congeladas en detalles móviles. El bloque 08 evita copias de puntos de selección en mallas estáticas sin selección; la prueba en una misma sesión redujo 101,5 MiB de heap V8, sin tocar buffers de dibujo. No modifican la historia ni la calidad visual. Las correcciones visuales de la sesión interrumpida no llegaron a guardarse y no se dan por recuperadas.

Las mediciones de buffers o de un navegador de pruebas no certifican los FPS en un teléfono físico.

Este juego es independiente de DroidDeck y del proyecto de consola Linux gaming para Android.

## Diagnóstico profundo

Objetivo: 60 FPS estables, pendiente de validación en Android. Herramientas, protocolo, límites y captura desde el teléfono: [docs/PERFILADO.md](docs/PERFILADO.md). El bloque 09 añade grabación optativa de 15 segundos y descarga de informe desde los ajustes, sin enviar datos a servidores. Prueba: `node tests/performance-block09.cjs`.

Los bloques 10 y 11 evitan invalidar las matrices de vehículos estacionados y agrupan piezas opacas compatibles de carrocerías. Pruebas: `node tests/performance-block10.cjs` y `node --max-old-space-size=1536 tests/performance-block11.cjs`. Las ganancias de FPS en Android siguen pendientes de medición.

El bloque 12 evita evaluar como candidatos de dibujo nodos ya desactivados, conservando streaming, instancias y LOD. Prueba: `node tests/performance-block12.cjs`.

## Física y conducción

Correcciones de agarre al frenar en curva, balanceo de carrocería, maniobras lentas de motos, rodadura, dirección Ackermann y colisiones de la huella completa. Tráfico y jugador comparten pasos fijos y presentación interpolada. Detalles, límites y pruebas: [docs/CONDUCCION.md](docs/CONDUCCION.md). Prueba: `node --max-old-space-size=768 tests/vehicle-handling.cjs`. No certifica sensación de conducción ni 60 FPS en un teléfono físico.

## Inicio y menú de referencia

El menú usa exactamente el JPEG aportado por el usuario: logo grafiteado, letras, iconos y composición originales, con tres botones funcionales sobre sus zonas. Durante el arranque muestra la carga real sin dejar visible el 100 % impreso antes de tiempo. Detalles, proporciones y pruebas: [docs/INICIO_Y_MENU.md](docs/INICIO_Y_MENU.md).
