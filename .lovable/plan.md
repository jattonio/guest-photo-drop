## Objetivo
Extender el flujo actual de fotos para que los invitados puedan subir videos desde el mismo selector, visualizarlos en la galería masonry estilo Pinterest sin deformar el layout, reproducirlos en el preview ampliado y descargar el archivo original.

## Alcance
- Mismo botón de subida para fotos y videos (`image/*,video/*`).
- Thumbnail estático con ícono de play en el masonry.
- Reproductor de video nativo en el preview ampliado.
- Descarga del archivo original tal cual se subió.
- Las reacciones por emoji seguirán funcionando sobre videos igual que sobre fotos.
- Sin límite de duración ni tamaño (tal como indicaste).

## Cambios en base de datos (migración)
1. Agregar a `event_photos`:
   - `media_type text not null default 'image'` — valores `'image'` o `'video'`.
   - `width integer` y `height integer` — dimensiones reales del archivo (foto o video). Sirven para reservar el espacio correcto en el masonry y evitar layout shift.
2. Mantener `file_path` como referencia al archivo principal (video o imagen).
3. No se modifican las políticas RLS existentes; la tabla sigue pública para subidas y lecturas.

## Cambios en almacenamiento
- Reutilizar el bucket público `event-photos` para videos.
- Para cada video, generar en el cliente un thumbnail JPEG del primer frame y subirlo al mismo bucket con un sufijo identificable (por ejemplo `eventId/uuid-thumb.jpg`), junto al video original (`eventId/uuid.mp4`).

## Cambios en frontend

### `src/lib/eventStore.ts`
- Extender `EventPhoto` con `media_type`, `width`, `height`.
- Agregar `uploadMedia(eventId, file, guestName)` que:
  - Detecte si el archivo es imagen o video.
  - Para videos: extraiga `width`/`height` y genere un thumbnail del primer frame.
  - Suba el archivo principal y, en caso de video, el thumbnail.
  - Guarde el registro en `event_photos` con `media_type` y dimensiones.
- Agregar helpers:
  - `getMediaUrl(filePath, 'original')` para descarga.
  - `getMediaUrl(filePath, 'thumb')` / `'large'` para imágenes (funcionan igual que hoy).
  - `getVideoThumbnailUrl(videoPath)` para obtener el thumbnail del primer frame.

### `src/components/PhotoUploader.tsx`
- Cambiar los inputs de `accept="image/*"` a `accept="image/*,video/*"`.
- En el preview previo a subir, mostrar:
  - `<img>` para fotos.
  - `<video>` con poster/controls desactivados para videos.
- Actualizar textos para reflejar "fotos y videos".

### `src/components/PhotoGallery.tsx`
- Leer `media_type` y dimensiones de cada registro.
- En el tile masonry:
  - Si es imagen: renderizar `<img>` como hoy.
  - Si es video: renderizar `<img src={thumbnail}>` con un overlay de ícono de play.
  - Usar `aspect-ratio` o un `padding-bottom` derivado de `width/height` para mantener el espacio reservado mientras carga el thumbnail.
- En el preview ampliado:
  - Si es video: renderizar `<video controls autoplay>` apuntando a la URL original.
  - Si es imagen: mantener `<img>` como hoy.
- El botón de descarga apunta al archivo original sin transformación.
- La barra de reacciones y contador siguen igual para ambos tipos.

### `src/pages/GuestView.tsx` y `src/pages/EventDashboard.tsx`
- Verificar que la recarga de fotos después de subir un video funcione igual que hoy (llamado a `getEventPhotos`).
- No se esperan cambios mayores, solo asegurar que la lista refrescada incluya los nuevos campos.

## Implementación del thumbnail de video
Para evitar dependencias nuevas, se usará el API nativo del navegador:
1. Crear un `<video>` oculto con `src = URL.createObjectURL(file)`.
2. Esperar el evento `loadedmetadata` para obtener `videoWidth`/`videoHeight`.
3. Buscar al frame en `seeked`, dibujar en un `<canvas>` y exportar como `canvas.toBlob('image/jpeg')`.
4. Subir el blob resultante como thumbnail.

## Pruebas de verificación
- Subir una foto: sigue funcionando exactamente igual.
- Subir un video desde móvil y desktop: aparece en la galería con ícono de play.
- Click en video: se abre el reproductor con controles y se reproduce.
- Swipe/navegación entre items del preview funciona con videos e imágenes mezclados.
- Descargar video: descarga el archivo original.
- Reacciones sobre videos se guardan y sincronizan en tiempo real.
- El masonry no se deforma al cargar videos (layout shift mínimo).

## Notas técnicas
- Se mantiene el bucket `event-photos` público; no se requiere crear nuevo bucket.
- Las transformaciones de imagen (`width`, `quality`, `resize: 'contain'`) de Supabase Storage siguen aplicándose solo a imágenes.
- Se guardan las dimensiones reales en la base de datos para reservar el espacio del tile antes de que cargue el thumbnail.
