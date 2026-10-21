# Granada - revision V8

Proyecto Blender 4.2.3. Los renders proceden de esta escena 3D, sin retoques generativos. La referencia muestra Granada, Nicaragua. El proyecto representa el entorno de la catedral y La Calzada, no toda la ciudad.

Esta revision corrige la elevacion arbitraria de la cupula de V7: reduce la altura de la nave, conserva la fachada occidental, ajusta las naves laterales por separado y crea un basamento continuo entre la cubierta y el tambor. Se adosan los marcos laterales al muro y se reduce el retranqueo del vidrio a 15 cm. Se ensancha ligeramente el conjunto central y se da mas cuerpo a su linterna. La fachada posterior tiene ventanas redondas mas cortas, friso con oculos, fronton central curvo y cierres de las bovedas laterales. Son estimaciones visuales, sin levantamiento arquitectonico; persisten diferencias con el edificio real.

Los materiales conservan el grano y microrelieve previos y suman suciedad irregular en las tejas, depositos en canales concavos, manchas minerales, salpicaduras en zocalos y acumulacion bajo cornisas y aleros. El suelo recibe manchas discontinuas, sedimento junto a bordillos y fisuras finas; se anaden desconchados a la pintura del bordillo. La suciedad es procedural y geometrica, no procede de un escaneo del lugar.

## Uso e integracion

Abrir Granada_Video.blend para editar. No volver a ejecutar los scripts de modificacion sobre esta version: las transformaciones son acumulativas. Checkpoint_V7.blend, si existe localmente, es solo una copia de trabajo y no forma parte de la entrega.

La coleccion oculta 28 COLISIONES RECORRIDO PRINCIPAL contiene 266 proxies basicos. Colisiones_Granada.glb exporta solo esos proxies, actualizados para la altura de las naves; no es la version visual del escenario. Los extras role, source_object y collision_shape sirven al integrador para configurar cuerpos estaticos. El archivo no activa fisica automaticamente.

Continuan pendientes el horneado de materiales para el motor, exportacion visual, LOD, particion por zonas y pruebas de memoria, FPS y recorrido en el juego. Las colisiones no cubren todos los detalles de la nueva fachada. El control anterior del suelo por 479 rayos no equivale a una prueba dentro del motor.

## Reproduccion

Sobre un checkpoint V7 limpio: corregir_v8.py, despues alzado_v8.py y despues render_v8.py y cerrar_y_render_v8.py y remates_ventanas_v8.py y actualizar_dos_vistas_v8.py, abriendo el archivo guardado entre etapas. Estos scripts modifican materiales y geometria; render_v8.py tambien agrega sombreado de acumulacion bajo aleros. No ejecutarlos de nuevo sobre V8. Los scripts historicos incluidos documentan etapas previas.
