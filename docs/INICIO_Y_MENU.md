# Menú con la referencia exacta

La revisión actual utiliza la imagen que el usuario aportó, `1000330417.jpg`, directamente, sin regeneración, retoque, recodificación ni sustitución por un diseño parecido. El logo grafiteado, letras, números, iconos, personaje, vehículos y frase del pie son los píxeles del archivo recibido. Dirección de arte y procedencia: [ART_DIRECTION.md](../presentation/ART_DIRECTION.md).

## Imagen y acciones reales

`presentation/assets/managua-menu-reference.jpg`: 1.536 × 867 px, 354.211 bytes; SHA-256 `55100b6c97eca0ef8830583735dd301ab2758957537ad8c633ea15e77b5c9854`. La copia original subida por el usuario no se altera. No se han generado imágenes nuevas para esta revisión.

El menú contiene tres botones HTML transparentes encima de las áreas 01/02/03: «Entrar a la ciudad», «Elegir vehículo» y «Ajustes». Conservan los manejadores originales, etiquetas accesibles, teclado, foco y estados desactivados. La ilustración es decorativa para lectores de pantalla y se acompaña de un título accesible. Las letras del menú están en la imagen: no se reemplazan por una fuente aproximada. El foco y la pulsación se señalan sobre la región correspondiente.

La escena completa se ajusta al espacio disponible manteniendo su proporción. Si la pantalla tiene otra relación de aspecto, quedan bandas exteriores en lugar de cortar o deformar el logo, los controles o el personaje. En vertical se conserva la composición horizontal completa; las regiones táctiles se reducen junto con la imagen. El formato de juego principal sigue siendo horizontal. No se afirma que los botones mantengan 44 px en vertical.

## Progreso real

La referencia ya contiene «100 %» y una barra completa. Durante el arranque, un panel opaco cubre la zona de las tres opciones y del progreso impreso. Muestra la fase real, un porcentaje no regresivo y la barra del juego. Las acciones permanecen desactivadas. Al prepararse el primer cuadro y habilitarse el botón original, se retira ese panel y aparece la referencia intacta con las tres opciones activas. Así no se presenta el «100 %» impreso como si fuera el estado de una carga pendiente.

Se conserva el botón original de recuperación si el arranque falla. No se acorta ni se simula la carga de recursos. Garaje y ajustes siguen usando controles reales y zonas desplazables, además de pestañas ARIA, navegación de teclado, foco contenido y retorno de foco. Los títulos y acentos de los submenús se adaptan a dorado, contorno oscuro y naranja. Se reaplican las zonas funcionales después de la rutina heredada `installIdentity42`, que reconstruye el inicio al finalizar el arranque. Se oculta la telemetría mientras el inicio está visible, conservando su preferencia durante el juego. No se modifica la física ni el HUD de conducción.

## Construcción y conservación

```sh
python3 scripts/build_performance.py
```

`scripts/build_presentation.py` integra la imagen como data URL JPEG dentro del script `presentation46`, sin peticiones de imágenes ni fuentes externas. Se conserva `Presentation46.readyLayout`, la interfaz usada por el arranque. El original de Git LFS permanece intacto. Los 16 bloques de recursos existentes se mantienen; el constructor verifica por hash todos los bytes externos a `appSource` y al script de presentación revisado.

La presentación ocupa 492.195 bytes frente a 1.820.044 bytes de las tres postales fotográficas originales. Es algo mayor que la ilustración elegida en la revisión anterior porque ahora se conserva exactamente el JPEG aportado. HTML actual: 182.309.722 bytes. Estas cifras describen tamaño del archivo, no FPS ni tiempo de carga en un teléfono.

## Pruebas

```sh
npm install --no-save --package-lock=false playwright@1.49.1
npx playwright install --with-deps chromium
node scripts/test_menu_browser.cjs
```

El banco compara una captura a resolución nativa de 1.536 × 867 con el JPEG decodificado por el mismo navegador. Esto verifica que, una vez listo, el menú reproduce la referencia sin letras añadidas, oscurecimiento, recortes ni deformaciones. La comparación se repite también sobre el juego completo después del arranque real, no solo sobre el fixture. Se registra diferencia de canales y píxeles. La comparación admite un máximo de 1 nivel por canal de 8 bits entre la composición JPEG del navegador y su lectura mediante Canvas; la identidad del archivo fuente se verifica por SHA-256.

También comprueba progreso real no regresivo, botones desactivados hasta estar listo, barra completa, regiones visibles a 640×360, 844×390, 1280×720, 390×844 y 320×568, pestañas y navegación de teclado. Abre el HTML completo y verifica arranque, ajustes iniciales, búsqueda del garaje, entrada a la ciudad, pausa y reanudación. El fixture de capturas usa el HTML y la presentación reales, sin cargar el motor; no representa FPS ni una escena de conducción. Las trece regresiones anteriores continúan en CI. Workflow: `.github/workflows/illustrated-menu.yml`, rama `ui/reference-menu`.
