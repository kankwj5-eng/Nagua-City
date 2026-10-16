# 02 · Estudio: motocicletas y vehículos

**Fuente principal:** reVC, `Bike.cpp`, `Automobile.cpp`, `Physical.cpp`, `HandlingMgr.cpp`.  
**Código Nagua:** `physics/driving-model.js`, `game/src/vehicles/0302-rider-pose.js`, `0112-solve-human-ride24.js`, `game/src/vehicles/0440-bike46.js`, `physics/vehicle-presentation.js`.

## Lo que realmente encontramos en Vice City

1. **Motocicleta específica.** La clase `CBike` tiene un procesamiento propio. No se limita a dibujar una moto inclinada sobre un controlador de automóvil. Se apoya en estados de rueda, ángulos de giro, fuerzas de balance y contacto.
2. **Suspensión ligada al contacto.** `CBike::SetupSuspensionLines` configura trazas de suspensión para rueda delantera y trasera. El control revisa relaciones de compresión y llama a operaciones de resorte y amortiguación de `CPhysical` cuando hay contacto.
3. **Superficie y tracción.** El controlador comprueba grupos de adhesión (por ejemplo arena) a partir de los contactos; esto influye en el comportamiento del vehículo.
4. **Balanceo acoplado a fuerzas.** `CBike::CalculateLeanMatrix` y la gestión de ángulos de inclinación forman parte del sistema de moto. El aspecto físico y la presentación están relacionados, pero no son una mera rotación visual única.
5. **Situaciones de choque/caída.** `CBike::KnockOffRider` contempla desprendimiento del piloto, animaciones y decisiones distintas para NPC y jugador.
6. **Ajustes de vehículo configurables.** `HandlingMgr.cpp` distingue masa, centro de masa, tracción, límites de dirección, amortiguación/suspensión, frenos y transmisión.

Referencias:
- [`Bike.cpp`: control de moto](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Bike.cpp#L210)
- [`Bike.cpp`: trazas de suspensión](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Bike.cpp#L2797)
- [`Bike.cpp`: inclinación](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Bike.cpp#L2892)
- [`Bike.cpp`: piloto y caída](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/Bike.cpp#L2575)
- [`Physical.cpp`: impulsos y resorte](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/entities/Physical.cpp#L444)
- [`HandlingMgr.cpp`: parámetros](https://github.com/mrxenginner/reVC/blob/a26fff4af555a8a425ac9f17d1dd718d00d1f942/src/vehicles/HandlingMgr.cpp#L300)

## Lo que ya existe en Nagua City

`Driving.advance` ya tiene:
- Masa aproximada, par/potencia, relaciones de marcha, resistencia aerodinámica, rodadura y frenado.
- Presupuesto de adherencia longitudinal/lateral, limitación de velocidad de giro y suavizado del manillar.
- Un objetivo de inclinación ligado a aceleración lateral, con amortiguación temporal.
- Efecto de caballito, un canal de cabeceo de moto y pasos físicos deterministas que ya cuentan con regresiones a distintos FPS.
- Colisiones y presentación visual tratadas por otros módulos.

**No es justo afirmar que Nagua City carece de física.** El problema es comprobar si su modelo simplificado reproduce de forma convincente una moto en pendientes, curvas lentas, frenadas, bordes de acera y cambios de suelo, y cuánto nos cuesta en Android.

## Brechas / hipótesis, no fallos confirmados

| Tema | Evidencia | Pregunta para el laboratorio | Coste/riesgo |
|---|---|---|---|
| Rueda delantera y trasera | reVC tiene contactos y suspensión diferenciados | ¿Basta una solución ligera de dos puntos de apoyo en Android? | Medio/alto |
| Tracción por tipo de superficie | reVC consulta tipo de contacto | ¿Nuestro césped/tierra afectan realmente al manejo o solo a la apariencia? | Medio |
| Inclinación a poca velocidad | reVC tiene varios mecanismos de balance | ¿Se ve rígida la moto o cae demasiado rápido al frenar? | Medio |
| Frenada en curva | reVC combina fuerzas con respuesta de rueda | ¿Nuestras limitaciones de adherencia conservan dirección y peso? | Medio |
| Piloto al manillar | Nagua usa IK propio | ¿Las manos y dedos llegan al agarre sin errores acumulativos? | Bajo/medio |
| Caída y recuperación | reVC resuelve múltiples estados | ¿Queremos caídas arcade o físicas completas? Es decisión de diseño | Alto |

## Experimentos aislados propuestos (no implementados)

**M1. Giro lento:** 5, 10 y 20 km/h, mismos controles durante 3 s. Registrar radio, yaw/seg, inclinación, balanceo, estabilidad y frame time. Comparar con expectativas físicas y pruebas del usuario, no copiar números de Vice City.

**M2. Curva frenando:** empezar a velocidad constante, tomar curva fija y frenar. Medir discontinuidades de yaw, frenada y respuesta de inclinación.

**M3. Dos superficies:** asfalto y tierra a igual velocidad. Antes de cambiar física, verificar si actualmente la información del material llega hasta el contacto de rueda.

**M4. Escalón o borde:** con movimiento lento, observar el apoyo del eje delantero y trasero. Si el modelo simplificado da resultados visibles inadecuados, probar **fuera del juego** un esquema de dos puntos de soporte.

**M5. Subir/bajar y agarrar manillar:** repetir 20 transiciones, registrar cuaterniones de huesos y distancia mano–puño; exigir resultado igual para entradas idénticas y sin deformación progresiva.

## Conclusión provisional

**Recomendado para estudiar primero:** superficies + apoyo en dos puntos + repetibilidad del piloto.  
**No recomendado ahora:** portar toda `CBike` o sustituir el integrador principal; sería un cambio grande, de alto riesgo legal/técnico, que probablemente bajaría rendimiento sin pruebas.
