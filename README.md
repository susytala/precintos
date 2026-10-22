# Precintos de Seguridad — catálogo PWA

Catálogo web instalable (PWA) con carrito, pedido por WhatsApp y chat Tawk.to.

## Archivos
- `index.html` — el sitio completo
- `sw.js` — service worker (modo sin conexión)
- `manifest.webmanifest` — datos de la app instalable
- `icons/` — íconos de la app

## Publicar en GitHub Pages
1. Subí **todos** los archivos a un repositorio, manteniendo la carpeta `icons/`.
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Elegí la rama `main` y la carpeta `/ (root)`, y guardá.
4. A los 1-2 minutos el sitio queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Después de publicar
- En el panel de Tawk.to (Administración → Widget de chat) agregá el dominio `TU-USUARIO.github.io` a los dominios permitidos.
- Para actualizar precios o productos, editá `index.html` y subí el número de `VERSION` en `sw.js` (`v1` → `v2`) para que los celulares ya instalados reciban los cambios.
- Los precios y productos están al principio del script de `index.html` (`const PRODUCTS`).
