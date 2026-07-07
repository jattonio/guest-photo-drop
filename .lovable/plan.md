## Objetivo

Durante la subida de fotos/videos, mostrar al invitado un progreso real (archivo actual de total y % del archivo en curso) y asegurar que el botón vuelva a su estado inicial al finalizar, en lugar de quedarse en "Subiendo..." o "¡Listo!" indefinidamente.

## Cambios

### 1. `src/lib/eventStore.ts`
- Extender `uploadFile` y `uploadMedia` para aceptar un callback opcional `onProgress(percent: number)`.
- Como el SDK de Storage no expone progreso nativo, reemplazar la llamada `supabase.storage.from(...).upload(...)` por un `XMLHttpRequest` PUT/POST directo al endpoint de Storage (`/storage/v1/object/event-photos/<path>`) usando la `session` actual (o la anon key para invitados anónimos) y escuchando `xhr.upload.onprogress` para emitir el porcentaje. Mantener el mismo `contentType`, ruta y respuesta (`filePath`) para no romper el resto del flujo.
- El thumbnail de video se sigue subiendo con el SDK (archivo pequeño, sin progreso).

### 2. `src/components/PhotoUploader.tsx`
- Añadir estado local: `currentIndex` (archivo en curso, 1-based) y `currentPercent` (0–100).
- En el loop de `handleUpload`, pasar un callback `onProgress` a `uploadMedia` que actualice `currentPercent`, e incrementar `currentIndex` antes de cada archivo.
- Cambiar el contenido del botón cuando `uploading` es true:
  - Barra de progreso delgada dentro del botón (usando un `div` con `width: ${currentPercent}%` sobre el fondo dorado).
  - Texto: `Subiendo {currentIndex}/{total} · {currentPercent}%`.
- Restablecimiento del botón:
  - Al finalizar con éxito: mostrar el check "¡Listo!" 1.2s y luego limpiar previews + resetear `uploaded`, `currentIndex`, `currentPercent` (ya existe el `setTimeout`, se acorta y se añaden los nuevos resets).
  - En el `catch`: además de mostrar el toast de error, resetear inmediatamente `currentIndex` y `currentPercent` para que el botón vuelva al estado "Subir archivos" (el `finally` ya hace `setUploading(false)`).
  - Asegurar que `uploaded` también se resetee si el usuario vuelve a seleccionar archivos después de un éxito, para evitar quedar bloqueado en el estado "Listo".

### 3. Detalles visuales
- Barra de progreso: fondo `bg-primary-foreground/20`, relleno `bg-primary-foreground` con `transition-all duration-200`, alto ~4px, posicionada en la parte inferior del botón (usando `relative` + `absolute inset-x-0 bottom-0`).
- Mantener el botón deshabilitado durante `uploading` y `uploaded` (como hoy).
- No cambiar estilos globales ni tokens.

## Fuera de alcance
- No se toca el subidor del dashboard del organizador (si existiera flujo distinto), ni la lógica de reacciones, thumbnails o galería.
- No se agregan reintentos ni cancelación de subida — solo feedback visual y reset correcto.

## Verificación
- Subir 1 foto: barra va de 0→100%, botón muestra "¡Listo!" y vuelve a estado inicial tras ~1.2s.
- Subir 3 archivos mezclados (fotos + video): contador avanza 1/3 → 2/3 → 3/3, cada uno con su % propio.
- Forzar error (cortar red a mitad): botón vuelve a "Subir archivos", toast de error, se puede reintentar.
