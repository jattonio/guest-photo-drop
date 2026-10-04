# CLAUDE.md — Fotiva

Contexto permanente del repositorio. Idioma del producto y de la UI: español.

## Qué es el producto

**Fotiva** es una plataforma donde los invitados de un evento (boda, XV años, corporativo) suben fotos y videos escaneando un QR, **sin crear cuenta**, y los ven aparecer en una galería en tiempo real. El **organizador sí tiene cuenta** (email + contraseña): crea eventos, obtiene el código/QR y ve el panel con las fotos.

- Invitado: entra por `/event/:code` (QR o código manual en `/`), escribe su nombre, sube archivos, reacciona con emojis. Se identifica con un `guest_id` aleatorio en `localStorage`.
- Organizador: `/auth` → `/create` → `/dashboard/:id` (QR, código, enlace, galería en vivo).
- Nombre y dominio de marca: única fuente en `src/lib/brand.ts` (`BRAND_NAME`, `BRAND_DOMAIN`, …). No escribir "Fotiva" ni `fotiva.app` a mano en el código. El nombre del repo git (`guest-photo-drop`) y el proyecto Supabase se mantienen.

## Stack real

- **Vite 5 + React 18 + TypeScript 5** (SWC), SPA con **react-router-dom 6** (`BrowserRouter`). Dev server en el puerto 8080.
- **Tailwind CSS 3** + `tailwindcss-animate` + `@tailwindcss/typography`; **shadcn/ui** (Radix) en `src/components/ui/`; `lucide-react`; `sonner` (toasts) además del toaster de shadcn.
- **Supabase** (`@supabase/supabase-js`): Postgres + RLS, Auth, Storage (bucket `event-photos`), Realtime (`postgres_changes`). Proyecto `dypsfyseecbdxthzcvpq` (`supabase/config.toml`).
- Estado/datos: `@tanstack/react-query` (QueryClient montado, uso casi nulo; los datos se cargan con `useEffect` + `eventStore`), `react-hook-form` + `zod` (instalados), `qrcode.react` (QR del evento).
- Tests: **vitest** + jsdom + Testing Library (`src/test/`, solo hay un test de ejemplo); **Playwright** configurado (`playwright.config.ts`, `playwright-fixture.ts`). Lint: ESLint 9 + typescript-eslint.
- Generado con **Lovable** (`lovable-tagger` en dev). Cambios en Lovable se commitean al repo.
- Variables de entorno (`.env`, ignorado por git): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Gestor de paquetes: **bun** (`bun.lock`). Ojo: `package-lock.json` y `bun.lockb` también están en el repo (residuos de Lovable/npm); no los actualices.

Comandos: `bun install`, `bun run dev`, `bun run build`, `bun run lint`, `bun run test`.

## Mapa de rutas (`src/App.tsx`)

| Ruta | Página | Acceso |
|---|---|---|
| `/` | `Index` | Público: landing + ingresar código de evento |
| `/auth` | `Auth` | Público: registro / login del organizador |
| `/create` | `CreateEvent` | Organizador (redirige a `/auth` si no hay sesión) |
| `/my-events` | `MyEvents` | Organizador: lista sus eventos |
| `/dashboard/:id` | `EventDashboard` | Organizador dueño: QR, código, enlace, galería realtime |
| `/event/:code` | `GuestView` | Público (invitados): subir + galería realtime |
| `*` | `NotFound` | — |

Providers en `App.tsx`: `QueryClientProvider` → `AuthProvider` → `TooltipProvider` → toasters → router.

## Archivos clave

