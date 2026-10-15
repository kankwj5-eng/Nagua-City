# Trabajo de rendimiento por bloques

Base oficial: `Managua_Del_taller_al_lago(1).html`, commit `5f33d18`.
El archivo original de Git LFS se conserva íntegro. No se usan las correcciones de la sesión perdida como si se hubieran recuperado.

## Bloque 01 — buffers de animación

Las pistas constantes repetían el mismo valor Float64 en todos sus cuadros. Ahora almacenan un solo cuadro y comparten ese buffer exacto dentro de cada carga de biblioteca. Se conservan el número original de cuadros, sus tiempos, precisión, interpolación del motor y scratch independiente de cada actor. La tabla temporal de buffers se libera al terminar la preparación.

No se omite la interpolación de quaterniones constantes: algunos valores originales no tienen norma exactamente uno. Omitirla cambiaría el resultado. Los ceros positivos y negativos tampoco se mezclan.

Medición de almacenamiento de keyframes de las dos bibliotecas:

| Medida | Original | Bloque 01 |
| --- | ---: | ---: |
| Bytes únicos de buffers preparados | 15.587.936 | 9.658.632 |
| Bytes evitados | — | 5.929.304 (5,65 MiB) |

Es una reducción del almacenamiento de animaciones; no es una medición de toda la RAM ni una promesa de aumento de FPS. Las pistas se comparten entre actores desde la versión original, por lo que no se multiplica este ahorro por el número de NPC.

Comprobación local: 1.948.492 valores y 154.336 muestras de interpolación, con error máximo cero, usando el Babylon.js 9.29.0 integrado en el HTML. Ambos runtimes también pasan la comprobación sintáctica. Todo lo situado fuera de appSource queda idéntico byte a byte: recursos, modelos, texturas, shaders, resolución, sombras y UI.

Pruebas reproducibles:

```sh
git lfs pull
python3 scripts/build_performance.py
node --max-old-space-size=512 tests/performance-block01.cjs
```

El resultado es `dist/Managua.html`, un HTML independiente. GitHub Actions vuelve a ejecutar las comprobaciones y conserva el HTML junto con los informes. No se añaden dependencias de ejecución al juego.

## Orden de los próximos bloques

1. Verificar concurrencia, caché y lecturas repetidas del streaming. Cambiar únicamente lo que muestre una prueba reproducible.
2. Auditar recursos retenidos tras arrancar, cargar zonas y volver a ellas. Separar memoria JavaScript, buffers y GPU.
3. Medir CPU de cada actualización al conducir y eliminar trabajo redundante conservando las poses y la física.
4. Medir render y llamadas de dibujo. Preservar la calidad; comprobar los FPS reales en el dispositivo antes de atribuir mejoras.

Cada bloque tiene un cambio pequeño, comparación con la base, pruebas y un commit propio. No se mezclan aquí modificaciones de historia, modelos, conducción ni menú.

## Bloque 02 — planificación del streaming

La caché existente ya comparte la descompresión de una zona entre solicitudes simultáneas; se conserva ese comportamiento. El cambio se limita a `streamPass44`:

- Crear candidatos solo después de comprobar el radio, evitando objetos para zonas lejanas.
- Calcular la distancia de cada zona cargada una vez y reutilizarla al ordenar y decidir su descarga.
- Separar las zonas permanentes durante el mismo recorrido y reutilizar esa lista.

Se mantienen los radios, cantidades, presupuestos por pasada, orden de carga y descarga, caché, descompresión, errores y solicitudes forzadas. No se reducen zonas visibles ni se difiere su carga respecto a la base.

Prueba determinista con metadatos reales de las 119 zonas del HTML, tres vueltas por la ruta, las tres calidades, cambios de posición durante una carga, menú, garaje y conducción. Son pruebas del planificador y de la caché con geometrías sustituidas, no mediciones de render ni de FPS.

| Calidad | Cálculos de distancia antes / después | Registros candidatos antes / después |
| --- | ---: | ---: |
| Baja | 21.333 / 16.064 | 14.632 / 2.280 |
| Media | 26.696 / 16.716 | 14.632 / 2.995 |
| Alta | 34.213 / 17.569 | 14.632 / 4.278 |

En los tres casos la secuencia completa de cargas, descargas y actualizaciones de sombras coincide con la base. Cada calidad ejecuta 242 solicitudes y 124 pasadas con un máximo de un trabajador. También se comprueban 60 solicitudes simultáneas de un buffer con una sola descompresión, separación de namespaces, límite de caché, evacuación LRU y reintento tras error. Estas protecciones ya existían; no se presentan como arreglos nuevos.

