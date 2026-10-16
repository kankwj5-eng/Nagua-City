# 05 · Matriz de comparación y decisiones

## Estado de aprobación

Todas las filas tienen estado **SOLO INVESTIGACIÓN**. Ninguna constituye permiso para modificar `main`.

| Candidato de diseño propio | Por qué estudiar | Prioridad de investigación | Riesgo de integración | Decisión actual |
|---|---|---|---|---|
| IK anatómico con límites y repetibilidad | Capturas muestran brazos/manos extraños | Alta | Medio | Investigar, no integrar |
| Manillar acoplado a manos sin deriva | Moto y conductor se ven rígidos | Alta | Medio | Investigar, no integrar |
| Tracción según superficie | Diferencias entre asfalto, césped y tierra | Alta | Medio | Investigar, no integrar |
| Apoyo por rueda delantera/trasera | Moto sobre bordes y resaltos | Alta | Alto CPU/colisión | Simular fuera del juego |
| Objetivos sencillos para NPC | Que la ciudad tenga vida | Media | Medio CPU | Prototipo conceptual |
| Cruce anticipado por ETA | Seguridad y fluidez peatonal | Media | Medio | Medir sistema existente primero |
| Suspensión basada en impulsos completa | Sensación de peso en motos | Baja por ahora | Alto, integración grande | Posponer |
| Sustituir todo el motor por reVC | Arquitecturas, licencias y plataformas distintas | No recomendada | Muy alto | Descartado como enfoque |

## Criterios para autorizar un futuro experimento de Nagua

1. **Problema reproducido** en dispositivo Android o captura/registro fiable.
2. **Hipótesis explícita** y comparación con comportamiento ya disponible en Nagua (no inventar carencias).
3. **Implementación original** del principio, nunca copia/traducción de fragmentos protegidos.
4. **Aislamiento de prueba:** primero experimento dentro de esta rama o una nueva rama de prueba; jamás modificar directamente `main`.
5. **No regresión:** menú, ciudad, caminar, apuntar, moto, conducción, NPC y física pasan.
6. **Mismo teléfono / misma escena:** registrar FPS medianos y p95 de tiempo de fotograma, tiempo JS y memoria antes/después. Distinguir CPU de GPU.
7. **Presupuesto móvil:** no aceptar cambios visuales caros si empeoran un teléfono que hoy reporta 8–11 FPS, salvo negociación explícita de calidad/perfil.
8. **Autorización:** revisar resultados con el propietario. Ningún merge de esta investigación se realiza sin su decisión.

## Tabla de comparación que completaremos con mediciones

| Maniobra | Nagua actual | Referencia técnica reVC | Métrica | Resultado |
|---|---|---|---|---|
| Moto 10 km/h, giro medio | Modelo de yaw + lean con grip | Balance y contacto específicos de moto | Radio de giro, caída, contacto | SIN MEDIR |
| Moto frenando en curva | Presupuesto longitudinal/lateral | Estado de ruedas y suspensión | Pico de yaw y aceleración | SIN MEDIR |
| Tierra / asfalto | Material gráfico PBR; efecto físico por confirmar | Contactos y adhesión por superficie | Distancia frenado / deslizamiento | SIN MEDIR |
| Moto sobre bordillo | Consultas de mundo y pose de vehículo | Suspensión sobre contactos | Penetración / cabeceo | SIN MEDIR |
| Peatón ante coche girando | ETA local y estados sencillos | Frenado preventivo + rutas | Colisiones / tiempo de espera | SIN MEDIR |
| Peatón ante obstáculo | 5 giros + espacialización | Rutas y objetivos | Atascos a 3 s | SIN MEDIR |
| Apuntar con rifle | Capas de pose + IK | Límites de articulación y seguimiento | Giro codo / distancia mano | SIN MEDIR |
| Montar moto 20 veces | `humanRide` + IK del manillar | Transiciones animadas y estados | Deriva de dedos / muñeca | SIN MEDIR |

## Qué hacemos primero si autorizas las pruebas

1. **Repetibilidad de manos, dedos y casco** durante 20 montajes. Es especialmente urgente por las capturas; los datos pueden revelar un error concreto sin reescribir la física.
2. **Contactos de moto y suelo**, comprobando primero los datos disponibles del juego.
3. **Conducción en asfalto vs tierra**, con pruebas numéricas de frenado y curva, sin materiales gráficos adicionales.
4. **Peatones y rutas**, comprobando si el algoritmo actual alcanza un resultado suficiente antes de ampliar estados.
5. **Medición en Android**, indispensable para decidir.

## Registro de decisiones

- `2026-10-15`: **separar investigación del producto**.
- `2026-10-15`: **no copiar fuentes reVC/re3 ni añadir dependencias**.
- `2026-10-15`: preferir hipótesis comprobables y pasos pequeños a un trasplante completo de física.
- **Decisión final de integración: PENDIENTE DE USUARIO**.
