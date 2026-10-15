# Física y conducción de vehículos

Revisión sobre `c43e1f1396bb5fa80431fcf105c488bed00176ba`. La construcción aplica `scripts/build_handling.py` después de los doce bloques de rendimiento. El archivo base de Git LFS se conserva; el juego resultante sigue siendo `dist/Managua.html` independiente. Los 16 bloques de recursos y los bytes externos a `appSource` se conservan íntegros.

## Fallos reproducidos y cambios

| Problema | Corrección | Comprobación |
| --- | --- | --- |
| Frenar a fondo en curva anulaba inmediatamente la velocidad de giro al agotar el presupuesto longitudinal de agarre | Se reserva la fuerza lateral del giro existente y se relaja progresivamente al frenar; se limita la aceleración longitudinal al presupuesto restante | Con el mismo sedán y estado inicial, giro de −0,67098 rad/s: antes pasa a 0 en un paso; ahora a −0,64048 rad/s |
| El umbral de parada podía añadir una desaceleración por encima del agarre | Solo se ajusta a cero cuando la desaceleración necesaria cabe en el presupuesto | Frenada hasta parada y presupuesto combinado nominal en los 24 perfiles |
| Moto con marcha atrás tan rápida como un carro | Retroceso de maniobra limitado a 1,2 m/s y fuerza de asistencia reducida | Retroceso sostenido, inversión tras detenerse y RPM de ralentí; también bicicleta |
| Doble tratamiento de la dirección/inclinación de motos; se multiplicaba repetidamente la inclinación ya suavizada a poca velocidad | Una sola zona muerta y curva de dirección; objetivo de inclinación dependiente de velocidad antes de suavizar | Simetría izquierda/derecha, transición desde baja velocidad y estados finitos |
| Carrocería de los carros se inclinaba hacia dentro del giro | Balanceo hacia fuera; se mantiene cabeceo amortiguado por aceleración y frenada | Signo del balanceo integrado y poses con Babylon |
| Ruedas rodaban al revés y las delanteras giraban con el mismo ángulo | Signo de rodadura corregido; geometría de Ackermann usando distancia entre ejes y separación real de pivotes | Rueda interior gira más; comprobación de signos en ambos sentidos |
| Ruedas del tráfico en curva se actualizaban antes de incrementar el giro | Se actualizan con el giro del paso actual y se restauran si la barrera de seguridad rechaza el avance | Integración del tráfico y restauración de giro |
| Tres círculos longitudinales dejaban esquinas y voladizos sin cobertura | Huella rectangular orientada con SAT frente a cajas y otros vehículos; contacto círculo/rectángulo para la rotonda | Esquina que escapaba al modelo anterior, 200 separaciones con rotación, contención y círculo |
| El tráfico avanzaba con un delta de render limitado a 0,1 s, diferente al del jugador | Tráfico, semáforos y gestión avanzan con el reloj fijo de 60 Hz, igual que la conducción | Integración en el bucle y reproducción de la dinámica a distintos ritmos de imagen |
| Se interpolaba la raíz del jugador, pero no ruedas, dirección y carrocería; el tráfico tampoco tenía interpolación de raíz | Instantáneas físicas anterior/actual y presentación interpolada; se restauran antes del siguiente paso. El piloto se coloca después de interpolar la moto | Motor Babylon integrado: punto intermedio, restauración exacta y rechazo de interpolación al teletransportar |

La huella usa ancho y largo de los modelos, consulta todas las celdas de 12 m que cruza su AABB y elimina obstáculos repetidos entre celdas. Se conserva el barrido en incrementos máximos de 0,16 m y la respuesta que retiene movimiento tangencial. El borde irregular del mapa se comprueba en centro, esquinas y puntos medios; no es un barrido continuo exacto de polígonos arbitrarios.