```sh
node --max-old-space-size=512 tests/performance-block02.cjs
```

El fixture contiene solo ID, posición y permanencia de las zonas originales. Está asociado al SHA-256 de la base oficial; una nueva base requiere actualizar la prueba. Informes: `block02-results.json` y `block02-build.json`. El control de integridad sigue confirmando los 16 bloques de recursos originales y todo el contenido externo a appSource, byte a byte.

## Bloque 03 — memoria retenida de animaciones, sin redondeo

Se auditaron los consumidores de los datos de preparación. La biblioteca anterior `stage38.cache` permanece disponible para la fábrica de personajes; no se elimina porque tiene un consumidor válido. Tampoco se borran buffers de geometría, fuentes de texturas ni datos necesarios para reconstruir recursos del motor.

El cambio se limita a `packKeys45`: comprueba todos los valores de una pista antes de reservar su almacenamiento. Solo usa Float32Array si cada valor finito coincide exactamente con `Math.fround(valor)`, comprobando también el signo de cero. Si un solo valor requiere mayor precisión, toda la pista conserva Float64Array. No se redondea ningún valor para hacerlo entrar en el formato pequeño. La interpolación y la compartición de buffers constantes no cambian.

En la base oficial, las 2.544 pistas de la biblioteca anterior ya son exactamente representables en 32 bits. Las 8.480 pistas de la biblioteca actual necesitan conservar 64 bits y se dejan intactas.

| Buffers únicos preparados | Tras bloque 02 | Tras bloque 03 |
| --- | ---: | ---: |
| Biblioteca anterior, conservada para la fábrica | 3.249.488 bytes | 1.624.744 bytes |
| Biblioteca actual | 6.409.144 bytes | 6.409.144 bytes |
| Total | 9.658.632 bytes | 8.033.888 bytes |

Ahorro adicional de este bloque: 1.624.744 bytes (1,55 MiB). Acumulado frente a la base, junto al bloque 01: 7.554.048 bytes (7,20 MiB) de almacenamiento de keyframes. Estos importes corresponden a buffers, no a RAM total ni a una mejora de FPS medida.

La comparación acumulada vuelve a comprobar 1.948.492 valores y 154.336 muestras interpoladas con error máximo cero. El bloque 03 además verifica almacenamiento, conservación de valores, ceros con signo, subnormales, límites de enteros, valores no finitos y retorno automático a 64 bits ante una sola clave de alta precisión. Las pruebas del streaming y la integridad de los 16 bloques de recursos también siguen pasando.

```sh
node --max-old-space-size=512 tests/performance-block03.cjs
```

La comprobación de animaciones del bloque 01 ahora extrae el código del HTML generado, para verificar la versión acumulada que se entrega. Sus informes actuales pueden mostrar el ahorro acumulado; `block01-results.json` conserva la medición histórica del primer bloque.

Se probó y descartó una limpieza de dos nodos de texto de arranque: el ensayo del DOM no demostró una bajada de RAM JavaScript. No se incluye ese cambio ni se presenta el recuento de caracteres como memoria liberada. El bloque aceptado es el de buffers, cuyo tamaño se mide directamente.


## Bloque 04 — espera de apertura: preparación de vehículos

Se midió el arranque completo y se aisló una espera evitable en `createTemplates`: el código cedía el hilo mediante `setTimeout(0)` antes de cada grupo de piezas. En Chrome esas pausas se aproximaron a 4 ms al repetirse, aunque el grupo hubiera terminado rápidamente. Con los recursos reales se realizan 963 pausas entre piezas y modelos.

Ahora esta función comprueba el tiempo transcurrido y cede entre piezas al acumular unos 8 ms de trabajo. Una malla individual no se interrumpe a mitad de construcción. Se mantiene además la pausa al terminar cada modelo para permitir pintar el progreso. Los 24 modelos y las 963 mallas, sus índices, normales, UV, materiales, metadatos, jerarquía, orden y liberación de datos permanecen iguales. No se cambia el plan de carga del barrio, la resolución ni los recursos visuales.

Comparación de una apertura por versión en Chrome 131 headless, SwiftShader por software, ventana 960×540, contenedor de escritorio:

| Medición | Antes del bloque 04 | Después |
| --- | ---: | ---: |
| Preparación de vehículos | 4.516 ms | 787 ms |
| Pausas en esa preparación | 963 | 65 |
| Arranque hasta habilitar entrada, desde boot45 | 41.850 ms | 37.288 ms |
| Zonas al entrar | 9 | 9 |
| Vehículos / peatones | 45 / 62 | 45 / 62 |
| Mallas activas en el menú | 734 | 734 |

