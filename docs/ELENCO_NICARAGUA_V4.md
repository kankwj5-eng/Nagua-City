> **Actualización (20 de octubre de 2026).** El texto siguiente documenta una fase anterior de preparación. Posteriormente se incorporaron al repositorio los **16 GLB** definitivos en `game/assets-v4/`. La integración del elenco y los vehículos ya existe en el juego modular. Para los detalles y pruebas actuales, consultar [ESTADO_MODELOS_V4.md](ESTADO_MODELOS_V4.md).

# Elenco Nicaragua v4 — preparación segura

**Solo diez modelos principales:** Mateo (protagonista) y Ernesto, Daniel, Luis,
Rafael, Valeria, Marisol, Xiomara, Rosa y Elena (nueve NPC). Los GLB
`_LOD1` NO se copian, cargan ni cuentan como personajes.

El ZIP original, proporcionado por el autor, **no se publica dentro del repositorio**.
Los recursos externos permanecen bajo licencia CC0; revisar `LICENSE.txt`
del paquete para las atribuciones/código MIT.

Para preparar una copia local del proyecto:

```bash
python3 scripts/import_cast_v4.py /ruta/Personajes-Nicaragua-10-modelos.zip
python3 -m unittest discover -s tests -p 'test_cast_v4.py' -v
```

Esto prepara diez archivos en `game/assets/characters-v4/` y escribe
`cast.json`. Valida la estructura GLB, 79 huesos de Mateo, 52 por NPC,
37 y 12 clips respectivamente, y el listado requerido de acciones. Falla
antes de escribir recursos si hay archivos ausentes, corruptos o sustituciones
incompatibles. No borra ni reescribe modelos antiguos.

**Pendiente antes de activar en el juego**: transferir los diez GLB principales
al repositorio/almacenamiento web; integrar un adaptador Babylon.js que use el
nuevo rig (nombres de huesos, clips y animación); ajustar conducción,
puñetazos, accesorios y escenas narrativas; excluir después los recursos
antiguos de la descarga inicial; comprobar arranque Android, movimiento y
regresiones. No habilitar esta fase hasta que esas pruebas pasen.

La rama de preparación no modifica el arranque, el mapa, los vehículos, los
sistemas de animación vigentes ni la publicación de GitHub Pages.
