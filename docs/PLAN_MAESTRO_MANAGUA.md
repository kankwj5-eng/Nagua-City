# Plan maestro de Managua: ciudad más extensa, conectada y auténtica

**Fuente creativa:** tres videos aportados por el creador (16 de octubre de 2026). No se incluyen copias ni fotogramas de terceros en el juego o el repositorio. El mapa es una interpretación artística de Managua y no una reproducción cartográfica a escala.

## Regla definitiva de transformación urbana (aprobada por el creador)

**Conservar el tejido de Managua y las casitas siempre que sea compatible con una obra correctamente situada.** Sin embargo, **SÍ se puede quitar una vivienda existente** cuando el proyecto requiere ese lugar para un edificio emblemático, una vía o un equipamiento que debe encajar urbanísticamente. No limitarse a solares libres si son sitios equivocados.

La sustitución se hace de forma selectiva y verificable:
1. Elegir primero **qué edificio corresponde a esa zona y por qué**, no buscar un solar vacío al azar.
2. Levantar un inventario de la huella completa, con viviendas, colisiones, mallas visuales, jardines, calles, accesos, servicios y edificios protegidos.
3. Preferir conservar las casas. **Cuando una casa deba sustituirse**, identificar explícitamente la unidad, quitar su malla, sus detalles y **solo sus** colisionadores y datos; **no borrar las casas vecinas ni las calles**.
4. Instalar la nueva construcción con alineación de calle, cimientos a nivel de suelo, acceso real y acera, sin geometría doble ni fachadas enterradas.
5. Registrar las viviendas afectadas, el motivo de la sustitución y comparativas antes/después. Si no se puede atribuir con certeza una malla o un colisionador a la casa, **no borrar a ciegas**; aplazar el reemplazo hasta resolver el inventario.
6. No tocar hitos ya terminados (Antigua Catedral, Palacio, teatro, Tiscapa, Nueva Catedral, etc.) sin una mejora deliberada y prueba de regresión.
7. Mantener diversidad: los barrios existentes de casas bajas continúan siendo el tejido dominante; los edificios modernos se concentran por jerarquía urbana.

## Lectura visual de los tres videos

| Referencia | Lo observado | Requisito de desarrollo |
| --- | --- | --- |
| 1: cruce a desnivel visto desde dron | Viaducto central con rampas largas y curvas, rotonda inferior ajardinada, intersecciones suaves, mediana e isletas, carriles continuos, palmeras, arbolado y viviendas alrededor | Reconstruir por fases el cruce de dos niveles: circulación real, geometría conectada, barandas con colisión por altura, paisaje y señalización sin superposiciones |
| 2: arquitectura de Managua | Hotel claro de cubierta de teja terracota; fachadas blancas de plantas repetidas; torres técnicas; oficinas azul oscuro de vidrio y cuerpos horizontales | Biblioteca de seis tipos propios, detalles diferenciados, estuco, cubierta roja, concreto y vidrio PBR; seleccionar parcelas por función y distrito, con reemplazos justificados si es necesario |
| 3: panorámica de Managua | Avenidas extensas, cruces ajardinados y rotondas, carriles separados, árboles y casas bajas hasta el horizonte, algunas torres y oficinas sobre ejes | Escala y densidad orgánicas: avenidas anchas legibles, vegetación tropical distribuida por sector, continuidad de medianas, centros comerciales modernos sin saturar los barrios |

## Dónde va cada familia

- **Centro y grandes intersecciones:** viaducto emblemático, rotonda, parques y pocas edificaciones institucionales o modernas destacadas; paisaje con señalización, aceras y luminarias.
- **Corredores principales:** oficina azul de vidrio, hotel de teja roja, edificios blancos de comercio y complejo corporativo bajo; variedad en alturas y fachadas, separados por viviendas y arbolado.
- **Transiciones a barrio:** bloques residenciales/comerciales medios en frentes viales cuando corresponda, respetando los patios y la escala de los alrededores.
- **Barrios y periferia:** conservar mayoritariamente casas de bloque/ladrillo, techo de zinc y porches, patios, guineos, postes, cables y vegetación; edificios altos solo si existe fundamento de ubicación.

Ninguna instrucción permite destruir barrios completos ni sustituir masivamente casas por clones. Toda sustitución exige una lista explícita de parcelas y una prueba de que no quedan objetos dobles.

## Ejecución por etapas

### Etapa 0 — Inventario, planificación y pruebas de protección
- [x] Documentar los tres videos y las reglas de sustitución selectiva.
- [ ] Inventario de casas, fachadas, jardines, arbolado, carreteras, rampas, monumentos, colisionadores y estructuras procedurales o de streaming.
- [ ] Construir herramienta de decisión de parcelas: área completa, solapamientos, uso, tipo de vivienda a sustituir y elementos protegidos.
- [ ] Prueba: nunca desaparece ninguna casa **que no esté en la lista de reemplazo aprobada**; la casa reemplazada desaparece visual y físicamente.