Ambas aperturas llegaron a `ready`, habilitaron el botón y permitieron entrar (`playing=true`), sin errores JavaScript capturados. La etapa optimizada redujo su tiempo unos 3,73 s en esta comparación. La diferencia de 4,56 s del arranque completo incluye variación de otras etapas: no debe atribuirse toda al cambio ni presentarse como una garantía en Android. El cronómetro boot45 comienza después de leer y ejecutar los scripts iniciales del HTML; no incluye toda la lectura del archivo. El informe conserva también el tiempo observado desde la navegación.

La prueba determinista con recursos reales compara los bytes de cada canal de geometría y el orden de construcción. Simula piezas rápidas y lentas para verificar que el número de pausas se adapta al trabajo; esos tiempos simulados no son medidas de carga real. También comprueba propagación de un error de construcción. Las otras tres pruebas siguen pasando y todo lo externo a appSource continúa idéntico byte a byte.

```sh
node --max-old-space-size=512 tests/performance-block04.cjs
```

Informes: `block04-results.json`, `block04-build.json` y `block04-browser.json`. El cambio funcional de este bloque se limita a `createTemplates`. El perfil detectó además coste en construcción de materiales, preparación de personajes y primera imagen; quedan como bloques posteriores, sin alterar todas esas etapas a la vez.


## Bloque 05 — compartir geometría estática de vehículos

Se comparan los atributos y los índices, su disposición y sus bytes. Un hash agrupa candidatos, pero nunca autoriza compartir por sí solo: se comprueban todos los bytes para evitar colisiones. Materiales, transformaciones, objetos, índices de submalla y visibilidad permanecen separados. La integración solo examina geometrías de las plantillas de vehículos, antes de crear la flota. No toca cachés de cuerpos humanos, geometrías animadas, modificables, con morph targets, con varias submallas o con datos de construcción que puedan actualizarse.

En las plantillas de la base oficial hay 336 geometrías repetidas, con 6.444.424 bytes de datos redundantes (6,14 MiB). La prueba con el motor Babylon 9.29.0 conserva exactamente una huella de atributos, índices, matrices, materiales y visibilidad, incluidos un clon y una instancia. También fuerza colisiones de hash y comprueba las exclusiones. En el navegador se examinaron 939 geometrías de piezas, sin las 24 geometrías LOD separadas; se compartieron las mismas 336.

Las geometrías duplicadas sin usuarios se disponen explícitamente: cambiar su asociación sin disponerlas no liberaba los buffers del motor. El índice auxiliar de comparación se vacía al finalizar. Los bytes indican datos redundantes que dejan de requerir buffers separados; no una medición de RAM total ni una mejora demostrada de FPS.

```sh
node --max-old-space-size=768 tests/performance-block05.cjs
```


## Bloque 06 — jardines con residencia por proximidad

Los jardines conservan exactamente sus fuentes, ubicaciones, escala, orientación, materiales y colisiones. Ahora se guardan ubicaciones ligeras y se crean primero las instancias cercanas al punto de inicio. Se prepara un margen adicional de 60 m; las instancias situadas a más de radio + 100 m se disponen. Las colisiones de todas las ubicaciones se registran una sola vez desde la preparación, aunque todavía no haya una instancia de dibujo.

La precarga de instancias ocultas trabaja como máximo dos jardines por cuadro y comprueba un presupuesto de 8 ms entre trabajos. Los jardines ya visibles tienen prioridad: un cambio de radio o un salto de posición resuelve todos los necesarios antes del dibujo, para evitar sacrificar contenido visible. Esto puede producir una ráfaga de trabajo al teletransportarse; no se promete un límite absoluto de 8 ms para ese caso. El límite tampoco interrumpe a mitad una operación individual del motor.

La prueba usa el motor real y un fixture de 245 ubicaciones. Crea inicialmente 63 jardines, en lugar de los 245, y recorre 144 visitas con tres calidades. Compara más de 3.200 huellas de geometría y transformaciones y los conjuntos visibles, con colisiones idénticas. El pico fue de 72 jardines residentes. Las instancias antiguas se eliminan tanto del planificador como de `art46.gardenRoots` y del motor.

En el juego completo se encontraron 174 ubicaciones, de las cuales se construyeron 57 al abrir. La cifra de 245 pertenece al fixture de estrés, no al mapa real. Este bloque introduce carga progresiva para los jardines; no convierte todavía todos los edificios, personajes y materiales a residencia espacial.

```sh
node --max-old-space-size=768 tests/performance-block06.cjs
```


## Bloque 07 — matrices de detalles móviles

