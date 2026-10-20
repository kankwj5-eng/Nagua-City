# Nagua City — referencias y especificación para barrios, vehículos y pasos a desnivel

Estado: **investigación técnica y referencias**, no es una implementación de mallas ni una promesa de FPS. Se mantiene el motor Babylon.js y el empaquetado modular.

## Prioridades solicitadas
1. Vegetación tropical densa pero bien situada, especialmente alrededor de patios, calles y barrios de tierra; proteger los FPS de Android.
2. Casas creíbles de barrios de tierra: muros de bloque y estuco, pintura envejecida, láminas de zinc, cercas, portones, puertas, marcos, rejas, desagües, vegetación y terreno desigual. Variar proporciones y colores sin multiplicar draw calls.
3. Coches: inspeccionar **cada ventana** (parabrisas, laterales, trasera), transparencia/reflejo PBR, normales y orientación de caras; evitar cristales invisibles por z-fighting o por LOD; añadir retrovisores, limpiaparabrisas, marcos, faros, placas y detalles de cabina solo tras confirmar presupuesto.
4. Motos: revisar faro, velocímetro, retrovisores, llantas, rayos, escape, manillar, guardabarros, frenos, asiento, soporte de placa, luces e intermitentes. Diversidad real de siluetas, no solo repintados.
5. Edificios emblemáticos de Managua fieles a referencias; colocar con lógica urbana y no sobre barrios, calles ni lugares ya ocupados.
6. Un paso a desnivel transitable, **inspirado en Las Piedrecitas y Rubenia**, conectado con la red de calles existente sin teletransportes.

## Referencias verificadas: pasos a desnivel

### Las Piedrecitas
- Fuente de la empresa de barandas, Grupo ITM: https://grupoitm.net/portfolio/puente-piedrecitas/
- Fotografías de la inauguración (noviembre de 2018): https://www.vivanicaragua.com.ni/2018/11/29/sociales/managua-se-engalana-con-la-inauguracion-del-paso-a-desnivel-las-piedrecitas/
- Fotografías del puente y apoyos: https://www.el19digital.com/articulos/ver/84581-impresionantes-imagenes-del-paso-a-desnivel-las-piedrecitas
- El conjunto tiene **dos puentes entrelazados**, barandas metálicas blancas, curvas elevadas, vigas bajo tablero, pilares de concreto, barreras y luminarias. Grupo ITM documenta puentes de 525 m y 440 m; NO trasladar dimensiones reales al mapa sin estudiar escala y red vial del juego.
- Prototipo sugerido: *paso a desnivel de tres niveles inspirado en Las Piedrecitas*, no llamarlo reproducción fiel hasta validar trazado, orientación y proporciones.
- Malla: tablero continuo extruido siguiendo curva paramétrica, arcén, juntas de dilatación, carriles, marcas discontinuas, separador, bordillos, barreras, pilares y vigas longitudinales.
- Geometría de conducción: superficies de colisión continuas y normales estables; las curvas y pendientes deben permitir moto y coche; cámara y peatones deben ignorar vías no accesibles. **No crear solo un objeto visual sobre el asfalto existente.**
- Optimización: compartir materiales, fusionar elementos estáticos por tramo, LOD por distancia, activar barandas y señalética cercana; medir CPU/GPU en Android.

### Rubenia
- Fotografía del viaducto con rotonda: https://www.el19digital.com/articulos/ver/titulo%3A32739-presidente-daniel-inaugura-paso-a-desnivel-de-rubenia-la-barricada-de-la-esperanza
- Referencia de diseño y contraste con Las Piedrecitas: https://www.laprensani.com/2015/10/17/nacionales/1920387-paso-a-desnivel-con-un-diseno-novedoso
- Usar como segunda referencia para la rotonda paisajística, rampas curvadas y accesos laterales. No combinar sin criterio los dos trazados reales.

## Edificios para el catálogo de monumentos

