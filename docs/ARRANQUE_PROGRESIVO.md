# Arranque progresivo

## Causa comprobada en el código

El indicador «100 %» forma parte del JPEG del menú. La versión anterior esperaba una pulsación en Entrar después del primer dibujo; no entraba sola. Antes de habilitar ese botón descomprimía y analizaba los dos catálogos completos (47.200.277 bytes de JSON del mundo y 7.832.184 de extensiones), preparaba todos los vehículos, personajes y paquetes visuales, y cargaba texturas de zonas todavía invisibles. La captura del teléfono por sí sola no permite distinguir esa espera de una interrupción de WebGL o falta de memoria.

## Cambios

- Catálogos iniciales: 14.627 + 22.048 bytes de metadatos JSON. Geometrías e imágenes separadas en bloques embebidos independientes; no se depende de HTTP, módulos externos ni un servidor para abrir el archivo local.
- Primera pasada: tres zonas cercanas y la zona permanente. Después continúa el planificador existente, con una zona nueva por pasada ordinaria, caché acotada y un solo trabajador de streaming.
- Los paquetes de personajes, superficies y materiales 34/42 también se separan durante la construcción. El dispositivo lee sus metadatos pequeños y recursos individuales, sin descomprimir ni analizar aquellos cuatro JSON gigantes. Los modelos y las imágenes reconstruidos son idénticos.
- Las texturas creadas por `loadTexture` usan la carga diferida nativa de Babylon. Antes de entrar se preparan las de mallas habilitadas a menos de 85 metros del vehículo inicial, en grupos de tres, con error visible si se agota el tiempo. Esto evita trasladar toda la espera al primer cuadro de partida. Los importadores glTF y el entorno conservan sus callbacks normales para evitar bloqueos.
- Entrada automática después del primer dibujo exitoso. Al volver desde pausa sigue disponible el menú de la imagen original. Audio y orientación conservan las restricciones del navegador y se activan con la interacción cuando haga falta.
- Calidad media inicial en pantalla táctil y resolución automática. No se vuelve a forzar resolución fija durante la instalación técnica.
- Pausas entre instaladores de arranque para permitir que el navegador dibuje el estado de carga.

## Alcance y límites

Este cambio evita descomprimir toda la geometría y cargar todas las texturas antes de entrar. Todavía se preparan los cuatro modelos de personajes, sus bibliotecas de animación y las plantillas de vehículos; tampoco convierte el HTML autónomo de aproximadamente 187 MB en una descarga pequeña: el navegador sigue leyendo el archivo completo.

No se ha medido el tiempo ni los FPS en el teléfono del usuario. La comparación automatizada se ejecuta con Chromium y GPU por software en GitHub Actions; no prueba 60 FPS en Android ni reproducción exacta de `content://` en su dispositivo.

## Reproducción

```sh
python3 scripts/build_performance.py
python3 tests/startup-assets.py
node tests/performance-block02.cjs
node scripts/test_startup_browser.cjs
```

Para el usuario se entrega el mismo HTML construido con el nombre `Nagua-City-Inicio-Rapido.html`, para distinguirlo del archivo anterior.

El workflow construye además un HTML de referencia con el arranque anterior para comparar los tiempos dentro de una misma ejecución. Los informes registran la primera entrada, las zonas residentes, errores, pausa, regreso al menú y streaming posterior.

## Resultado verificado

Commit de código probado: `b97cb3bbb3503723fed0e933c0beb822f984bc8b`.

| Medición | Anterior | Progresivo |
| --- | ---: | ---: |
| Navegación → partida activa, mismo runner | 66.334 ms | 40.234 ms |
| Zonas residentes al habilitar entrada | 9 | 4 |

La comparación usa los valores de inicio de cada versión en una pantalla táctil: antes calidad alta con resolución fija, ahora calidad media con resolución automática. Mide el cambio conjunto; no aísla cada optimización.

La reducción observada de navegación a partida activa fue del 39,3 %. El tiempo interno hasta el primer dibujo del arranque nuevo fue 28.472 ms; no incluye la lectura inicial del documento y no equivale a tiempo medido en Android. Se prepararon 25 texturas cercanas. La prueba continuó hasta 23 zonas, sin errores de página ni de texturas, y validó pausa, continuación y regreso al menú.

- [Prueba Chromium del HTML completo](https://github.com/kankwj5-eng/Nagua-City/actions/runs/38782679050).
- [Trece regresiones de rendimiento y conducción](https://github.com/kankwj5-eng/Nagua-City/actions/runs/38782678915).
- Evidencia completa: `startup-browser.json`, `startup-assets.json` y `startup-build.json` en esta carpeta.
- La reconstrucción de los seis paquetes coincide con el contenido oficial; los otros diez bloques de recursos son idénticos byte a byte.

SHA-256 del HTML entregado: `cf57f6d02d052685ac6da9969c1c0a5eaf40c9dcb84e5c56a76e9e42bdc94a51`. Tamaño: 186.871.481 bytes. El cambio prioriza lectura por partes y menor trabajo inicial; aumenta unos 4,6 MB el HTML autónomo respecto a la versión anterior.
