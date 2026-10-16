# Laboratorio independiente · GTA III / Vice City → estudio para Nagua City

**Estado:** INVESTIGACIÓN EXCLUSIVAMENTE. **No aprobado para integrar.**  
**Inicio:** 15 de octubre de 2026.  
**Rama aislada:** `research/gta3-vicecity-physics-lab` (no es `main`).  
**Referencia de Nagua City:** `dfc51bb3cbc394f04151979a9fee69ecb1cc589f`.

## Propósito

Estudiar cómo se resolvieron la física de vehículos, las motos, los NPC, el movimiento humano, los contactos con el entorno y las animaciones en implementaciones de ingeniería inversa de GTA III / Vice City. Después contrastar **comportamientos y principios**, no copiar sus implementaciones, con el motor actual de Nagua City (JavaScript/Babylon.js en Android).

## Frontera inviolable

- Este laboratorio vive **solo en su propia rama** y dentro de `research/gta-physics/`.
- No se toca `game/`, `physics/`, `performance/`, `web/`, `scripts/`, ni los workflows de publicación. Ningún archivo de motor, asset o modelo queda sustituido.
- No se crea Pull Request para fusionarlo a `main`, y no se fusiona nada sin autorización **expresa del propietario**, evaluación técnica y pruebas específicas.
- No traer código, modelos, texturas, audio, tablas completas ni assets de GTA; no asumir derechos de redistribución de proyectos de ingeniería inversa. Los enlaces son referencias, no dependencias.
- Este trabajo **no prueba** que GTA sea un mejor motor para nuestra plataforma: Vice City era otro juego, otra arquitectura, plataforma y presupuesto de rendimiento.
- Se documentan hallazgos y dudas; ninguna hipótesis se presenta como defecto demostrado sin reproducirlo en Nagua City.

## Organización

| Archivo | Función |
|---|---|
| [01-fuentes-y-metodo.md](01-fuentes-y-metodo.md) | Fuentes originales verificadas, versiones, cautelas legales y método |
| [02-motos-y-vehiculos.md](02-motos-y-vehiculos.md) | Frenado, tracción, suspensión, inclinación, estabilidad y conducción |
| [03-peatones-y-trafico.md](03-peatones-y-trafico.md) | Decisiones NPC, rutas, evasión, tráfico, distancias de seguridad |
| [04-personaje-y-animaciones.md](04-personaje-y-animaciones.md) | IK, límites anatómicos, agarre, animación y entrada/salida de moto |
| [05-matriz-y-experimentos.md](05-matriz-y-experimentos.md) | Comparación, hipótesis, experimentos y criterios de decisión |
| [REGISTRO.md](REGISTRO.md) | Fechas, resultados, cuestiones abiertas y límites de avance |

## Resultado de la primera inspección

1. **Motos:** reVC contempla contactos/suspensión, superficies, fuerzas de rotación, inclinación y estados de ruedas. Nagua City ya dispone de control por aceleración, agarre, inclinación y simulación de paso fijo, pero la integración de contacto por rueda merece estudiarse. No sería seguro reemplazar nuestro modelo por uno de C++.
2. **NPC:** reVC separa objetivos, rutas y conductas de evasión. Nuestro sistema de peatones contempla estados sencillos y evasión local; podría ganar riqueza de comportamiento y calidad de cruce mediante un diseño propio, después de perfilar Android.
3. **Personaje:** reVC limita progresivamente giros de articulaciones al mirar y apuntar. Nagua City ya tiene animaciones y un IK propio; merece estudiar restricciones anatómicas y **repetibilidad de la postura al montar** sin asumir que las cifras de GTA son idóneas.
4. **Tráfico:** hay separación entre control de rutas, detección de peatones y conducción física. En Nagua City conviene investigar aproximaciones híbridas y amortización por distancia, dado el rendimiento móvil.
5. **Compatibilidad:** ninguna idea se aprobará sin medir su coste en JS, memoria, física, FPS y percepción visual del usuario.

**Decisión vigente:** mantener todas las recomendaciones en estado `CANDIDATA`; **ninguna aprobada ni transferida al juego**.
