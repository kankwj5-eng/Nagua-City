# Perfilado profundo: objetivo de 60 FPS

Punto de partida comunicado por el usuario: unos 10 FPS en Chrome para Android. Modelo del teléfono, GPU, versión de Chrome y calidad aún no registrados. 60 FPS requiere completar cada cuadro aproximadamente en 16,67 ms; no basta con reducir el tamaño del HTML o la memoria de animaciones. El objetivo sigue abierto hasta medir el dispositivo físico.

## Herramientas y alcance

| Herramienta | Qué permite localizar | Estado / límite |
| --- | --- | --- |
| Chrome DevTools, CPU Profiler por CDP | Funciones costosas, pilas, pausas de JS | Banco automatizado `scripts/profile_browser.cjs`; perfiles `.cpuprofile` importables en DevTools |
| Babylon SceneInstrumentation | Evaluación de mallas, render targets/sombras, dibujo CPU, animaciones, draw calls | Activado solamente durante el diagnóstico del juego |
| Babylon EngineInstrumentation | Tiempo GPU mediante timer queries cuando el controlador lo permite | Se reutiliza la consulta existente; N/D cuando no está disponible; sus resultados son asíncronos |
| Spector.js | Comandos y recursos de un cuadro WebGL, draw calls y cambios de estado | Herramienta externa recomendada para una captura dirigida; no incluida permanentemente en el juego |
| Chrome remoto sobre Android | Perfil de la ejecución real en el teléfono | Script `scripts/profile_android.cjs`; requiere teléfono conectado, depuración autorizada y Chrome abierto |
| Perfetto | Planificación y frecuencia CPU, inactividad, procesos y eventos gráficos de Android | Configuración y script incluidos; aún sin ejecución sobre el teléfono del usuario |
| Android GPU Inspector | Contadores y detalles GPU en dispositivos compatibles | Condicional al hardware/controlador y a la validación de AGI; no se afirma compatibilidad con un teléfono desconocido |

Fuentes oficiales consultadas:

- https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/scene/optimize_your_scene.md
- https://developer.chrome.com/docs/devtools/remote-debugging
- https://developer.chrome.com/docs/devtools/performance/reference
- https://github.com/BabylonJS/Spector.js
- https://perfetto.dev/docs/getting-started/system-tracing
- https://developer.android.com/agi/supported-devices

## Medición desde el teléfono, sin PC

Construir y abrir `dist/Managua.html`. En los ajustes, **Diagnóstico de rendimiento → Medir 15 segundos**. Volver al juego, recorrer siempre el mismo tramo y después usar **Descargar informe**. El archivo `Nagua-rendimiento.json` contiene intervalos entre cuadros, P50/P95/P99, cuadros lentos y tiempos de etapas anidadas. El código no envía el informe a ningún servidor.

Registrar modelo, memoria del dispositivo, versión de Android/Chrome, calidad, resolución, temperatura aproximada del teléfono y si estaba cargando. Repetir parado, caminando, conduciendo y girando la cámara. Comparar tres vueltas por la misma ruta tras una de calentamiento. Mantener los ajustes iguales antes y después. Una medición corta no demuestra estabilidad térmica: verificar después varios minutos de conducción continua.

El diagnóstico no lee relojes por etapa cuando está apagado. Su almacenamiento está acotado a 3.600 muestras por serie; al agotarse el límite se detiene. Se interrumpe al ocultarse la pestaña. Los tiempos de funciones contienen subfunciones: **no se suman** para calcular un total. La captura añade coste y debe contrastarse con una pasada sin captura. Los últimos valores de consultas GPU pueden repetirse entre cuadros. El heap JS no equivale a toda la RAM del proceso.

## Perfil CPU de Android con PC

```sh
npm install --no-save --package-lock=false playwright@1.49.1
adb devices
adb forward tcp:9222 localabstract:chrome_devtools_remote
node scripts/profile_android.cjs
```

Debe haber exactamente una pestaña de Nagua City lista. El script conecta al puerto indicado, graba 15 segundos y guarda `dist/android/cpu.cpuprofile` y `dist/android/frames.json`. No lanza el navegador del teléfono ni decide por el usuario qué pestaña abrir. Los archivos permanecen locales.

Para una traza del sistema:

```sh
bash scripts/capture_android.sh
```

La configuración registra 20 segundos con un buffer de 32 MiB. Abrir `dist/android/nagua.perfetto-trace` en https://ui.perfetto.dev. No requiere root; las fuentes disponibles dependen de la versión del sistema y de los permisos del dispositivo.

## Banco de escritorio reproducible

```sh
git lfs pull
python3 scripts/build_performance.py
npm install --no-save --package-lock=false playwright@1.49.1
npx playwright install --with-deps chromium
node scripts/profile_browser.cjs
```

También se ejecuta en `.github/workflows/deep-profile.yml`. Conserva JSON, perfil CPU y captura. Usa Chrome 131, SwiftShader y ventana 480×270, con precarga de zonas cercanas, apertura/cierre de cuadro del motor, 12 pasos de calentamiento y 60 pasos de simulación fija de 1/60 s. No es un benchmark de FPS del teléfono: la GPU es software, el tiempo GPU puede quedar fuera de la llamada CPU y los pasos se solicitan manualmente. Los temporizadores de diagnóstico y el muestreador también añaden coste. Sirve para localizar y comparar trabajo, no para extrapolar FPS Android.

El primer intento del banco falló porque los parámetros de `waitForFunction` estaban en el argumento incorrecto; se corrigió el script. No se usa ese intento como medición del juego.

