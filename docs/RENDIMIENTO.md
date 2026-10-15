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
