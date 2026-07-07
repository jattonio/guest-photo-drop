## Recordar y animar al invitado a poner su nombre

### Cambios en `src/components/PhotoUploader.tsx`

1. **Persistir el nombre**
   - Inicializar el estado `guestName` leyendo `localStorage.getItem('guest_name')`.
   - Actualizar `localStorage` con cada cambio del input (`onChange`) para persistir aunque no se complete la subida.
   - Al terminar la subida exitosa, guardar el nombre actual (si tiene texto) en `localStorage`.

2. **Alerta amigable cuando no hay nombre**
   - Antes de comenzar `handleUpload`, si `guestName.trim()` está vacío, mostrar un toast de sonner con el mensaje:
     > "Escribe tu nombre que la(el) invitada(o) te agradezca"
   - El toast será de tipo informativo (puede usarse `toast()` o `toast.info()` si está disponible). No se detiene el flujo ni se bloquea el botón: se muestra la alerta y se continúa con la subida como invitado anónimo.

### Fuera de alcance

- No se hace obligatorio el nombre.
- No se sincroniza entre dispositivos ni se asocia a una cuenta.
- No se cambia el fallback "Invitado anónimo" que ya existe en `handleUpload`.
