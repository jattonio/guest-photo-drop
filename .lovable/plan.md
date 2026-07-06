
# Optimización de galería (sin tocar calidad de las fotos)

## Ajuste al plan
Se elimina el punto 1 (compresión en el cliente). Las fotos se suben **tal cual, sin recompresión ni cambio de resolución**. La optimización viene 100% del lado de **entrega** (miniaturas on-the-fly) y de **cuánto** se pinta a la vez.

## Cambios

### 1. Miniaturas vía Supabase Storage transformations
En `src/lib/eventStore.ts`, `getPhotoUrl(filePath, size?)` acepta:
- `'thumb'` → `width: 600, quality: 70` → para el grid masonry
- `'large'` → `width: 1600, quality: 85` → para el modal ampliado
- `'original'` → URL sin transformar → solo para el botón "Descargar"

Se agrega helper que extrae el path relativo del bucket cuando `file_path` viene como URL pública completa (caso de las fotos ya subidas), para poder pedir la transformación. Si es un path relativo (subidas futuras), se usa directo.

`uploadPhoto` guardará el `path` relativo en lugar de la URL pública. Retrocompatible: `getPhotoUrl` maneja ambos formatos.

### 2. Paginación incremental en la galería
En `src/components/PhotoGallery.tsx`:
- `visibleCount` inicial **30**, botón "Cargar 30 más" al final del grid.
- El modal (lightbox) sigue navegando entre las 200 fotos completas; solo el grid se pagina.
- Se añade `decoding="async"` al `<img>` de las miniaturas.
- Grid usa `getPhotoUrl(photo.file_path, 'thumb')`.
- Modal usa `getPhotoUrl(selectedPhoto.file_path, 'large')`.
- Enlace de descarga usa `getPhotoUrl(..., 'original')` — descarga el archivo original sin pérdida.

## Fuera de alcance
- No se recomprime nada del lado cliente ni servidor.
- Las 200 fotos ya subidas se benefician automáticamente porque las transformaciones se hacen sobre el archivo del bucket al momento de servir.
- Sin cambios visuales ni de flujo de subida.

Procedo.