- `src/main.tsx` — punto de entrada React.
- `src/App.tsx` — providers y definición de rutas.
- `src/index.css` — **tokens de diseño** de la Guía de Estilos Fotiva v1.0 (HEX + HSL para shadcn, tema `.dark`, radios `fotiva`, animación `float`).
- `tailwind.config.ts` — mapea los tokens a colores/fuentes de Tailwind (`brand.*`, `energy.*`, `neutral.*`, `dark.*`, `rounded-fotiva-*`, `font-heading` = Plus Jakarta Sans, `font-sans` = DM Sans).
- `src/lib/eventStore.ts` — **capa de datos**: tipos (`EventData`, `EventPhoto`, `PhotoReaction`), `generateCode`, CRUD de eventos/fotos, subida a Storage (con progreso vía XHR), miniaturas de video, dimensiones, reacciones, `getGuestId`, URLs públicas con transformación (`thumb` 600px / `large` 1600px / `original`).
- `src/lib/brand.ts` — constantes de marca (nombre, dominio, título, descripción); `vite.config.ts` las inyecta en `index.html` vía marcadores `%BRAND_*%`.
- `src/lib/utils.ts` — helper `cn()` (clsx + tailwind-merge).
- `src/contexts/AuthContext.tsx` — `AuthProvider` y hook `useAuth()` (`user`, `session`, `loading`, `signOut`).
- `src/integrations/supabase/client.ts` — cliente Supabase **autogenerado, no editar**.
- `src/integrations/supabase/previewAuthStorage.ts` — storage de sesión para previews de Lovable (autogenerado).
- `src/integrations/supabase/types.ts` — tipos `Database` autogenerados.
- `src/components/PhotoUploader.tsx` — selección múltiple de fotos/videos, nombre del invitado, progreso, llama a `uploadMedia` + `addPhotoRecord`.
- `src/components/PhotoGallery.tsx` — grilla, lightbox, video, reacciones (realtime en `photo_reactions`), descarga.
- `src/components/NavLink.tsx` — wrapper de `NavLink` de react-router.
- `src/components/ui/*` — componentes shadcn (`components.json`); `use-toast.ts` duplicado también en `src/hooks/`.
- `src/hooks/use-mobile.tsx` — detección de viewport móvil.
- `src/pages/*` — una página por ruta (ver tabla).
- `src/assets/hero-party.jpg` — imagen del hero.
- `supabase/migrations/` — historial del esquema (ver abajo). `supabase/config.toml` — solo `project_id`.
- `src/test/` — `setup.ts` y test de ejemplo.

## Modelo de datos (leído de `supabase/migrations/`)

### `public.events`
`id uuid PK default gen_random_uuid()`, `name text NOT NULL`, `date text NOT NULL` (texto, no `date`), `host_name text NOT NULL default ''`, `code text NOT NULL UNIQUE` (6 caracteres sin `0/O/1/I`), `created_at timestamptz default now()`, `user_id uuid → auth.users ON DELETE CASCADE` (nullable).
RLS: SELECT `USING (true)` (anónimos); INSERT `auth.uid() = user_id`; UPDATE y DELETE `auth.uid() = user_id`.

### `public.event_photos` (fotos **y** videos)
`id uuid PK`, `event_id uuid NOT NULL → events ON DELETE CASCADE`, `guest_name text NOT NULL default 'Invitado anónimo'`, `file_path text NOT NULL`, `created_at timestamptz`, `media_type text NOT NULL default 'image'` (`image|video`, sin CHECK), `width int`, `height int`.
RLS: SELECT `true`; INSERT `WITH CHECK (true)`. **No hay policies de UPDATE ni DELETE** (nadie puede borrar/editar fotos vía API). Publicada en `supabase_realtime`.

### `public.photo_reactions`
`id uuid PK`, `photo_id uuid NOT NULL → event_photos ON DELETE CASCADE`, `emoji text NOT NULL`, `guest_id text NOT NULL` (id de `localStorage`, no es usuario), `created_at timestamptz`, `UNIQUE(photo_id, guest_id)`.
RLS: SELECT/INSERT/UPDATE/DELETE abiertos a `public` (`true`). Publicada en `supabase_realtime`.

### `public.profiles`
`id uuid PK → auth.users ON DELETE CASCADE`, `display_name text NOT NULL default ''`, `created_at timestamptz`.
RLS: SELECT/UPDATE `auth.uid() = id`; INSERT `WITH CHECK (auth.uid() = id)`.
Trigger `on_auth_user_created` → función `handle_new_user()` (SECURITY DEFINER) crea el perfil al registrarse.

### Storage
Bucket público `event-photos`. Policies en `storage.objects`: SELECT y INSERT abiertos para `bucket_id = 'event-photos'`. Sin UPDATE/DELETE. Rutas: `{event_id}/{uuid}.{ext}`; miniatura de video: `{event_id}/{uuid}-thumb.jpg`.

