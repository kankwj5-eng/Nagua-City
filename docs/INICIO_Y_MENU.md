# Inicio, carga y menú ilustrado

La revisión sustituye la presentación fotográfica anterior por una ilustración urbana original, con contornos marcados, sombras planas y colores cálidos. Casas bajas, moto de uso diario, carro compacto, lago y relieve al fondo mantienen el contexto nicaragüense. El arte es decorativo; textos y acciones son HTML accesible. Dirección de arte, prompt y herramienta de generación: [ART_DIRECTION.md](../presentation/ART_DIRECTION.md).

## Diseño y comportamiento

- Inicio con tres acciones: entrar a la ciudad, elegir vehículo y ajustes. Tipografía y jerarquía más contenidas; se conservan superficies táctiles de unos 44 px para las acciones principales.
- Una sola ilustración estática. Sin carrusel, fundidos continuos ni temporizador de alternancia.
- Carga con estado de la fase real, porcentaje y barra accesible. Si una fase informa un porcentaje menor que el anterior, la presentación conserva el máximo alcanzado. El 100 % y la entrada se habilitan con la señal original del primer cuadro preparado; no se acelera ni se simula la carga.
- Garaje y ajustes desactivados hasta terminar el arranque, evitando botones que aparentaban estar disponibles antes de registrar sus manejadores. Se conserva la recuperación original de arranque: error, reintento y botón para volver a abrir.
- Ajustes con cabecera breve, tres pestañas, controles compactos, área central desplazable y pie de acciones. Desde inicio muestra «Volver al inicio»; durante la partida, «Continuar». Se ocultan las acciones de partida que no corresponden al inicio.
- Pestañas con estados ARIA y navegación por flechas/Home/End. Diálogo con foco inicial, recorrido de Tab contenido y retorno de foco al cerrar. El control mediante teclado no sustituye la comprobación con lector de pantalla real.
- Adaptación a móvil vertical y horizontal, áreas seguras y movimiento reducido. Los cambios de CSS están limitados al inicio, garaje y ajustes; no redimensionan controles del HUD ni alteran conducción, física, resolución o calidad gráfica.

## Integración y coste

Archivos de presentación: `presentation/menu.js`, `presentation/menu.css` y `presentation/assets/managua-key-art.webp`. `scripts/build_presentation.py` sustituye únicamente el contenido del script `presentation46` después de aplicar las mejoras de rendimiento y conducción. Conserva el nombre del adaptador `Presentation46.readyLayout` requerido por el arranque. La construcción sigue siendo:

```sh
python3 scripts/build_performance.py
```

La imagen WebP mide 1.672 × 941 px y pesa 263.174 bytes. La presentación completa pasa de 1.820.044 a 370.796 bytes: 1.449.248 bytes menos. El HTML construido pasa de 183.637.571 a 182.188.323 bytes. Esta reducción de peso no certifica una mejora de FPS ni un tiempo de carga específico en Android.

El original de Git LFS permanece intacto. Se mantienen los 16 bloques de recursos existentes. La verificación ahora declara explícitamente que también cambia `presentation46`: `allOutsideAppSourceIdentical` es falso, `changedOutsideAppSource` contiene ese script y `allOutsideReviewedScriptsIdentical` comprueba por hash que el resto del archivo no cambia. No hay peticiones de imágenes o fuentes externas.

## Verificación

```sh
npm install --no-save --package-lock=false playwright@1.49.1
npx playwright install --with-deps chromium
node scripts/test_menu_browser.cjs
```

El banco genera un fixture del HTML y script reales para comprobar límites y obtener capturas a 640×360, 844×390, 1280×720, 390×844 y 320×568. Revisa acciones visibles, porcentaje no regresivo, disponibilidad al terminar la carga y navegación de pestañas. Después abre el HTML completo y comprueba arranque real, ajustes desde inicio, búsqueda del garaje, entrada a la ciudad, pausa y reanudación. El fixture no es el juego que se entrega ni se usa como evidencia de rendimiento.

CI: `.github/workflows/illustrated-menu.yml`. Capturas e informe se guardan en el artefacto `Nagua-menu-ilustrado`. Las trece regresiones anteriores siguen ejecutándose en el workflow de rendimiento para ramas `ui/**`.
