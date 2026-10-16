# Registro del laboratorio

## 2026-10-15 — Inicio / fase exploratoria

**Fuente Vice City verificada:** `mrxenginner/reVC@a26fff4af555a8a425ac9f17d1dd718d00d1f942`.  
**Fuente GTA III verificada:** `hottabxp/re3@3233ffe1c4b99e8efb4c41c6794b4fce880cf503`.  
**Fuente alta tasa de fotogramas:** `Ogstra/reVC@5b339fbb60008c23c607a6b5ebec8c2e5ac67d23`.  
**Código Nagua contrastado:** `dfc51bb3cbc394f04151979a9fee69ecb1cc589f`.

### Acciones realizadas

- [x] Crear rama de investigación, sin unir a `main`.
- [x] Verificar existencia de C++ consultable: motocicleta, coche, entidad física, colisiones, peatones, IK, rutas y mezcla de animación.
- [x] Identificar contrapartidas existentes de JavaScript/Babylon.js en Nagua City.
- [x] Documentar una primera matriz de brechas, costes y pruebas; no alterar el motor.
- [x] Registrar cautelas legales y uso educativo de fuentes de ingeniería inversa.
- [ ] Comparar de forma exhaustiva GTA III frente a Vice City función por función.
- [ ] Medir conducción real y animaciones en un teléfono Android.
- [ ] Ejecutar experimentos independientes con imágenes y métricas equivalentes.
- [ ] Aprobar o rechazar candidatos tras los resultados, con consentimiento del propietario.

### Observaciones iniciales

**Comprobadas por inspección del código:** reVC tiene procesamiento propio para motos y suspensión, control de físicas por impulsos, límites IK y estados de objetivos de peatones. Nagua tiene agarre y conducción con paso fijo, rutas/candidatos peatonales, suspensión/cabeceo visual parcial y solución IK de brazos. Ambas familias resuelven algunos problemas en común mediante técnicas distintas.

**Hipótesis aún sin probar:** hay oportunidades de mejorar realismo de contacto, conducción por superficie y rig del conductor; no sabemos todavía cuánto ni si funcionarían mejor en Android.

**Pendiente de estudio detallado:** coherencia al subir/bajar de moto, soporte en dos ruedas, límites de codo, NPC bloqueado en acera, cambio de nivel de simulación por distancia.

### Restricciones de promoción

Ningún archivo de `game/` o `physics/` de Nagua ha sido modificado en este trabajo. Ninguna fuente `.cpp` ajena se ha copiado. **No hay Pull Request de merge** ni recomendación aprobada para integración. La investigación se conserva en esta rama como referencia independiente.
