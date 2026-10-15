# Recuperación visual: personaje, terrenos y motos

## Evidencia inicial (capturas Android, 15 de octubre de 2026)

- Personaje: pose con carabina visualmente deformada, hombros/brazos mal alineados; la postura sobre moto requiere verificación.
- Materiales: el asfalto tiene detalle fino, pero el césped y la tierra presentan manchas borrosas y apariencia plástica.
- Vegetación: cobertura irregular y árboles escasos.
- FPS observados: 8, 9 y 11; tiempo JS 85–107 ms; memoria JS aproximada 803 MB. Son lecturas de esas capturas, no un benchmark estable.

## Prioridad y disciplina de cambios

1. **Personaje:** comprobar muestreo de animaciones y composición de quaterniones en `updateEquipmentPose`, `installCombatPose29`, `riderPose`, `humanRide`, `hero46`; no alterar la malla skinned ni su bind pose a ciegas. Fotografiar reposo, marcha, carabina, motocicleta y transiciones.
2. **Césped y tierra:** localizar superficies/materiales efectivos (no solo los nombres de las funciones). Revisar UV, filtros anisotrópicos, albedo, normal, roughness, repetición y distancia de cámara. Mantener la misma geometría en la primera comparación.
3. **Vegetación:** diversificar especies y distribución en áreas naturales, evitando cruces con calles y aceras. Usar instancias y distancia de detalle; comparar draw calls y frame time.
4. **Moto:** revisar centro de masa, inclinación, dirección, frenos, tracción, pose del piloto y contactos, con pruebas de velocidades baja/media y giro cerrado.
5. **Rendimiento:** medir CPU JS, GPU, draw calls y RAM en Android antes y después de cada cambio; nunca añadir densidad visual sin presupuesto.

## Condiciones de aceptación

- Corregir defectos visibles con capturas comparables, sin cambios de identidad del personaje ni nuevas deformaciones.
- No aumentar el tiempo JS por fotograma ni el consumo de RAM de forma significativa en el mismo recorrido de prueba.
- Probar menú, entrada, personaje a pie, arma, moto, conducción, pausa y regreso al menú.
- Toda modificación se desarrolla en rama y PR; no publicar en `main` hasta que las pruebas automáticas y una inspección visual permitan aceptar el cambio.
- Los problemas que requieren una prueba en el Android del usuario se registran como pendientes, no se anuncian como resueltos.

## Mapa técnico inicial

| Subsistema | Archivos relevantes |
|---|---|
| Protagonista | `game/src/characters/0437-hero46.js`, `0303-reset-pose.js`, `0299-walk-pose.js` |
| Arma | `game/src/characters/0331-update-equipment-pose.js`, `0182-install-combat-pose29.js`, `0216-firearm31.js` |
| Moto | `game/src/vehicles/0302-rider-pose.js`, `0440-bike46.js` |
| Césped | `game/src/core/0202-grass-patch31.js`, `game/src/rendering/0205-pbr-shared-grass31.js` |
| Tierra | `game/src/engine/0247-prepare-soil35.js`, `game/src/world/0417-ground43.js` |
| Materiales | `game/src/rendering/0441-materials46.js`, `game/src/rendering/0236-install-materials34.js` |
| Árboles | `game/src/world/0400-tree-source42.js`, `game/src/rendering/0399-leaf-material42.js` |

**Nota:** la primera fase es diagnóstico técnico y pruebas de protección; no implica que el defecto gráfico esté corregido.
