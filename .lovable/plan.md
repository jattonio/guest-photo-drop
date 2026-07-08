## Descargar visible en el lightbox

En el lightbox de `src/components/PhotoGallery.tsx`, el botón "Descargar" queda debajo del viewport en móvil porque la imagen/video usa `max-h-[85vh]` y debajo se apilan la barra de reacciones, nombre, contador y descargar.

### Cambios

- **Reducir la altura del media** para dejar espacio a los controles inferiores: cambiar `max-h-[85vh]` a `max-h-[65vh]` (o `70vh`) tanto en el `<img>` del lightbox como en el `<video>` de `LightboxVideo`.
- **Mover "Descargar" a la barra superior** junto al botón de cerrar (X), como icono circular con el mismo estilo (`w-10 h-10 bg-background/20 rounded-full`). Así siempre está visible sin depender del scroll.
  - Al hacer click llama a `downloadMedia(selectedPhoto)` (función ya existente).
  - Se elimina el botón "Descargar" de la sección inferior para evitar duplicados.
- Mantener reacciones, nombre e índice `N / total` debajo del media.

### Fuera de alcance

- No se cambia la lógica de descarga ni el resto de la galería.