El constructor `makeDetailGroup` congela matrices para detalles estáticos. Dos mallas de detalles de vehículos en el juego completo conservaban ese estado después de incorporarse a una jerarquía móvil. Ahora se descongelan únicamente los descendientes de vehículos que lo necesitan, al terminar la preparación. Las matrices de la ciudad estática permanecen congeladas.

La prueba reproduce un panel que queda separado de su vehículo al trasladarlo o girarlo: falla en cinco de seis posiciones antes del cambio y sigue correctamente la jerarquía en las seis después. La tolerancia de 1e-6 admite la precisión de matrices Float32; el error observado fue menor de 3e-8. No se modifica la física, el paso de simulación ni la interpolación general. Este fallo de detalles móviles está demostrado; no demuestra por sí solo que explique todos los tirones descritos en el teléfono.

```sh
node --max-old-space-size=512 tests/performance-block07.cjs
```

### Comprobación acumulada y límites

Se abrió el HTML acumulado en Chrome 131 con SwiftShader, contenedor de escritorio y ventana 320×180. Llegó a `ready` y permitió entrar. Se reprodujeron 30 cuadros a 8 cuadros/s simulados con la rasterización GPU desactivada solo en el banco de pruebas. Esto ejercita el bucle, sus poses y callbacks; **no mide FPS reales de conducción**. No había AnimationGroups del motor ejecutándose en paralelo. El vehículo se detuvo al encontrar una colisión en ese recorrido, por lo que no es una prueba de conducción prolongada libre de obstáculos.

Después se hicieron tres ciclos de cinco destinos. Al terminar cada ciclo, los recursos se estabilizaron en 7.814 mallas, 3.420 geometrías, 705 materiales y 417 texturas; la caché de zonas quedó en 32.933.903 bytes, por debajo de su límite de 32 MiB, y la de casas tuvo ocho entradas. El contador de jardines mostró 466 construcciones y 415 disposiciones al final. No hubo errores JavaScript capturados. Esto verifica estabilidad de esos recuentos en ese recorrido, no ausencia universal de fugas. La lectura `performance.memory` fue cuantizada y se conserva como aproximación, sin certificar ahorro de RAM total.

La apertura sigue incluyendo preparación global de personajes, materiales y arquitectura. Un HTML con todos los recursos integrados requiere además leer y analizar esos datos iniciales, aunque el dibujo sea progresivo. No se presenta esta entrega como solución completa de los 8–10 FPS ni del tiempo de carga en Android. El siguiente cuello de botella requiere aislar coste de dibujo, sombras y residencia de personajes, conservando calidad.

Informes de estos bloques: `block05-results.json`, `block06-results.json`, `block07-results.json`, `block05-07-build.json` y `block05-07-browser.json`. La construcción mantiene idénticos los 16 bloques de recursos y todo el contenido fuera de appSource. Las siete pruebas se ejecutan en GitHub Actions.


## Bloque 08 — copias de puntos de consulta, sin tocar el dibujo

El muestreo del heap situó `_getData` del motor como principal origen de asignaciones vivas: aproximadamente 230,9 millones de bytes muestreados. Es una atribución estadística, no un recuento exacto de todas las copias. En Babylon 9.29, `refreshBoundingInfo` crea por defecto una lista de Vector3 por vértice, además de los buffers usados para dibujar. El código del juego deshabilita la selección sobre las mallas y utiliza colisionadores propios, por lo que muchas de esas copias son redundantes.

La limpieza se limita a mallas sin selección, sin skeleton, sin morph targets y sin animación de vértices. Comprueba que cada Vector3 coincida exactamente con los vértices sin deformar antes de liberar su referencia. No modifica posiciones, índices, normales, UV, materiales, bounding boxes ni cachés geométricas compartidas. Las copias que difieren se conservan. No cambia el prototipo global de Babylon.

Comparación antes/después en **la misma sesión**, con recolección completa de basura antes de cada lectura de `Runtime.getHeapUsage` del depurador de Chrome 131:

| Heap V8 usado | Bytes | MiB |
| --- | ---: | ---: |
| Antes de limpiar | 475.170.396 | 453,16 |
| Después | 368.774.888 | 351,69 |
| Diferencia | 106.395.508 | 101,47 |

Se retiraron 1.550.900 objetos de puntos en 1.824 mallas; 32 copias que diferían se mantuvieron. No es RAM total del proceso, memoria GPU ni una medida de Android. El contador `performance.memory` del HUD mostró una lectura cuantizada de 793 millones de bytes durante la investigación; no se usa para calcular ese ahorro. Los datos del perfil y los de esta comparación pertenecen a ejecuciones distintas y no se restan entre sí.

