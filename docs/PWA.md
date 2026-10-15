# Nagua City instalable en Android (PWA)

## Qué es

La web es una **Progressive Web App**: se instala desde Chrome Android con icono propio, pantalla de inicio, modo independiente (sin barra del navegador) y una portada ligera completamente en español. La portada reutiliza el arte original sin modificarlo.

El juego no fue convertido en un APK nativo: se sigue ejecutando mediante el motor web del dispositivo y conserva sus controles y calidad. No se necesita Google Play.

**Importante:** El HTML original en Git LFS pesa aproximadamente 184 MB. La PWA **no lo mete en la caché del service worker** para no duplicar el consumo ni agotar la cuota de almacenamiento de Android. La portada sí funciona sin conexión después de la primera visita, pero para abrir el juego se requiere conexión. El navegador puede almacenar recursos en su caché HTTP, pero no se promete juego offline.

## Publicación (GitHub Pages)

1. En el repositorio, ve a **Settings → Pages → Build and deployment**.
2. Selecciona **Source: GitHub Actions**.
3. Una vez fusionados los cambios a `main`, el workflow **Publicar Nagua City PWA** construye el juego optimizado y publica el sitio mediante `actions/deploy-pages`.
4. Consulta el enlace publicado en **Actions → Publicar Nagua City PWA → Publicar aplicación web**. La URL habitual, si no tienes dominio propio, será `https://kankwj5-eng.github.io/Nagua-City/`, **pero no estará disponible hasta publicar correctamente**.

Si Pages todavía no está habilitado, la acción de publicación puede fallar hasta activar **Source: GitHub Actions**. La rama del PR solo ejecuta construcción y pruebas, no publica.

## Instalar en un celular Android

1. Abre la web publicada con Chrome sobre HTTPS.
2. Pulsa **INSTALAR APP**. Si todavía no aparece el diálogo, usa **⋮ → Instalar aplicación** o **Añadir a pantalla de inicio**.
3. Abre **Nagua City** desde el icono y toca **ENTRAR AL JUEGO**. La primera descarga puede ser larga por el tamaño del HTML; se recomienda Wi-Fi.

La instalación de una PWA depende del navegador, de HTTPS y de que se cumplan sus criterios. Chrome puede tardar en ofrecer el diálogo automático; el acceso mediante menú se mantiene disponible.

## Construcción local

Requisitos: Python 3.12, Pillow y Git LFS; Python estándar para el constructor del juego.

```bash
git lfs pull
python3 -m pip install Pillow==11.3.0
python3 scripts/build_performance.py --output dist/site/Managua.html
python3 scripts/build_pwa.py --game dist/site/Managua.html --output dist/site
python3 -m unittest discover -s tests -p 'test_pwa.py' -v
cd dist/site && python3 -m http.server 8000
```

Abre `http://localhost:8000` desde ese equipo para previsualizar el lanzador. Para instalarla en otro dispositivo utiliza HTTPS público; una IP local con HTTP no cumple normalmente los requisitos de instalación.

## Estructura

- `web/index.html`: portada instalable, ligera y responsive.
- `web/app.js`: botón de instalación y registro del service worker.
- `web/style.css`: diseño de portada con adaptación a móviles.
- `web/manifest.webmanifest`: nombre, inicio y presentación como app.
- `web/sw.js`: modo offline únicamente para la portada y sus recursos pequeños.
- `web/offline.html`: mensaje claro cuando el juego no tiene red.
- `scripts/build_pwa.py`: copia los archivos y genera iconos PNG 192 y 512 con contenido dentro de la zona segura maskable.
- `.github/workflows/pages-pwa.yml`: construcción, pruebas y despliegue GitHub Pages.

## Límites y futuro

- Esta versión **no promete** 60 FPS ni funcionamiento offline para el juego completo.
- Pruebas de compilación, instalación real en Chrome Android, orientación horizontal, consumo de RAM y arranque en celulares de gama baja son necesarias antes de declararla lista para todos.
- Para descargas más rápidas, el siguiente paso es separar los recursos del HTML pesado y comprimir/publicar assets versionados, conservando integridad y pruebas antes de migrarlos a la nube.
