# 04 · Estudio: personaje, arma, manos, IK y moto

## Pistas comprobadas de reVC

- [`CPedIK::MoveLimb`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedIK.cpp#L64) hace que las articulaciones converjan hacia un objetivo con pasos graduados y límites mínimos/máximos de yaw y pitch. No permite que una orientación extrema sea aplicada sin restricciones.
- [`CPedIK::PointGunInDirectionUsingArm`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedIK.cpp#L232) considera orientación de clavícula, brazo, antebrazo y mano: apuntar no equivale a rotar un único objeto de arma.
- [`CAnimBlendAssociation::UpdateBlend`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/animation/AnimBlendAssociation.cpp#L209) gestiona pesos de animación con transición progresiva.
- [`CAnimBlendAssociation::SyncAnimation`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/animation/AnimBlendAssociation.cpp#L156) dispone de sincronización de fase entre animaciones.
- [`CPed::EnterCar`](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/peds/PedAI.cpp#L3998) contempla hitos de la animación de subir a moto y transición de estado.

## Lo que encontramos en Nagua City

- `limbIK` calcula una articulación por geometría de dos segmentos. **El bloque 8 ya introdujo protección para direcciones degeneradas**; es bueno y debe mantenerse.
- `solveHumanRide24` posiciona manos en el manillar mediante IK y matrices de mundo. Es más específico que fijar todo el brazo en una sola rotación; las deformaciones exigen diagnóstico de rig, unidad de escala y transformaciones locales.
- `human43` mezcla caminar, correr, salto, aterrizaje y acción usando interpolación de cuaterniones y desplazamiento real. Ya hay un sistema de animación más elaborado que una secuencia básica.
- `hands43` apunta y resuelve apoyo de mano sobre el arma, y recalcula el acople visual del arma a la pose final.
- `humanRide` aplica una flexión a varios huesos de los dedos después de muestrear la pose de montar. **Hipótesis pendiente:** el mismo cuaternión podría modificarse varias veces si la pose base no sobrescribe completamente esa pista. No afirmar defecto hasta registrar cuaterniones de repeticiones en el juego real.
- Hay una prueba previa en otra rama para identificar acumulación en los dedos; no forma parte de este laboratorio ni está aprobada para `main`.

Referencias de Nagua: [`limbIK`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/core/0300-limb-ik.js), [`solveHumanRide24`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0112-solve-human-ride24.js), [`humanRide`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/vehicles/0295-human-ride.js), [`human43`](https://github.com/kankwj5-eng/Nagua-City/blob/dfc51bb3cbc394f04151979a9fee69ecb1cc589f/game/src/characters/0420-human43.js).

## Hipótesis de mayor interés

| Hipótesis | Dato necesario | Qué NO hacer |
|---|---|---|
| Brazo apunta fuera de rango anatómico | Cuaterniones del hombro/codo y distancia mano–arma en reposo, disparo y recarga | Copiar límites angulares de Vice City |
| Cambio de espacio local/mundo distorsiona codo | Comparar eje local del hombro con transformación inversa usada en IK | Alterar rig o bind pose sin captura de referencia |
| Entrar a moto acumula flexión de dedos | 20 montajes idénticos y comparación de cuaterniones tras cada montaje | Reemplazar todas las animaciones |
| Movimiento de moto no coordina inclinación de torso | Pose del conductor vs velocidad, giro y balanceo | Pegar al conductor una rotación de moto sin simular el agarre |
| La animación parece rígida | Registrar peso de cada capa, fase y latencia de transición | Aumentar indiscriminadamente número de huesos |

## Experimentos de laboratorio

**A1 · Rig:** conservar el esqueleto y su bind pose; trazar hombro/codo/muñeca con distancia mano–objetivo a 0°, ±30°, ±60°. Exigir transformaciones finitas y sin separación visible excesiva.

**A2 · Arma:** grabar reposo, apuntar, disparo y recarga. Comparar el soporte de la mano izquierda y el arma durante *todo* el blend, no solo en una pose estática.

**A3 · Montaje:** 20 subidas/bajadas con la misma moto y sin cambiar el punto de agarre. Comparar cuaterniones de dedos/antebrazos; comprobar que la postura no deriva.

**A4 · Animación:** comparar las transiciones reposo→caminar→correr a igual desplazamiento y distintas tasas de presentación, con el paso de física fijo. Medir deslizamiento de pies en metros/s.

**A5 · Controles:** probar las animaciones al girar el manillar y al frenar en curva, manteniendo el casco y las manos coherentes en todas las posiciones.

## Decisión provisional

Investigar **límites anatómicos** y **repetibilidad** antes de tocar modelos. Aunque el sistema de Vice City sea una inspiración útil, sus huesos, proporciones y animaciones no se corresponden automáticamente con los MPFB/Babylon.js de Nagua City. No reutilizar sus tablas ni transformar la jerarquía a ciegas.
