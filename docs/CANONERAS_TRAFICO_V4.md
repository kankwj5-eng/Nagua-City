# Nuevas caponeras y tráfico V4 (sin parque antiguo)

El usuario entregó dos modelos glTF nuevos: `01-Mototaxi-roja.glb`
(mototaxi roja cerrada, bandera animada) y `02-Canonera-abierta.glb`
(caponera abierta con toldo azul). Ambos contienen tres ruedas independientes,
clips `Rodar_*`, `Direccion_Derecha`, `Direccion_Izquierda` y
`Rodar_y_Doblar` de demostración.

- **Modelos únicos:** Mateo y nueve NPC (**10 GLB**) y seis vehículos (**6 GLB**):
  Hilux grafito, Land Cruiser roja, Pulsar NS200, Taypan 150 y las dos caponeras.
- **Tráfico:** seis instancias adicionales de los seis GLB, con movimiento
  por carriles delimitados, reacción a obstáculos/peatones/otros vehículos y
  animación de ruedas y dirección. No se cargan vehículos antiguos.
- **Personajes:** nueve NPC a pie, conservando `Idle`/`Walk` originales.
- **Clonación:** Babylon añade prefijos a los nombres de animaciones. El puente
  elimina dichos prefijos de las claves del mapa de clips; antes de instanciar
  se desvinculan temporalmente los roots del contenedor para preservar la
  jerarquía. Probado con **los seis GLB reales** en Babylon.js 9.29.0 NullEngine.
- **Entrega:** HTML autónomo basado en el juego con 119 sectores y
  colisiones originales, empaquetado por separado para el usuario.
  Binarios no incluidos en este PR: el código espera el ZIP suministrado al
  ensamblar el HTML local.

## Pruebas
`node tests/traffic-canoneras-v4.cjs` prueba 6 tipos de vehículo y sus
animaciones sin depender de medios antiguos.

**Pendiente:** el HTML V4 actual usa el mapa original y física de
conducción reutilizada, pero todavía no reemplaza todas las misiones,
tráfico avanzado, tiendas, audio y los 466 módulos antiguos de
`main`. Mantener PR #54 en borrador y no publicar esta integración
experimental antes de validación Android y migración completa.