### Ya existe en código
- Torre Benjamín Zeledón, actualmente **aproximación** en `game/src/world/0063-install-landmarks21.js`, en coordenadas internas `(57,-285)`.
- Teatro Nacional Rubén Darío, Palacio Nacional de la Cultura y Antigua Catedral: aproximaciones en `game/src/world/0042-install-city.js`.
- Mirador de Tiscapa y monumento de Sandino: aproximación en `game/src/world/0063-install-landmarks21.js`.
- NO duplicar ninguno de estos antes de revisar su fidelidad.

### Nuevos candidatos
1. **Centro Pellas / BAC**: foto de fachada https://commons.wikimedia.org/wiki/File:Centro_Pellas_Managua.jpg ; vidrio azul verdoso, bandas horizontales, retranqueos y alas bajas. Ubicar en un sector corporativo, no junto a la Catedral sin lógica.
2. **Sede de Banpro**: foto https://commons.wikimedia.org/wiki/File:Banpro_Managua.jpg ; estudiar proporciones de fachada antes de modelar.
3. **Hotel Crowne Plaza Managua**: investigar su característica silueta piramidal y relación con Tiscapa; ubicar cerca del sector apropiado, no en el malecón.
4. **Centro corporativo Invercasa**: foto y referencias en https://commons.wikimedia.org/wiki/Category:Buildings_in_Managua ; confirmar volumen, fachadas y emplazamiento.
- Arquitectura del Centro Pellas: https://es.scribd.com/document/565802903/siglo-xx-y-xxi-edificios-nicaraguenses
- Para cada edificio: fotos de cuatro fachadas cuando existan, huella, altura, retranqueos, azotea, accesos, cristales, materiales, señalética; referencias con licencia y crédito. Evitar usar fotografías de terceros directamente como texturas sin permiso.
- La distribución definitiva depende de verificar la orientación y escala del mapa del juego. Primero comprobar solapamientos con colisiones y carreteras.

## Auditoría concreta del código de vehículos
- `game/src/vehicles/0287-create-vehicle.js`: instanciación de mallas desde `templates[name]`, pivotes de dirección y ruedas.
- `game/src/vehicles/0402-vehicle-finish42.js`: materiales PBR de vidrio y goma; tener material de cristal **no demuestra** que existan paneles de ventanas ni que sean visibles.
- `game/src/vehicles/0164-refine-vehicle28.js`: detalle de neumáticos y pedales de motos.
- `game/src/vehicles/0440-bike46.js`: actualmente comparte dos familias geométricas (`sport` y `work`), lo que explica la repetición de siluetas a pesar de varios nombres de motos.
- `game/src/vehicles/0454-batch-vehicle-bodies11.js`: revisar batching y LOD antes de alterar la visibilidad de los vidrios.
- Primera prueba de aceptación: contar por vehículo parabrisas, luneta y ventanas laterales, comprobar profundidad, transparencia y visibilidad en primera/tercera persona, y evitar que la optimización elimine el vidrio.
- Segunda prueba: variedad visible en silueta de trabajo, calle, deportiva y doble propósito; mantener posiciones de ruedas, manos del conductor y puntos de colisión.

## Secuencia de implementación, separada por PR
1. Auditoría reproducible de vidrio por modelo + corrección geométrica/material y capturas de Chromium.
2. Diferenciación de motos por chasis/carenado, con fuente compartida y LOD.
3. Casas y vegetación por manzana con streaming y comparación de FPS.
4. Edificios nuevos, **uno por PR**, validación de fidelidad y no colisión.
5. Puente transitable: primero topología de calles y rampa sin arte; después tablero/pilares, barandas y señales; finalmente tráfico y pruebas de subida/bajada en moto y coche.
6. Antes de fusionar: pruebas de arquitectura modular, conducción y escena, capturas, regresiones y publicación PWA. Comparar FPS reales en Android para cada bloque.

## Restricciones
- No afirmar que los modelos son copias fieles antes de comparar proporciones con fotos.
- No inventar coordenadas geográficas para colocar edificios en el mapa ficticio.
- No incrementar indiscriminadamente geometría, texturas o luces mientras existan FPS bajos.
- No tocar ni duplicar la Torre Benjamín ya modelada sin revisión explícita.
