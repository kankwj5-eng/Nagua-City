# 01 · Fuentes verificadas y método

## Fuentes congeladas a commits específicos

| Referencia | Rama | Revisión inspeccionada | Uso |
|---|---|---|---|
| [reVC de mrxenginner](https://github.com/mrxenginner/reVC) | `miami` | [`a26fff4af555a8a425ac9f17d1dd718d00d1f942`](https://github.com/mrxenginner/reVC/tree/a26fff4af555a8a425ac9f17d1dd718d00d1f942) | Vice City: motos, coches, personajes, tráfico |
| [re3 de hottabxp](https://github.com/hottabxp/re3) | `master` | [`3233ffe1c4b99e8efb4c41c6794b4fce880cf503`](https://github.com/hottabxp/re3/tree/3233ffe1c4b99e8efb4c41c6794b4fce880cf503) | GTA III: referencia histórica de física y control |
| [reVC high-FPS de Ogstra](https://github.com/Ogstra/reVC) | `miami` | [`5b339fbb60008c23c607a6b5ebec8c2e5ac67d23`](https://github.com/Ogstra/reVC/tree/5b339fbb60008c23c607a6b5ebec8c2e5ac67d23) | Contrastar problemas de dependencia de frecuencia de simulación |
| [Nagua City](https://github.com/kankwj5-eng/Nagua-City) | `main` | [`dfc51bb3cbc394f04151979a9fee69ecb1cc589f`](https://github.com/kankwj5-eng/Nagua-City/tree/dfc51bb3cbc394f04151979a9fee69ecb1cc589f) | Línea de base propia, NO modificada |

Los commits anteriores sirven como referencias reproducibles, no como submódulos o paquetes descargables de nuestro juego. La inspección inicial se centró en reVC; GTA III y el fork high-FPS quedan para una comparación más extensa por función.

## Rutas de fuente relevantes, con enlaces permanentes

### Vice City

- [`src/vehicles/Bike.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Bike.cpp): `CBike::ProcessControl`, `ProcessControlInputs`, `SetupSuspensionLines`, `CalculateLeanMatrix`, `KnockOffRider`.
- [`src/vehicles/Automobile.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Automobile.cpp): conducción de coches y control de frenado.
- [`src/entities/Physical.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/entities/Physical.cpp): fuerzas, impulsos, rotación, gravedad, suspensión, colisiones.
- [`src/vehicles/HandlingMgr.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/HandlingMgr.cpp): interpretación de parámetros de manejo.
- [`src/peds/PedAI.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedAI.cpp): objetivos, rutas, entrada/salida de vehículos.
- [`src/peds/Ped.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/Ped.cpp): locomoción, estados, búsqueda de objetivos.
- [`src/peds/PedIK.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedIK.cpp): límites anatómicos de cuello, torso y brazos, seguimiento suave.
- [`src/animation/AnimBlendAssociation.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/animation/AnimBlendAssociation.cpp): mezcla, velocidad y sincronización de animaciones.
- [`src/control/CarCtrl.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/control/CarCtrl.cpp): tráfico, rutas, evasión y detección de peatones.
- [`src/control/PathFind.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/control/PathFind.cpp): grafos de movilidad.
- [`src/collision/Collision.cpp`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/collision/Collision.cpp): pruebas de formas y contactos.

### Nagua City: solo para contraste

- [`physics/driving-model.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/physics/driving-model.js).
- [`physics/vehicle-contact.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/physics/vehicle-contact.js).
- [`game/src/vehicles/0112-solve-human-ride24.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0112-solve-human-ride24.js).
- [`game/src/vehicles/0295-human-ride.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0295-human-ride.js).
- [`game/src/characters/0126-update-people25.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/characters/0126-update-people25.js).
- [`game/src/core/0300-limb-ik.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/core/0300-limb-ik.js).
- [`game/src/characters/0420-human43.js`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/characters/0420-human43.js).

## Metodología

1. Elegir **una conducta observable** (p. ej. giro lento de moto, paso sobre desnivel, tomar curva al frenar, codo al sujetar manillar, peatón que cruza).
2. Localizar su implementación conceptual en reVC y los subsistemas vecinos, evitando sacar conclusiones de una sola función.
3. Localizar el sistema equivalente en Nagua City; anotar lo que **ya hacemos bien**, no solo lo que nos falta.
4. Describir la diferencia en **palabras propias**, sin transcribir el algoritmo ni valores propietarios.
5. Preparar un experimento independiente: entradas, salida esperada, criterio de estabilidad y medición a 10/30/60 FPS de presentación.
6. Comparar calidad/percepción, frame time CPU/GPU y RAM **en Android**, con mismos recorridos y gráficos.
7. Conservar conclusión como `NO PROBADO`, `DESACONSEJADO`, `CANDIDATO` o `VERIFICADO EN LABORATORIO`. Ninguno de estos estados autoriza integrar en `main`.

## Derechos y límites

`hottabxp/re3` conserva la advertencia histórica de que sus autores no consideran que puedan otorgar una licencia convencional, y pide uso educativo/documental/modding. La copia `mrxenginner/reVC` incluye un texto de licencia especial que **afirma** dar permisos sobre aportaciones de sus contribuidores; eso no determina los derechos sobre el código original reconstruido ni concede derechos de Take-Two/Rockstar. Por prudencia:

- No trasladamos implementaciones ni recursos de GTA a nuestro proyecto.
- No redistribuimos los archivos `.cpp`, `.h`, modelos o datos de GTA desde este laboratorio.
- No incluimos repositorios ajenos como dependencias de compilación.
- Toda posible implementación futura será propia, con documentación del principio general, y estará sujeta a revisión de derechos si se pretende derivar del código ajeno.
- Estas notas no constituyen asesoramiento legal.

La existencia de una fuente consultable **no la convierte automáticamente en código abierto reutilizable**.