Las ruedas del jugador y del tráfico, la dirección y las rotaciones de carrocería se guardan sin crear nuevos vectores en cada paso después de inicializar cada vehículo. Las poses de vehículos estacionados no se interpolan ni se guardan. La interpolación añade hasta un paso de simulación de latencia visual, igual que la raíz del jugador antes del cambio. No crea imágenes adicionales cuando el dispositivo solo dibuja 10 FPS.

## Pruebas reproducibles

```sh
git lfs pull
python3 scripts/build_performance.py
node --max-old-space-size=768 tests/vehicle-handling.cjs
```

La prueba usa las dimensiones y los 24 perfiles reales del archivo base y el Babylon 9.29.0 integrado. Acelera, frena, invierte dirección, retrocede y gira en ambos sentidos. Comprueba límites, valores finitos y el presupuesto combinado nominal de aceleración y giro. Compara el fallo de frenada con el modelo anterior. A 10, 15, 30, 60, 90 y 120 imágenes/s, la misma secuencia produce exactamente el mismo estado tras 720 pasos de física. Esta reproducción a distintos ritmos comprueba dinámica aislada; no mide tiempos de render ni certifica el conjunto de la IA.

La prueba geométrica comprueba una pared de 5 cm con avance a 48 m/s y 60 pasos sin atravesarla, respuesta tangencial sin ganar energía, contacto en celdas cruzadas por vehículos largos y 200 separaciones orientadas. Las pruebas de presentación usan `NullEngine`, transformaciones reales, ruedas y carrocería, interpolación a mitad de paso, restauración de la pose física y reposicionamiento del tráfico sin arrastre visual.

Las 12 pruebas anteriores `tests/performance-block01.cjs` a `tests/performance-block12.cjs` también pasan. CI ejecuta las trece en `.github/workflows/performance-block01.yml`. Informe numérico: [handling-unit.json](handling-unit.json).

Para probar la integración con el juego completo:

```sh
npm install --no-save --package-lock=false playwright@1.49.1
npx playwright install --with-deps chromium
node scripts/test_driving_browser.cjs
```

El banco carga el HTML completo y conduce sedán, Pulsar, caponera y bus en una calle controlada; mueve la flota ajena fuera del recorrido para aislar la conducción. Comprueba entrada al vehículo, aceleración, giro a la derecha, frenada, pausa y retroceso, y captura sedán y moto. Utiliza pasos físicos manuales y cuadros de presentación reales con Chromium/SwiftShader a 640×360. El gancho de pruebas solo se inyecta en una copia temporal: no forma parte del HTML entregado. Workflow: `.github/workflows/vehicle-handling.yml`.

## Alcance y siguiente validación

Sigue siendo un modelo planar de conducción con agarre y suspensiones aproximados. No se ha incorporado un motor pesado ni se han presentado las cifras de ajuste de juego como calibración de un vehículo real. No simula neumáticos deformables, fuerzas verticales independientes por rueda, vuelco rígido ni transferencia de masas completa. Las pruebas numéricas detectan discontinuidades y errores; la sensación de mando requiere jugar en el dispositivo.

En Android, verificar con los controles táctiles: salida progresiva, soltar acelerador, frenar recto y en curva, eslalon suave, vuelta cerrada de aparcamiento, moto lenta, marcha atrás y roce lateral. Repetir con sedán, moto, caponera y bus. Registrar agarre percibido, velocidad, superficie, control usado y vídeo si aparece un tirón. Mantener el diagnóstico de [PERFILADO.md](PERFILADO.md) para medir tiempos reales; los 60 FPS estables siguen pendientes de validación en el teléfono.

Referencias de diseño: [paso fijo de Box2D](https://box2d.org/documentation/md_simulation.html) y [geometría de dirección y neumáticos de PhysX Vehicles](https://nvidia-omniverse.github.io/PhysX/physx/5.1.1/docs/Vehicles.html). No son dependencias del juego ni equivalen a afirmar que su modelo físico esté implementado aquí.