La medición se realizó aplicando la limpieza al HTML de bloques 05–07 ya abierto. La integración del bloque 08 la instala al finalizar la preparación y observa nuevas mallas para limpiarlas después de completar su creación. La cola temporal se vacía al procesarse y al disponer la escena. Además, las mallas creadas por `meshData` usan la opción nativa `updatePositionsArray:false` para calcular sus límites sin crear esas copias por defecto. Se conserva el comportamiento nativo cuando se solicita explícitamente una copia o se calcula deformación. El prototipo global del motor permanece intacto.

La prueba con el motor integrado comprueba buffers y límites idénticos, selección por rayos regenerada bajo demanda, exclusión de mallas seleccionables y skinned y copias distintas, nuevas mallas, y la prevención de copias en el `meshData` del HTML generado. La prueba de rayos conserva distancia y punto de impacto exactos. Las siete pruebas anteriores siguen formando parte de CI; ahora se ejecutan ocho. Esta optimización reduce memoria retenida y evita trabajo de preparación de puntos, pero no certifica FPS nuevos en el teléfono.

```sh
node --max-old-space-size=512 tests/performance-block08.cjs
```

Informes: `block08-results.json`, `block08-build.json`, `block08-memory.json` y `block08-profile.json`. Se siguen conservando íntegros los recursos y todo el contenido externo a appSource.

## Bloque 09 — diagnóstico profundo optativo

Se incluye un grabador de 15 segundos accesible desde ajustes y `Nicaragua.diagnostics09`. Separa etapas del bucle y activa temporalmente los contadores de Babylon para evaluación de mallas, render targets, dibujo CPU y animaciones. Reutiliza la consulta GPU existente cuando está disponible. Exporta JSON local, con series acotadas, intervalos P50/P95/P99 y cuadros lentos. Se detiene al ocultar la pestaña y restaura los indicadores de instrumentación. Los tiempos anidados no se suman. Las consultas GPU son asíncronas y pueden repetir el último resultado disponible. Sin captura no se leen relojes por etapa.

La prueba 09 verifica almacenamiento acotado, percentiles, reloj inactivo, conservación de `this` y excepciones y sintaxis del código entregado. El banco de Chrome/CPU Profiler y las instrucciones de Android/Perfetto están en [PERFILADO.md](PERFILADO.md).

## Bloque 10 — no invalidar vehículos estacionados

`Vector3.y` del Babylon integrado marca el vector como cambiado incluso cuando se le asigna exactamente el mismo número. `updateFleet` escribía la altura de cada vehículo estacionado en cada cuadro, provocando recálculos de su jerarquía. Ahora se calcula la misma altura y se escribe solo si `Object.is` detecta un cambio. Se mantiene el signo de cero y no se cachea el terreno: cualquier altura nueva se aplica inmediatamente.

La prueba con el motor integrado reproduce 12 jerarquías de vehículos con 16 mallas cada una. En 120 cuadros estacionados, los eventos de actualización de matrices pasan de 25.920 a cero después del calentamiento. Compara exactamente las matrices y realiza otras 72 comparaciones con cambios de posición, tráfico, calidades, garaje, conducción y vehículos retirados. El fixture aísla invalidación de matrices; no representa una ganancia de FPS medida en Android.

## Bloque 11 — agrupar piezas opacas de carrocerías

El perfil de escritorio sitúa el coste dominante en render y llamadas WebGL. Los modelos contienen numerosas piezas de una misma carrocería con idéntico nombre y material, que se dibujan por separado. El nuevo bloque concatena sus canales de vértices sin transformarlos ni redondearlos y ajusta únicamente los índices por el desplazamiento de vértices. Mantiene nombre, padre, material y banderas de dibujo. Se aplica antes de compartir buffers y antes de crear la flota.

Se excluyen todas las motocicletas, ruedas, dirección, cristales, piezas transparentes o con alpha test y geometrías animadas, modificables o incompatibles. Los cristales se excluyen también por nombre porque el juego les activa transparencia en una etapa posterior. No se cambian texturas, iluminación, resolución, física ni cantidad de vehículos. Una malla agrupada tiene un límite espacial conjunto: puede evaluarse/dibujarse completa donde antes se descartaban algunas piezas individuales. No se afirma igualdad del conjunto de llamadas de dibujo ni de todos los píxeles de las sombras en los límites de distancia.

La prueba 11 usa las geometrías reales y compara exactamente los valores de todos los atributos siguiendo sus índices, por nombre, padre y material. También conserva la identidad de ruedas, dirección, motocicletas y cristales y verifica idempotencia. La comparación de navegador debe considerarse aparte de esta prueba geométrica.
