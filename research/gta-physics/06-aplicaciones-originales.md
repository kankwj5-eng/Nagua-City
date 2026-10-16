# 06 · Aplicaciones originales: seguimiento de la investigación

**La rama de investigación se conserva por separado.** Las adaptaciones se implementan y prueban en ramas propias de Nagua City, nunca copiando archivos ni datos de GTA.

## Primera tanda (octubre de 2026)

| Bloque | PR | Aprendizaje general | Adaptación propia | Estado al documentarlo |
|---|---|---|---|---|
| NPC 10 | [#26](https://github.com/kankwj5-eng/Nagua-City/pull/26) | Anticipación de tráfico en lugar de reacción tardía | Predicción analítica de contacto para vehículo casi paralelo al peatón | Integrado tras pruebas |
| NPC 11 | [#27](https://github.com/kankwj5-eng/Nagua-City/pull/27) | Transiciones de animación y movimiento coherentes | Frenada progresiva en cruce respetando el LOD propio | Integrado tras pruebas |
| Motos 12 | [#28](https://github.com/kankwj5-eng/Nagua-City/pull/28) | Contacto entre ambos ejes y progresividad de la suspensión | Filtrado de la inclinación que **ya se calculaba con ambos contactos**, sin consultas extras | Integrado tras pruebas |
| Piloto 9 | [#25](https://github.com/kankwj5-eng/Nagua-City/pull/25) | Repetibilidad de la pose al montar | Regresión de dedos del conductor, sin cambios de rig | Test integrado |

## Hallazgo importante para prevenir errores

La revisión profunda de `game/src/engine/0370-tick.js` mostró que la versión actual de Nagua **ya consulta dos puntos del suelo (frontal y trasero)** y calcula `atan2(frontY-rearY,wheelbase)`. El primer prototipo del bloque 12 iba a duplicar esas consultas y sumar dos veces el ángulo a la carrocería. **Fue descartado sin entrar a `main`.**

La solución seleccionada aprovecha las alturas ya calculadas para suavizar la pendiente, conservando todas las acciones de la física real. Este ejemplo muestra por qué primero se audita nuestro código y después se decide qué adaptar.

## Pendientes importantes (sin prometer integración automática)

1. **Adherencia por superficie:** identificar un tipo de superficie físico fiable en cada punto de contacto antes de añadir parámetros de barro, tierra, césped y asfalto. La clasificación basada solo en la apariencia del material es insuficiente para hacerlo bien.
2. **Suspensión física auténtica:** probar separadamente fuerzas de resorte/amortiguación por eje y contacto con bordillos. No confundir el filtro visual del bloque 12 con fuerza de contacto física.
3. **Objetivos de NPC:** definir actividades originales de Managua (compras, esperas, visitas, paseos) y preparar un evaluador barato por distancia; benchmark obligatorio antes de densificar.
4. **IK anatómico:** medir ángulos, alcance, estabilidad de las manos sobre el manillar y transiciones antes de añadir límites que puedan romper el rig actual.
5. **Tráfico por rutas:** comprobar sobre las calles reales el margen de frenada, predicción de peatones y fluidez de giros.
6. **GTA III vs Vice City:** falta la comparación extensa entre ambos repositorios; no afirmar que tengamos un análisis exhaustivo.

La orden del propietario fue aplicar lo aprendido al videojuego. Esa autorización se ejecuta **por etapas validadas y implementaciones propias**, no autoriza a pegar un motor ajeno ni a saltarse seguridad, rendimiento o licencias.


## Cierre de primera tanda

- [#26](https://github.com/kankwj5-eng/Nagua-City/pull/26): fusionado, prueba de cruces y verificación de navegador superadas.
- [#27](https://github.com/kankwj5-eng/Nagua-City/pull/27): fusionado, prueba de desaceleración real de NPC y verificación de navegador superadas.
- [#28](https://github.com/kankwj5-eng/Nagua-City/pull/28): fusionado, prueba del `tick` real sin consultas adicionales y verificación de conducción/rig superadas.
- [#25](https://github.com/kankwj5-eng/Nagua-City/pull/25): prueba de repetición de dedos/piloto integrada.
- **No se copiaron implementaciones ni recursos del proyecto GTA.** Estas mejoras se diseñaron para el funcionamiento y restricciones de Nagua City.
- **No medido todavía:** variación de FPS en el Android real y conducción subjetiva de la moto en calles con desnivel. Las pruebas numéricas y de navegador no sustituyen esas mediciones.