### Etapa 1 — Cruce vial central de calidad
- [x] Paso a desnivel funcional inicial con dos alturas, rampas y tráfico separado (PR #45).
- [ ] Conectores y curvas de acceso, rotonda inferior con circulación efectiva, arcenes y medianas vegetales compatibles con las rutas reales.
- [x] Barreras laterales con **colisión dependiente del nivel** para vehículos y peatones, sin convertirlas en obstáculos globales 2D ni tapar el paso inferior. Juntas de dilatación, nervaduras bajo tablero y reflectores pasivos (PR #49, fusionado tras pruebas).
- [x] Losa inferior continua del puente y dos pasos peatonales pintados sobre la calzada inferior, sin nuevas colisiones ni luces (siguiente entrega complementaria).
- [ ] Aún pendientes: aceras conectadas, cartelería vial, drenaje detallado y señalización horizontal completa en las curvas y accesos; la barrera física no sustituye la red vial final.
- [ ] Verificar entradas y salidas, flujo de tráfico en ambas alturas y que nada quede encima de casas o vehículos.

### Etapa 2 — Catálogo arquitectónico moderno
- [x] Primera entrega piloto (PR #47): tres modelos originales — hotel con teja terracota, oficinas acristaladas en azul y bloque comercial blanco — con búsqueda de parcela comprobada y registro en el mapa. La prueba visual en Chromium comprueba las construcciones que realmente aparecen; no constituye una recreación exacta de un inmueble determinado.
- [x] Catálogo **procedural** de seis familias inspirado en los videos, en dos entregas: hotel terracota, comercio blanco, oficina azul, torre técnica con exoesqueleto, sede corporativa horizontal y edificio institucional con pilastras. Los tres modelos de la segunda entrega superaron la inspección visual en Chromium del PR #48; no son copias exactas de inmuebles reales.
- [ ] Coordinar las ubicaciones por zona; **si una parcela correcta tiene casa, reemplazar exclusivamente esa casa** mediante una operación atómica de malla + datos + colisión.
- [ ] Variedad de pisos, volumen, orientación y huecos de ventana; entradas funcionales y bases ajustadas al terreno.
- [ ] Materiales PBR compartidos, atlas y LOD. Añadir por etapas sin generar centenares de mallas por torre.



**Segunda tanda validada e integrada (PR #48):** torre técnica en el corredor sureste (entorno x=210, z=-249), sede corporativa baja en expansión oriental (x=273, z=18) y edificio institucional en la zona norte (x=-6, z=321). Las tres parcelas adicionales se eligieron entre candidatos auditados en Chromium; la selección definitiva sigue comprobando calles, hitos, edificios y colisionadores. No se borra ninguna casita en esta fase; la sustitución identificada de viviendas sigue como etapa pendiente. Las coordenadas son internas al juego, no geográficas.

**Distribución piloto verificada en Chromium (PR #47):** hotel de teja roja en el sector litoral suroriental (x=147, z=-249), oficinas azules en la expansión oriental (x=280, z=67) y bloque comercial blanco al norte del centro (x=-6, z=300). Son coordenadas del mapa artístico del juego, **no coordenadas geográficas reales**. La prueba confirmó tres edificios nuevos, 267 edificios anteriores conservados y tres mallas fusionadas. El sistema puede buscar alternativas en la misma zona si el solar inicial se ocupa. Todavía no elimina casas, porque los modelos de casas base pueden proceder del paquete dinámico de zonas y no siempre tienen malla y colisión individual atribuibles. La autorización general para sustituir una casa sigue vigente, pero la demolición requiere trazabilidad específica de mallas, techos, adornos y colisionadores.

### Próximo paquete de implementación — cruces y paisajismo

1. Inventariar la geometría y las colisiones del paso a desnivel central, identificar cada rampa, los accesos a nivel de suelo y los puntos donde confluyen.
2. Implementar **conexiones transitables** con continuidad de pendiente, curva y ancho; comprobar circulación arriba y abajo sin colisiones falsas.
3. Instalar isletas y jardineras bajas fuera del área de rodamiento, con distancias mínimas a rampas, peatones y cruces.
4. Añadir señalización horizontal y señales con coste gráfico bajo, evitando nuevas luces dinámicas.
5. Crear pruebas automáticas para rutas completas, ausencia de superposiciones, conservación de viviendas y rendimiento de mallas.
6. No dar por terminada esta etapa hasta comprobarla en el navegador real y, después, en Android físico.

### Etapa 3 — Vegetación y extensión perceptiva
- [ ] Medianeras verdes, isletas y rotondas, guineos, palmas, árboles de sombra y arbustos, sin plantar sobre pavimento ni obstáculos.
- [ ] Perfiles diferentes para centro, avenidas, barrios y periferia; evitar repetición periódica evidente.
- [ ] Profundidad visual y silueta urbana amplia, manteniendo zonas naturales y árboles existentes.

### Etapa 4 — Calidad, experiencia y rendimiento
- [ ] Acabado de fachadas, asfalto, señalización, luces cálidas o neutras, atardecer y noche sin saturar GPU.
- [ ] Cámara, animaciones de peatones y conducción compatible con pendientes, cruces y aceras.
- [ ] Probar con Chromium/Playwright, Android físico, conteo de mallas, memoria y percentiles de FPS; CI no certifica FPS reales del teléfono.
- [ ] Integrar cada cambio en PR independiente y publicar solo tras pruebas verdes.

## Primera implementación verificable

- Mejorar el entorno inmediato del viaducto mediante jardineras bajas en **parcelas comprobadas** fuera del área de rodamiento; respetar todas las estructuras presentes.
- Definir en código un **planificador de parcela** con posibilidad de ocupación por casas seleccionadas, pero bloqueo de calles/hitos/colisionadores ajenos. El planificador no puede eliminar por sí solo mallas que todavía no estén identificadas.
- Pruebas automáticas del nuevo acabado y de la clasificación del reemplazo, más regresiones del juego y de la versión web.

**Criterio de calidad:** ampliación coherente con la ciudad real, textura y vegetación cuidadas, y cero objetos solapados. No declarar terminados el complejo vial o toda la distribución moderna solo porque existe la primera versión.
