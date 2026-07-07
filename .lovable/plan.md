# Galería estilo Pinterest

## Cambios en `src/components/PhotoGallery.tsx`

### 1. Distribución masonry responsive
Reemplazar el contenedor del grid:

```
columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 space-y-2
```

Resultado:
- Mobile (<640px): **2 columnas**
- Tablet sm (≥640px): **3 columnas**
- Tablet md (≥768px): **4 columnas**
- Desktop lg (≥1024px): **5 columnas**

Se mantiene `break-inside-avoid` en cada tarjeta y `loading="lazy"` + `decoding="async"` para el rendimiento del scroll infinito paginado (30 en 30, ya existente).

### 2. Preview (modal) a 1600px conservando proporción
El modal ya usa `getPhotoUrl(selectedPhoto.file_path, 'large')`, que en `src/lib/eventStore.ts` pide la transformación `{ width: 1600, quality: 85 }` a Supabase Storage. Storage escala manteniendo la proporción original (solo se fija el ancho), así que alto y ancho quedan proporcionales a la foto original. No requiere cambios.

Se ajusta el `<img>` del modal para que respete la proporción sin recortar y sin forzar altura excesiva:
- Se mantiene `object-contain`.
- `max-h-[70vh]` se sustituye por `max-h-[85vh]` para aprovechar mejor la pantalla en desktop (opcional, dentro del alcance visual de "preview").

### 3. Descarga = original
El enlace de descarga ya usa `getPhotoUrl(..., 'original')`, que retorna la URL pública sin transformación → descarga el archivo tal cual se subió. No requiere cambios.

## Fuera de alcance
- No se toca el uploader, ni la lógica de reacciones, ni el store.
- No se recomprime nada en cliente ni servidor.
- No se cambia la paleta ni tipografía.
