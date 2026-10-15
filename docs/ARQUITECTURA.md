# Arquitectura del código de Nagua City

## Objetivo y resultado

El videojuego empezó como un HTML autónomo de aproximadamente 187 MB: el código estaba incrustado en `<script id="appSource" type="text/plain">` junto a los recursos del mundo. El resultado era difícil de mantener. La migración **separa el código fuente sin transformar su semántica ni cambiar el archivo original Git LFS**.

En esta fase se extrajeron **466 fragmentos JavaScript en orden original** (incluyen **366 declaraciones de función** del núcleo principal, además de variables, clases, sentencias de inicialización y envolturas) y **10 bloques de CSS**, basándose en el árbol sintáctico de JavaScript. El código ensamblado es idéntico byte por byte al generado por el constructor anterior en el momento de la migración.

Los fragmentos están separados por sentencia de nivel superior dentro del motor original. Las funciones anidadas permanecen con la función a la que pertenecen, porque extraerlas alterando su cierre léxico podría romper el juego.

## Organización

```text
Nagua-City/
├── game/
│   ├── manifest.json                 # Orden exacto de ensamblado y hashes
│   ├── src/
│   │   ├── bootstrap/                # Envoltura y código de arranque
│   │   ├── state/                    # Estado global y modelos de estado
│   │   ├── core/                     # Funciones transversales
│   │   ├── engine/                   # Inicialización y bucle del juego
│   │   ├── world/                    # Ciudad, zonas, calles y mundo
│   │   ├── vehicles/                 # Conducción, tráfico y garaje
│   │   ├── characters/               # Personajes, peatones y animaciones
│   │   ├── rendering/                # Materiales, cámaras y gráficos
│   │   ├── interface/                # Controles, menús y HUD
│   │   ├── audio/                    # Sonido
│   │   ├── diagnostics/              # Instrumentación
│   │   └── data/                     # Catálogos y datos JS grandes
│   └── styles/                       # 10 hojas extraídas del HTML
├── physics/                          # Fuentes heredadas del constructor
├── performance/                      # Parches heredados del constructor
├── presentation/                     # Menú original, CSS y arte gráfico
├── web/                              # Portada PWA, manifest y service worker
├── scripts/
│   ├── build_performance.py          # Genera la referencia optimizada
│   ├── build_modular.py              # Ensambla las fuentes editables
│   ├── build_pwa.py                  # Prepara instalación web
│   └── extract_modules.cjs           # Extractor de migración; no ejecutar normalmente
├── tests/
└── Managua_Del_taller_al_lago(1).html # Original intocable en Git LFS
```

## Qué se edita a partir de ahora

- **Para corregir una función del juego:** buscarla por nombre dentro de `game/src/` y editar únicamente su archivo. Cada archivo lleva un número para preservar el orden original, y un nombre descriptivo.
- **Para diseño CSS del juego:** editar `game/styles/`. Los bloques conservan las posiciones exactas que tenían dentro del HTML. El CSS del menú ilustrado sigue también en `presentation/menu.css`.
- **Para cambiar la portada instalable:** editar `web/`, sin tocar el motor.
- **Para cambiar la imagen original del menú:** revisar primero la referencia y sus pruebas; no sustituir el arte aportado por el usuario.
- **Para añadir funciones nuevas:** incorporarlas dentro del fragmento de su subsistema o crear un fragmento adicional y actualizar el orden en `game/manifest.json` en el mismo cambio, añadiendo pruebas. No alterar el orden de arranque por comodidad.

Los nombres y carpetas son **organizativos**. NO se han convertido arbitrariamente en ES modules con `import/export`; hacerlo cambiaría los ámbitos, los efectos laterales y el orden de inicialización. El empaquetador lee los fragmentos en el orden declarado por `game/manifest.json` y reconstruye el script original. No carga 466 peticiones HTTP ni introduce sobrecoste de red por archivo.

## Compilar y verificar

```bash
git lfs pull
python3 scripts/build_modular.py
node tests/module-source.cjs
node --max-old-space-size=768 tests/vehicle-handling.cjs
```

Salida: `dist/Managua.html` y `dist/module-verification.json`. El segundo contiene las huellas SHA-256 de referencia y salida, y el indicador de igualdad byte a byte. Al editar un módulo, es **normal** que `byteIdentical` pase a `false`; eso no significa un error, sino que el cambio debe comprobarse con sus propias pruebas.

Para reconstruir por primera vez una base idéntica al inicio de la migración:

```bash
python3 scripts/build_modular.py --verify-pristine
```

**No ejecutar `scripts/extract_modules.cjs` sobre fuentes ya editadas:** el extractor impide sobrescribir `game/manifest.json` para proteger el trabajo modular.

El constructor comprueba el SHA-256 del JavaScript generado por la cadena de parches original. Si cambian `physics/`, `performance/` o el HTML de Git LFS y la referencia diverge, la construcción **falla expresamente**, en lugar de sobrescribir las mejoras modulares o mezclar versiones incompatibles. Primero hay que migrar y verificar el cambio a la fuente modular y documentar la nueva base.

## Pruebas y publicación

1. La extracción inicial se probó reconstruyendo **todo** el HTML de 187 MB, no solo comparando nombres de funciones: la salida tuvo el mismo SHA-256 que la referencia.
2. La suite de 12 bloques de rendimiento y las pruebas de física/conducción pasó después de empaquetar los módulos.
3. `tests/module-source.cjs` verifica que el HTML publicado utiliza exactamente las piezas de `game/src/`, conserva las hojas CSS y tiene sintaxis JavaScript válida.
4. GitHub Pages debe compilar con `scripts/build_modular.py` (y después `scripts/build_pwa.py`), de modo que los cambios en los archivos modulares sí lleguen al juego.
5. Los bancos de prueba en Chromium con GPU software y el teléfono Android continúan siendo necesarios para validar controles, arranque, gráficos y FPS. La igualdad byte a byte por sí sola demuestra que el refactor inicial no modifica el contenido, no que el motor no tenga fallos anteriores.

Los catálogos, texturas, geometrías y recursos integrados se conservan en el HTML base de Git LFS para evitar su duplicación masiva en Git. **La separación de recursos pesados, descargas offline y actualizaciones incrementales se deja para una etapa posterior.**
