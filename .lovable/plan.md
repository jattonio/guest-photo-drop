## Objetivo

Que los videos en la vista ampliada empiecen a reproducirse en cuanto haya suficiente buffer, sin esperar a la descarga completa.

## Diagnóstico

En `src/components/PhotoGallery.tsx` el `<video>` del modal usa `src={getPhotoUrl(..., 'original')}`, que devuelve la URL pública de Storage (`/object/public/...`). Ese endpoint sirve el archivo entero sin siempre respetar `Range` requests de forma óptima cuando el `moov atom` del MP4 está al final del archivo, así que Safari/iOS espera a tener todo antes de empezar.

## Cambios propuestos

**`src/components/PhotoGallery.tsx`** (solo el `<video>` del modal):
- Añadir `preload="auto"` para que el navegador empiece a descargar buffer apenas se abre el modal.
- Añadir `poster={getVideoThumbnailUrl(selectedPhoto.file_path)}` para mostrar el thumbnail generado mientras carga, en vez de un cuadro negro.
- Mantener `controls`, `autoPlay`, `playsInline`.
- Envolver el `<video>` en un contenedor `relative` con un spinner sutil (`animate-spin` con clase `border-gold`) posicionado en el centro que se oculta cuando dispara `onCanPlay`. Estado local `videoReady` en un nuevo pequeño componente `LightboxVideo` (definido dentro del mismo archivo) para no ensuciar `PhotoGallery`.

**`src/lib/eventStore.ts`**:
- Nueva utilidad `getVideoStreamUrl(filePath)` que devuelve la URL pública igual que `getPhotoUrl(..., 'original')` (Storage ya soporta `Range` en `/object/public/...`; no cambia la URL, solo separa la semántica). No se toca `getPhotoUrl`.

## Notas técnicas

- No se re-codifica ni re-sube nada. Los videos ya subidos siguen sirviendo desde el mismo endpoint.
- Para videos grabados en móviles el `moov atom` normalmente ya está al inicio (o el navegador hace un segundo Range request), así que con `preload="auto"` + `Range` la reproducción arranca en cuanto haya unos segundos de buffer.
- Si el MP4 tiene el `moov` al final, el navegador seguirá teniendo que descargar más antes de empezar; una solución completa requeriría `faststart` en servidor (fuera de alcance de este cambio de UI).

## Fuera de alcance

- Transcodificación server-side / `qt-faststart`.
- Cambios en el uploader, thumbnails, reacciones o galería tipo masonry.

## Pruebas

1. Abrir un video largo en la galería → aparece poster con thumbnail + spinner, y empieza a reproducirse antes de completar la descarga (verificable en DevTools Network: la request está `pending` mientras el video ya suena).
2. Abrir una foto → sin cambios visuales.
3. Swipe entre video y foto → sigue funcionando.
