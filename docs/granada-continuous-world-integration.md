# Granada + Managua: integración de mundo continuo

## Objetivo

Integrar Granada como un sector del mismo mundo transitable de Nagua City, conservando la escena visual detallada y haciendo que la transición entre sectores sea continua. La carga progresiva optimiza cuándo se prepara y mantiene cada sector; no debe degradar los materiales ni reemplazar los modelos cercanos por geometría simplificada.

**Estado:** planificación técnica inicial. Este documento no significa que Granada ya esté integrada ni que el juego combinado haya sido probado.

## Reglas que no se deben romper

1. No modificar ni fusionar a `main` durante la integración experimental.
2. No usar `Colisiones_Granada.glb` como escena visual: contiene proxies de colisión.
3. No volver a ejecutar scripts de modificación acumulativa sobre `Granada_Video.blend` V8.
4. No elegir una posición final de Granada a ojo. Definir y validar una transformación única entre WGS84/Blender y las coordenadas X/Z del juego, con Y como vertical en Babylon.js.
5. No recortar texturas, eliminar materiales o reducir detalle de primer plano para compensar una mala estrategia de carga.
6. No habilitar un sector para el jugador hasta que su terreno, navegación y colisiones esenciales estén disponibles.

## Lo que sabemos de la fuente de Granada

La documentación en `game/assets-granada/source/` declara Blender 4.2.3, unidades métricas, origen geográfico WGS84 [11.92982, -85.95324], conversión de Blender Z-arriba a GLB Y-arriba, 266 proxies de colisión y 479 muestras de suelo. El área modelada corresponde al entorno de la Catedral y La Calzada, no a toda Granada.

La fuente advierte que faltan la exportación visual preparada para el motor, el horneado de materiales, LOD, partición por zonas y pruebas dentro del juego. Las colisiones no cubren todos los detalles de la fachada. Estas limitaciones deben resolverse y verificarse antes de considerar la integración completa.

## Diseño propuesto

### 1. Paquete visual de producción

- Exportar la escena visual desde el archivo Blender V8 original sin volver a ejecutar scripts acumulativos.
- Definir una convención explícita de ejes, escala, origen, normales, UV y materiales para Babylon.js.
- Conservar materiales y texturas de alta calidad para el nivel de detalle cercano.
- Producir variantes LOD solo después de comprobar visualmente el modelo original; el LOD lejano no sustituye al modelo cercano.
- Separar la escena en sectores con límites espaciales claros y registrar tamaño, límites, dependencias y recursos de cada sector en un manifiesto.
- Comprobar transparencia, normales, iluminación, color, mipmaps y orientación con capturas de referencia.

### 2. Coordenadas y unión física

- Mantener una sola transformación geográfica reproducible desde el origen WGS84 de la fuente hasta X/Z del mundo.
- Verificar la escala usando distancias conocidas y varios puntos de control; comprobar rotación y orientación antes de desplazar edificios.
- Definir un corredor de unión con continuidad de carretera, aceras, terreno y altura. Evitar solapes, grietas, escalones y calles que terminen abruptamente.
- Separar el mapa visual de las consultas de suelo y colisión: añadir mallas visuales por sí solo no hace transitable el sector.
- Validar colisiones a pie y con vehículos; completar los huecos que dejan los 266 proxies cuando sean relevantes para el recorrido.

### 3. Streaming sin degradación visible

- Usar una máquina de estados por sector: `unloaded -> loading -> ready -> active -> retiring`.
- Priorizar sectores visibles y cercanos; después, sectores por delante de la cámara/jugador según dirección y velocidad; mantener una reserva para frenadas, giros y cambios de cámara.
- Preparar recursos fuera del camino crítico del fotograma y limitar el trabajo de creación de mallas por frame para evitar tirones.
- Activar la navegación del sector solo después de que estén listos el suelo y las colisiones esenciales.
- No descargar sectores todavía visibles, ocupados por el jugador/vehículo o necesarios para colisiones inmediatas.
- Cancelar o ignorar cargas obsoletas si el jugador cambia de dirección, evitando que una respuesta tardía reactive un sector innecesario.
- Compartir materiales y recursos idénticos cuando sea seguro; liberar texturas, buffers y geometría cuando ningún sector los use.
- Mantener el nivel visual más alto disponible cerca del jugador. El LOD solo depende de distancia y presupuesto de rendimiento medido, no de que el jugador haya entrado a Granada.

### 4. Integración con el motor existente

El cargador `OfficialCityV4` ya mantiene sectores, texturas, materiales, consultas de terreno y obstáculos, pero su lógica actual de `inWorld(x,z)` contiene regiones delimitadas explícitamente. Añadir un GLB por sí solo no amplía el mundo transitable. La implementación debe extender las definiciones de sector, límites, suelo, obstáculos y streaming de manera compatible, evitando una condición especial frágil para cada ciudad.

La estrategia debe respetar el cargador y las rutas de datos existentes. Antes de cambiar la lógica del motor, identificar el punto de entrada real y añadir pruebas para que los sectores actuales de Managua sigan funcionando sin regresiones.

## Fases y criterios de aceptación

### Fase A — exportación y auditoría geométrica
- [ ] Exportación visual independiente de la exportación de colisiones.
- [ ] Inventario de materiales/texturas y tamaños del paquete.
- [ ] Puntos de control de coordenadas, escala, orientación y elevación.
- [ ] Render de comparación con la escena V8 y revisión de errores de material.

### Fase B — sector de Granada aislado en el motor
- [ ] Cargar y descargar el sector sin afectar el mundo existente.
- [ ] Suelo correcto y colisiones esenciales funcionales.
- [ ] Sin errores de consola, materiales ausentes ni geometría invertida.
- [ ] Medir memoria, tiempo de carga y FPS en hardware objetivo.

### Fase C — unión continua Managua–Granada
- [ ] Corredor de carretera y terreno conectado en ambas direcciones.
- [ ] El peatón y los vehículos cruzan sin teletransporte ni pantalla de carga.
- [ ] Sin grietas, solapes, caídas por el terreno ni bloqueos de colisión en la unión.
- [ ] Las consultas de mundo y terreno reconocen ambos sectores.

### Fase D — streaming y calidad
- [ ] Carga anticipada de sectores según visibilidad, distancia y movimiento.
- [ ] No aparecen sectores vacíos delante del jugador a velocidad máxima de prueba.
- [ ] El detalle cercano no se degrada al entrar en Granada.
- [ ] Descarga segura de sectores lejanos y liberación de recursos no usados.
- [ ] Pruebas de recorrido largo, ida/vuelta, giros rápidos, cámara y reinicio.

### Fase E — candidata de integración
- [ ] Pruebas automatizadas existentes verdes y nuevas pruebas de regresión.
- [ ] Comparativa de FPS y memoria antes/después en equipos objetivo.
- [ ] Revisión visual del recorrido completo.
- [ ] Solo entonces abrir una PR para revisión; no fusionar automáticamente.

## Primera tarea de implementación

Preparar y validar el paquete visual de Granada y su transformación de coordenadas antes de tocar las reglas de mundo o el cargador de producción. Esta es la dependencia crítica: sin una geometría exportada fiable y una ubicación medible, cualquier ajuste de streaming o colisiones sería prematuro.