## Criterios para aceptar correcciones

1. Localizar una función o una secuencia de comandos con coste medido.
2. Separar el coste de CPU, GPU, carga y presión de memoria.
3. Cambiar un mecanismo concreto, conservando recursos y calidad salvo decisión explícita.
4. Comparar comportamiento, geometrías, poses, colisiones y conjuntos visibles según el cambio.
5. Repetir la medición; documentar incertidumbre y regresiones.
6. Confirmar en Android antes de declarar el objetivo cumplido.

## Primer hallazgo del perfil completo

El informe `initial-deep-profile.json` corresponde al commit de herramientas anterior a las correcciones 09–11, ejecución https://github.com/kankwj5-eng/Nagua-City/actions/runs/38691427632. Hubo 60 pasos, 45 vehículos, 62 peatones y cero errores JS capturados. Se observaron 7.810 mallas residentes y 704 materiales. En el muestreo predominan llamadas WebGL (`getUniformBlockIndex`, `uniformMatrix4fv` y `getProgramParameter`), incluyendo preparación de programas y esperas del controlador. El trabajo de peatones acumuló 141,7 ms y el de vehículos 145,5 ms; `scene.render` acumuló 60.244,7 ms. Son tiempos anidados instrumentados en SwiftShader; no se extrapolan al teléfono.

Ese primer ensayo todavía no abría/cerraba explícitamente cada cuadro del motor ni precargaba todas las zonas cercanas antes de la ventana. Sus contadores y pausas de shaders no se usan como comparación numérica directa contra el banco corregido. La comparación posterior vuelve a construir el bloque 08 y ejecuta ambas versiones con el mismo banco. Se conservan los datos iniciales como evidencia del diagnóstico, sin presentarlos como un resultado de FPS.

## Comparación de bloques 09–11 con referencia reconstruida

Ejecución: https://github.com/kankwj5-eng/Nagua-City/actions/runs/38692608201. Informes completos: `block11-before-browser.json` y `block11-after-browser.json`. Ambas versiones pasaron arranque, entrada y 60 pasos, con 27 zonas, 45 vehículos, 62 peatones y cero errores JS. El diagnóstico de la versión nueva capturó sus etapas y restauró correctamente la instrumentación.

| Dato en ese recorrido | Referencia 08 | Bloques 09–11 |
| --- | ---: | ---: |
| Mallas residentes | 7.833 | 7.205 |
| Mallas activas al finalizar | 466 | 466 |
| Draw calls de la última lectura del HUD | 833 | 828 |
| Tiempo acumulado dentro de `scene.render`, 60 pasos | 46.232,1 ms | 46.385,9 ms |

La reducción de mallas residentes no produjo una mejora demostrable del tiempo total de render en ese ensayo. Las llamadas WebGL y las pausas de preparación/espera del controlador de SwiftShader siguen dominando. Las lecturas finales del HUD son instantáneas, no medias; no se presenta la diferencia de cinco draw calls como ganancia general. Los buffers idénticos compartidos después de agrupar carrocerías sumaron 5.881.192 bytes, frente a 6.444.424 antes: el agrupamiento intercambia parte de la deduplicación entre plantillas por menos objetos de dibujo. Los datos de heap del HUD están cuantizados y no permiten certificar un ahorro total de RAM.

Esta evidencia motivó el bloque 12 para aislar el coste CPU de evaluación de miles de candidatos. La prioridad pendiente en el dispositivo real es medir el trabajo GPU, materiales/sombras y las pausas del controlador, sin atribuirlas automáticamente a la simulación de personajes. No hay una nueva cifra de FPS Android verificada.

## Resultado acumulado hasta el bloque 12

Ejecución verificada: https://github.com/kankwj5-eng/Nagua-City/actions/runs/38693566280. Informes: `block12-before-browser.json` y `block12-after-browser.json`. Ambas versiones arrancaron, permitieron entrar y ejecutaron 60 pasos sin errores JS. La nueva volvió a capturar y restaurar correctamente los contadores de diagnóstico. Las doce pruebas de regresión también pasan en GitHub Actions.

En la escena optimizada, alternando 120 evaluaciones nativas y 120 filtradas sin dibujar de nuevo ni modificar las poses entre lotes, la mediana CPU de evaluación pasó de 3,4 a 2,3 ms. Las medias fueron 4,45 y 2,25 ms. El conjunto activo coincidió en todas las comprobaciones. La referencia, cuyo proveedor no se filtraba, también mostró variación entre lotes equivalentes; por eso se conservan todas las muestras y no se interpreta una ejecución como certificación de una mejora universal.

El tiempo acumulado dentro de `scene.render` para 60 pasos fue 30.776,7 ms en la referencia y 29.730,5 ms en la nueva versión. Incluye fuertes esperas y preparación de shaders/controlador en SwiftShader; una sola comparación no separa esa variación del efecto de las optimizaciones. No se convierte esta diferencia en un aumento porcentual de FPS ni en una predicción para Android.

La entrega final conserva 45 vehículos, 62 peatones, las zonas de la prueba y los 16 bloques originales de recursos. **Los 60 FPS estables en el teléfono siguen pendientes.** Para la siguiente decisión hacen falta el modelo del teléfono, sus ajustes y `Nagua-rendimiento.json` grabado durante el recorrido donde se observan los 10 FPS. La captura GPU remota/Perfetto permitirá distinguir límite gráfico, CPU, compilación, presión de memoria o reducción de frecuencia durante sesiones largas.
