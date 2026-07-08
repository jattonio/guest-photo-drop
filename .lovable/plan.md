## Descarga inteligente en la galería

Cambiar el botón "Descargar" del lightbox en `src/components/PhotoGallery.tsx` para que se comporte distinto según el dispositivo.

### Comportamiento

- **Desktop**: descarga el archivo a la carpeta de Descargas del navegador (comportamiento actual mejorado — usar `fetch` + `blob` + enlace temporal con `download` para forzar descarga real en lugar de abrir en nueva pestaña).
- **Mobile / Tablet**: abrir el diálogo nativo del sistema (share sheet) usando la **Web Share API con archivos** (`navigator.share({ files: [...] })`). Desde ahí el invitado elige "Guardar en Fotos" (iOS) o "Guardar imagen/video" (Android), que lo lleva directo a la galería del teléfono.
  - Si el navegador no soporta compartir archivos (`navigator.canShare({ files })` = false), usar como fallback el mismo flujo blob + `<a download>`.

### Detección

- Usar el hook existente `useIsMobile` para desktop vs. mobile.
- Para tablet, ampliar la detección a `window.innerWidth < 1024` o `navigator.maxTouchPoints > 0` en combinación con user agent — o simplemente tratar todo lo táctil (mobile + tablet) como "mobile" para este flujo.

### Cambios de código

- **`src/components/PhotoGallery.tsx`**:
  - Reemplazar el `<a href download>` por un `<button>` que invoque `handleDownload(selectedPhoto)`.
  - Nueva función `handleDownload`:
    1. `fetch(getPhotoUrl(photo.file_path, 'original'))` → `blob()` → `File`.
    2. Si es táctil y `navigator.canShare({ files: [file] })`: `await navigator.share({ files: [file] })`.
    3. Si no: crear URL con `URL.createObjectURL(blob)`, `<a download={filename}>`, click programático, `revokeObjectURL`.
  - Manejar errores con toast (`sonner`) — pero silenciar `AbortError` cuando el usuario cierra el share sheet.
  - Nombre de archivo: derivar del `file_path` (ya se hace hoy).

### Fuera de alcance

- No se toca el uploader ni otras rutas.
- No se agregan botones de "compartir" adicionales — solo se cambia el comportamiento del botón "Descargar".
