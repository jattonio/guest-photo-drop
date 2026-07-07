Plan para que la galería ocupe todo el ancho de la página

Objetivo: Eliminar el límite de ancho actual (`max-w-md` / `max-w-2xl`) que restringe la cuadrícula de fotos y videos, de modo que el área de despliegue de la galería use el 100% del ancho disponible en móvil, tablet y escritorio, sin afectar el header ni los botones de navegación.

Cambios propuestos:

1. **`src/pages/GuestView.tsx`**
   - Mantener el header (botón de Inicio, título del evento, organizador) y los botones de tab centrados dentro de un contenedor estrecho.
   - Extraer la sección de galería a un contenedor full-width debajo de los tabs: quitar el padding lateral que acota la cuadrícula y dejar que `<PhotoGallery />` ocupe todo el ancho de la pantalla.
   - Asegurar que la pestaña de subida (`upload`) siga con el estilo actual de tarjeta centrada.

2. **`src/pages/EventDashboard.tsx`**
   - Aplicar la misma lógica: header y tabs quedan en el contenedor centrado, y la galería se despliega en un bloque de ancho completo. La pestaña de QR permanece inalterada.

3. **`src/components/PhotoGallery.tsx`**
   - Ajustar la cuadrícula masonry (`columns-*`) para que use el ancho completo sin márgenes laterales artificiales.
   - Añadir pequeños paddings horizontales móviles (p. ej. `px-2`) para que las fotos no toquen los bordes de la pantalla, aumentando ligeramente en pantallas grandes (`px-4`/`px-6`).

4. Verificación visual:
   - Comprobar en el preview que la cuadrícula se extiende de borde a borde en la vista actual (desktop 1050 px).
   - Comprobar con la herramienta de vista de dispositivos (`mobile`/`tablet`) que el ancho es total sin romper la estructura de columnas.

Nota: No se modifica el lightbox, el uploader, ni la lógica de reacciones. Solo se cambia la disposición de la galería en la página.