### Migraciones existentes
1. `20260402035253_…` — events, event_photos, realtime, bucket y policies de storage.
2. `20260402041412_…` — profiles, trigger de signup, `events.user_id`, RLS de dueño.
3. `20260402042636_…` — photo_reactions + realtime.
4. `20260707015354_…` — `media_type`, `width`, `height` en `event_photos`.

## Convenciones detectadas

- Componentes de función con export default (páginas) o nombrado; TypeScript; alias `@/` → `src/`.
- Textos de UI, toasts y mensajes de error en **español**; toasts con `sonner` (`toast.success/error`).
- Acceso a datos como funciones `async` en `eventStore.ts` que lanzan el `error` de Supabase (`if (error) throw error`); las páginas hacen `try/catch` y muestran toast.
- Suscripciones realtime en `useEffect` con `supabase.channel(...).on('postgres_changes', …)` y limpieza con `supabase.removeChannel`.
- Páginas protegidas: `useAuth()` + `useEffect` que hace `navigate('/auth')` si no hay usuario (no hay componente de ruta protegida).
- Estilos: clases Tailwind con tokens semánticos (`bg-background`, `text-primary`, `bg-brand-primary`, `shadow-brand`, `font-heading`); colores siempre **HSL** vía variables CSS. Mobile-first (la subida es desde el celular).
- Los tipos de fila vienen de `Database` (autogenerado); en `eventStore.ts` se castea `media_type` a `'image' | 'video'`.
- Deuda conocida (no replicar): `Auth.tsx`, `MyEvents.tsx`, `EventDashboard.tsx` y `PhotoGallery.tsx` llaman a `supabase` directamente en vez de pasar por `eventStore.ts`; `photo_reactions` y `event_photos` tienen RLS totalmente abierta; `toggleReaction` ignora errores; `event_photos` y `storage.objects` no tienen policies de DELETE, por lo que hoy es imposible borrar una foto vía API.

## Trampas conocidas para refactorizaciones

- **Tokens de diseño.** Migrados a Fotiva (violeta `#635BFF`, Plus Jakarta Sans + DM Sans); las clases `gold`, `cream`, `gradient-gold`, `shadow-gold` y `font-display` ya no existen. Los radios de Fotiva son `rounded-fotiva-*`; la escala de Tailwind no se redefine. `success`/`error` solo para íconos y rellenos; para texto, `success-text`/`error-text`. Igual con `energy.coral`: con texto blanco el fondo es `energy.coralDeep`.
- **Acceso directo a `supabase`.** `Auth.tsx`, `MyEvents.tsx`, `EventDashboard.tsx` y `PhotoGallery.tsx` llaman a `supabase` directamente. Cualquier cambio en la capa de datos o de URLs debe tocar esos cuatro archivos además de `eventStore.ts`.
- **No existe `supabase/functions/`.** La primera Edge Function requiere crear y configurar ese directorio (y su entrada en `supabase/config.toml`).
- **Esquema laxo.** `events.date` es `text` en vez de `date`; `events.user_id` es nullable; `media_type` no tiene CHECK constraint.

## Reglas de trabajo

1. **El gestor de paquetes es bun.** No usar npm (`bun add`, `bun install`, `bun run`). No regenerar ni tocar `package-lock.json`.
2. **NUNCA editar `src/integrations/supabase/client.ts`**: lo regenera Lovable. Toda lógica nueva va en `src/lib/eventStore.ts` o en Edge Functions.
3. **Nunca commitear `.env` ni claves** (anon key, service role, tokens). `.env` está en `.gitignore`; no usar `git add -A` a ciegas.
4. **Todo cambio de esquema o de RLS va como archivo nuevo** en `supabase/migrations/` con timestamp (`YYYYMMDDHHMMSS_descripcion.sql`), **nunca editando una migración existente**.
5. **Los tokens de diseño viven en un solo lugar** (`src/index.css`, mapeados en `tailwind.config.ts`). No usar valores HEX sueltos (ni `hsl()`/`rgb()` literales) en componentes; usar clases o variables de token.
