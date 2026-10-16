# 03 · Estudio: peatones, NPC y tráfico

## Hallazgos verificables en reVC

### IA de peatones

- [`CPed::ProcessObjective`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedAI.cpp#L777) gestiona objetivos explícitos, prioridades y diferentes circunstancias (a pie, subiendo a un vehículo, siguiendo un líder, etc.). No es simplemente una velocidad asignada a cada peatón.
- [`CPed::FindBestCoordsFromNodes`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedAI.cpp#L5531) consulta nodos de rutas cuando la línea de visión hacia el objetivo no basta.
- [`CPed::Seek`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/Ped.cpp#L5601) incluye comprobaciones del entorno al aproximarse a objetivos.
- [`CPed::EnterCar`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedAI.cpp#L3998) coordina un cambio de estado con animaciones y posición del personaje.

### Tráfico

- [`CCarCtrl::SteerAICarWithPhysicsFollowPath`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/control/CarCtrl.cpp#L2785) usa información de enlaces, dirección y carril para elegir el siguiente objetivo de conducción.
- [`CCarCtrl::SlowCarDownForPedsSectorList`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/control/CarCtrl.cpp#L1198) comprueba peatones cercanos y el avance del vehículo hacia ellos; no espera a que ya exista una interpenetración.
- [`CCarCtrl::SwitchVehicleToRealPhysics`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/control/CarCtrl.cpp#L3063) y [`CPhysical::ProcessCollision`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/entities/Physical.cpp#L2099) muestran estados de vehículo simplificados y físicos; esto permite estudiar una política híbrida de fidelidad.

## Contraste con Nagua City

| Aspecto | Nagua City hoy (código examinado) | Oportunidad que merece estudio |
|---|---|---|
| Estado de peatones | `updatePeople25` distingue esperar, caminar, huir, ceder y cruce detenido | Objetivos persistentes: ir a tienda, pasear, reaccionar, volver |
| Evasión local | Cinco candidatos de dirección; vecindad espacial y `blocked` | Enlace con rutas de aceras para evitar giros repetidos contra obstáculos |
| Cruce seguro | `pedestrianCrossing27` calcula estimación de llegada por velocidad | Comprobar que predicción y semáforos cubran giros y motos |
| Tráfico | `stepTraffic23`/25/29 ajustan velocidad por luces, vehículos, peatones y curvas | Suavidad al frenar, anticipación y comportamiento de carril |
| Escalado de CPU | Nagua ya usa LOD/detalle según distancia, y tablas de giro compartidas | Amortizar decisiones costosas sin bajar calidad a menos de 10 m |
| Simulación de NPC | Nagua emplea desplazamiento y presentación de ruedas en scripts separados | Medir cuándo vale la pena un modo físico más rico |

Archivos de Nagua:
- [`updatePeople25`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/characters/0126-update-people25.js).
- [`pedestrianCrossing27`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/characters/0149-pedestrian-crossing27.js).
- [`stepTraffic23`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0099-step-traffic23.js).
- [`stepTraffic29`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0168-step-traffic29.js).

**Importante:** el código actual ya tiene cruce predictivo y variedad básica de estados; sería incorrecto describirlo como una IA sin decisiones. La pregunta es la calidad y amplitud de sus conductas, y el coste de mejorarlas.

## Propuestas de experimentos limpios

- **P1 · Decisiones:** 20 peatones, misma semilla, recorridos con obstáculo, semáforo y jugador. Medir peatones atascados (más de 3 s), colisiones y tiempo medio de completar ruta.
- **P2 · Comportamiento urbano:** crear un *modelo conceptual* de objetivos de peatón independiente, no montado en Nagua. Confirmar si mejora la naturalidad antes de programarlo.
- **P3 · Cruces:** 100 casos con vehículo a diferentes distancias, velocidades y ángulos. Contar falsas decisiones de cruzar y esperas injustificadas. Registrar velocidad del vehículo, distancia y tiempo de reacción.
- **P4 · Presupuesto móvil:** perfilar 20/50/100 NPC con el mismo presupuesto de mallas. Comparar coste de lógica, no solo FPS total.
- **P5 · Semáforos:** confirmar que peatones y coches perciban el mismo estado de cruce aun cuando el render se actualice más lento que la simulación.

## Restricciones

No importar los árboles de estados ni grafos del juego ajeno. Si el experimento es prometedor, diseñar una IA original con entidades propias de Managua (mercados, parques, esquinas y paradas), acordes al juego libre, e implementar **solo tras aprobación**.
