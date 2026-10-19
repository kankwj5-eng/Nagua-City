# Vehículos v4: solamente cuatro modelos finales

Recibidos el 18 de octubre de 2026: `Hilux-grafito.glb`, `Land-Cruiser-roja.glb`,
`Pulsar-NS200.glb`, `Serpento-Taypan-150.glb`.

Se ha inspeccionado el ZIP REAL: dos camionetas y dos motos; cada modelo
contiene materiales, geometría, pivotes de ruedas y animaciones propias.

Los clips de rodadura son independientes de los de dirección. Los clips
`Direccion_Izquierda` y `Direccion_Derecha` describen
**centro → giro máximo → centro**; mantener el giro en el punto medio
del clip hasta que el jugador enderece el vehículo.

El frente de los GLB es **-X** y el del motor es **-Z**:
el visual debe rotar **-90 grados sobre Y**. Esto no altera la física.

## Preparación (sin modelos ni flota anterior)
```bash
python3 scripts/import_vehicles_v4.py /ruta/Vehiculos-4-finales-con-giros.zip --output game/assets/vehicles-v4
node tests/vehicle-v4-runtime.cjs
```

El importador rechaza otras variantes, animaciones ausentes, ruedas no
independientes y colores de pintura incorrectos. Emite
`game/assets/vehicles-v4/vehicles-v4.json` con huellas SHA256.

El cargador `game/vehicles-v4/vehicle-runtime.js` usa Babylon.js y
reproduce en el propio GLB los clips de dirección y rodadura, con soporte
para marcha atrás. Conserva pivotes separados de manubrio/ruedas de motos.

**Estado:** adaptador nuevo probado de forma aislada. Los cuatro binarios GLB
se mantienen en el ZIP entregado y todavía **no se han subido al repositorio**.
El código del juego antiguo todavía ejecuta su flota; no fusionar como
integración definitiva ni desplegar hasta eliminarla y probar lo nuevo.

A continuación se requiere conectar este motor y el de 10 personajes a
un arranque SIN los medios obsoletos, el tráfico y el sistema de cámara y
física conservados. Ejecutar auditorías estrictas antes de fusionar.
