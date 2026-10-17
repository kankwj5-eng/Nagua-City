# Limpieza de elenco y flota anteriores (borrador aislado)

**Requisito:** sustituir completamente los modelos viejos de personas, coches,
camionetas, motocicletas, sus materiales y clips, sin dejar referencias en el
código y sin eliminar físicamente calles, puentes, edificios u otros elementos.

## Etapa actual: extracción reversible de los recursos antiguos

`scripts/clean_legacy_media.py` recibe una compilación **modular** y guarda
una **copia NO JUGABLE** de transición. Quita bloques `asset-humans`,
`pack48-humans`, `resource48-humans-*`, `asset-vehicles`,
`asset-animation38`, `asset-actor-motion` y los bloques `resource48-vehicles-*`.
Conserva explícitamente los bloques de `world`, `extensions`,
`surfaces`, `materials42` y Babylon.js.

```bash
python3 scripts/build_modular.py --output dist/Managua-portable.html
python3 scripts/clean_legacy_media.py \
  --input dist/Managua-portable.html \
  --output dist/clean-stage/Managua-sin-elenco-flota.html \
  --staging-only
```

El JSON de resultados muestra SHA256 del original y la copia, los bytes
eliminados y cada ID de recurso retirado. **Nunca ejecutar esta salida como
juego ni desplegarla en GitHub Pages.** El código modular todavía referencia
los elementos viejos hasta que se reemplace el runtime.

## Condiciones obligatorias para finalizar el reemplazo

1. Incorporar los diez GLB principales (Mateo + 9 NPC; cero LOD1).
2. Recibir y analizar todos los coches/motos nuevos; comprobar formato,
   jerarquía, animaciones y texturas.
3. Rehacer instanciación, locomoción, conducción, combate, cámaras, tráfico,
   IA y entrada al juego sobre los modelos nuevos, conservando física genérica.
4. Eliminar funciones específicas, paquetes, catálogos, referencias del
   manifiesto y animaciones antiguas, **no mantenerlas escondidas**.
5. Ejecutar `python3 scripts/audit_cast_v4.py --strict` después del corte,
   pruebas de navegador y rendimiento Android.
6. Solo fusionar y publicar si el juego completo supera regresiones.

Los modelos nuevos de **vehículos aún no se han entregado**. Hasta entonces
se preserva `main` jugable y PR #54 continúa en borrador.
