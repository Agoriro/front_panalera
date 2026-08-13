# Prompt: Frontend — Sistema de Gestión Pañalera

## Rol y contexto

Eres un arquitecto de software senior y diseñador UI/UX experto en aplicaciones React empresariales. Tu tarea es diseñar y generar el frontend completo de un sistema de gestión para una pañalera (tienda de productos para bebés), que funciona tanto en web como en Android (vía Capacitor). El diseño debe ser profesional, funcional, seguro y visualmente distintivo dentro del dominio de productos para bebés: suavidad, confianza y calidez sin caer en clichés infantiles.

---

## Stack tecnológico obligatorio

Utiliza exclusivamente las siguientes tecnologías. No sugieras ni introduzcas alternativas.

**Base:**
- React 19
- Vite 6
- TypeScript 5 (strict mode activado, sin `any` implícito)
- Tailwind CSS v4

**Componentes UI:**
- shadcn/ui (como base de componentes: Table, Dialog, Select, DatePicker, Sheet, Tabs, Badge, Skeleton)
- Lucide React (iconografía exclusiva, línea fina)

**Routing:**
- React Router v7 con `createBrowserRouter`. Rutas protegidas mediante `ProtectedRoute` que verifica el token antes de renderizar.

**Estado del servidor:**
- TanStack Query v5 (`@tanstack/react-query`) para todas las llamadas a la API. Nunca usar `useEffect` + `fetch` directamente para obtener datos.

**Estado global del cliente:**
- Zustand v5 exclusivamente para: usuario autenticado, access token, refresh token, rol activo y estado del sidebar (colapsado/expandido).

**Formularios y validación:**
- React Hook Form v7 + Zod v4 con `@hookform/resolvers/zod`. Cada formulario debe tener su propio schema Zod que refleje exactamente el contrato del endpoint correspondiente.

**HTTP Client:**
- Axios v1 con una instancia centralizada (`src/api/client.ts`) que incluya:
  - Interceptor de request: adjunta `Authorization: Bearer <access_token>` en cada petición.
  - Interceptor de response: captura errores `401`, llama a `/auth/refresh`, reintenta la petición original con el nuevo token, y si el refresh falla, desloguea al usuario y redirige a `/login`.

**Tablas:**
- TanStack Table v8 para el módulo de inventario y reportes.

**Gráficas:**
- Recharts v2 para reportes de ventas, utilidades y proyecciones.

**Notificaciones:**
- Sonner para todos los toasts del sistema.

**Fechas:**
- date-fns v3 para formateo y cálculo de rangos de fechas en reportes.

**Carga de imágenes:**
- React Dropzone v14 para subida de fotos de artículos.

**Exportación:**
- SheetJS (xlsx) para exportar reportes a Excel.
- @react-pdf/renderer para exportar reportes a PDF imprimible.

**Android:**
- Capacitor v7 configurado con `capacitor.config.ts`. El bloque `server.url` solo se activa en desarrollo local y se comenta antes del build de producción.

**Modo oscuro:**
- Implementado con la estrategia `class` de Tailwind (`darkMode: 'class'`). Toggle persistido en `localStorage` y aplicado en el `<html>`. Todos los componentes deben funcionar correctamente en ambos modos.

---

## Identidad visual y sistema de diseño

### Paleta de colores (tokens Tailwind)

Define los siguientes tokens en `tailwind.config.ts` como colores personalizados:

| Token | Hex claro | Uso |
|---|---|---|
| `primary` | `#9B7DB6` | Botones principales, sidebar activo, badges de rol |
| `primary-dark` | `#7A5F99` | Hover de botones primarios |
| `secondary` | `#7CC4A4` | Badges de éxito, stock disponible, confirmaciones |
| `accent` | `#F4A97F` | Alertas suaves, estados hover secundarios, destacados |
| `surface` | `#FAFAF8` | Fondo base de todas las pantallas (light mode) |
| `surface-card` | `#FFFFFF` | Fondo de tarjetas y paneles |
| `text-base` | `#2D2D3A` | Todo el texto corrido |
| `text-muted` | `#6B6B7B` | Labels secundarios, placeholders |
| `border-soft` | `#E8E4F0` | Bordes de cards y dividers |
| `danger` | `#E05252` | Errores, stock crítico, eliminaciones |

En dark mode, el fondo base cambia a `#1A1A24`, las cards a `#242433`, y los textos invierten adecuadamente usando las utilidades `dark:` de Tailwind.

### Tipografía

- **Display / Headings**: `Plus Jakarta Sans` (Google Fonts). Pesos: 500 y 600.
- **Body / UI**: `DM Sans` (Google Fonts). Peso: 400 regular.
- **Datos numéricos / códigos / IDs**: `JetBrains Mono` (Google Fonts). Para precios, cantidades, UUIDs en debug.

Configura las tres fuentes en `index.html` vía `<link>` de Google Fonts con `display=swap`.

### Componentes visuales distintivos

- **Sidebar**: fondo `primary` (lila) en modo claro y `#1E1B2E` en modo oscuro. Iconos en blanco con opacidad, texto de ítem activo en blanco sólido con fondo `primary-dark`. Al colapsar solo muestra iconos centrados con tooltip al hover.
- **Badges de estado de stock**: verde (`secondary`) para stock normal, ámbar para stock bajo (< 5 unidades), rojo (`danger`) para sin stock.
- **Empty states**: ilustraciones SVG inline simples y un CTA directo ("Registra tu primer artículo").
- **Skeleton loaders**: en todas las tablas y tarjetas mientras TanStack Query está en estado `isLoading`.
- **Signature element**: en la parte superior del sidebar, un isotipo SVG minimalista de una cuna/cuna de bebé con el nombre "Pañalera" en Plus Jakarta Sans 600. No usar imágenes externas.

---

## Arquitectura de carpetas (obligatoria)

```
src/
├── api/
│   ├── client.ts              # instancia Axios + interceptores JWT + refresh logic
│   ├── auth.ts                # llamadas a /auth/login, /auth/refresh
│   ├── catalog.ts             # suppliers, categories, colors, sizes, genders
│   ├── inventory.ts           # /inventory/
│   ├── movements.ts           # /movements/ (BUY y SELL)
│   ├── users.ts               # /users/
│   └── roles.ts               # /roles/
├── components/
│   ├── ui/                    # re-exports y extensiones de shadcn/ui
│   └── layout/
│       ├── AppLayout.tsx      # shell: sidebar + outlet
│       ├── Sidebar.tsx        # colapsable, rol-aware
│       ├── Header.tsx         # breadcrumb + toggle dark mode + avatar
│       └── ProtectedRoute.tsx # guard de autenticación y rol
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── useLogin.ts        # mutation de TanStack Query
│   │   └── authSchema.ts      # schema Zod del formulario
│   ├── catalog/
│   │   ├── suppliers/
│   │   ├── categories/
│   │   ├── colors/
│   │   ├── sizes/
│   │   └── genders/
│   │   # cada subcarpeta tiene: Page.tsx, Form.tsx, columns.tsx, schema.ts, use[Entity].ts
│   ├── inventory/
│   │   ├── InventoryPage.tsx  # vista tabla + tarjetas intercambiable
│   │   ├── InventoryForm.tsx  # creación y edición
│   │   ├── InventoryCard.tsx  # tarjeta visual con foto
│   │   ├── columns.tsx        # definición TanStack Table
│   │   ├── inventorySchema.ts # schema Zod
│   │   └── useInventory.ts    # queries y mutations
│   ├── movements/
│   │   ├── PurchasePage.tsx   # registro de compras (BUY)
│   │   ├── SalePage.tsx       # registro de ventas (SELL)
│   │   ├── MovementForm.tsx
│   │   └── useMovements.ts
│   ├── reports/
│   │   ├── SalesReportPage.tsx
│   │   ├── StockReportPage.tsx
│   │   └── useReports.ts
│   └── users/
│       ├── UsersPage.tsx      # solo visible para rol Admin
│       ├── UserForm.tsx
│       └── useUsers.ts
├── hooks/
│   ├── useDebounce.ts
│   └── usePagination.ts
├── stores/
│   └── authStore.ts           # Zustand: user, accessToken, refreshToken, role
├── types/
│   ├── auth.ts
│   ├── catalog.ts
│   ├── inventory.ts
│   ├── movement.ts
│   └── user.ts
├── router/
│   └── index.tsx              # createBrowserRouter con todas las rutas y guards
├── lib/
│   └── utils.ts               # cn(), formatCurrency(), formatDate()
└── main.tsx
```

---

## Contrato con la API REST

**URL base:** `http://localhost:8000/api/v1`  
Todos los IDs son `UUID` string (nunca enteros). Todos los endpoints responden `application/json`.

### Autenticación

| Método | Endpoint | Body | Respuesta exitosa |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }` | `{ access_token, refresh_token, token_type }` |
| POST | `/auth/refresh` | `{ refresh_token }` | `{ access_token, refresh_token, token_type }` |

Flujo de refresh: al recibir `401`, el interceptor de response llama a `/auth/refresh`. Si tiene éxito, almacena el nuevo token en Zustand y reintenta la petición original. Si falla (refresh expirado), limpia el store y redirige a `/login`.

### Catálogos (CRUD idéntico para todos)

Endpoints disponibles: `/catalog/suppliers`, `/catalog/categories`, `/catalog/colors`, `/catalog/sizes`, `/catalog/genders`.

Operaciones: `GET /` (listado), `POST /` (crear), `PUT /{id}` (editar), `DELETE /{id}` (eliminar).

Suppliers incluye campos: `name_supplier`, `address`, `is_active`.

### Inventario

| Método | Endpoint | Notas |
|---|---|---|
| GET | `/inventory/` | Listado de productos |
| POST | `/inventory/` | Requiere UUIDs de catálogos: `id_supplier`, `id_color`, `id_size`, `id_category`, `id_gender` + `description` + `utility` (porcentaje) |
| PUT | `/inventory/{id}` | Edición |
| DELETE | `/inventory/{id}` | Eliminación |

El precio de venta no es un campo físico. Se calcula en frontend: `precio_venta = costo_compra × (1 + utilidad / 100)`.

### Movimientos

| Método | Endpoint | Body | Notas |
|---|---|---|---|
| POST | `/movements/` | `{ id_inventory, type_movement: "BUY", id_supplier, quantity, value }` | Compra: incrementa stock |
| POST | `/movements/` | `{ id_inventory, type_movement: "SELL", id_supplier: null, quantity, value }` | Venta: decrementa stock. Backend retorna `400` si stock insuficiente |

### Usuarios y Roles

`GET/POST/PUT/DELETE` en `/users/` y `/roles/`. Las contraseñas nunca se devuelven en GET. Si no se envía contraseña en PUT, se conserva la actual.

### Errores estándar del backend

| Código | Significado | Acción en frontend |
|---|---|---|
| `400` | Error de negocio (stock insuficiente, regla violada) | Toast de error con `detail` del backend |
| `401` | Token inválido o expirado | Ejecutar flujo de refresh |
| `403` | Sin permisos | Toast de advertencia, no redirigir |
| `404` | UUID no encontrado | Toast de error |
| `422` | Error de validación Pydantic | Mapear `detail` a errores de campo en el formulario |
| `429` | Rate limit (especialmente en login) | Toast con mensaje "Demasiados intentos, espera un momento" |

El body de error siempre tiene la forma: `{ "detail": "Mensaje legible" }`.

---

## Módulos y pantallas requeridas

### Login (`/login`)
- Pantalla centrada con el isotipo de la pañalera arriba.
- Formulario con campos `username` y `password`, validado con Zod.
- Manejo explícito de `429` con contador de espera visible.
- Al autenticarse exitosamente, redirige según rol: Admin → `/dashboard`, Vendedor → `/movements/sale`.

### Dashboard (`/dashboard`) — solo Admin
- KPIs en cards: total ventas del mes, utilidad del mes, artículos con stock bajo, total de compras del mes.
- Gráfica de ventas de los últimos 30 días (Recharts LineChart).
- Tabla de los 5 artículos más vendidos.

### Catálogos — solo Admin
Una página por catálogo (`/catalog/suppliers`, `/catalog/categories`, etc.). Cada una con:
- Tabla con columnas relevantes, búsqueda y paginación.
- Botón "Nuevo" que abre un `Dialog` de shadcn/ui con el formulario.
- Acciones por fila: editar (abre Dialog precargado) y eliminar (con `AlertDialog` de confirmación).

### Inventario (`/inventory`) — solo Admin
- Toggle entre vista tabla (TanStack Table) y vista tarjetas (grid de `InventoryCard`).
- Vista tabla: columnas descripción, categoría, color, talla, género, stock actual, utilidad %, precio de venta calculado, acciones.
- Vista tarjetas: foto del artículo, descripción, badge de stock, precio de venta calculado.
- Filtros: búsqueda por texto, filtro por categoría, filtro por stock (todos/disponibles/agotados).
- Formulario de creación/edición en panel lateral (`Sheet` de shadcn/ui) con carga de foto vía React Dropzone.

### Compras (`/movements/purchase`) — solo Admin
- Formulario para registrar una compra (`BUY`): seleccionar artículo del inventario, proveedor, cantidad y costo unitario.
- Vista previa del precio de venta calculado en tiempo real: `costo × (1 + utilidad / 100)`.
- Historial de compras del período en tabla debajo del formulario.

### Ventas (`/movements/sale`) — Admin y Vendedor
- Formulario para registrar una venta (`SELL`): seleccionar artículo, cantidad y valor de venta.
- Muestra el stock disponible actual del artículo seleccionado antes de confirmar.
- Manejo explícito del error `400` de stock insuficiente con mensaje claro al usuario.
- Historial de ventas del día en tabla debajo del formulario.

### Reportes (`/reports`) — solo Admin
- Pestaña "Ventas por período": selector de rango de fechas (date-fns), tabla de ventas, total de utilidad calculada, gráfica de barras (Recharts BarChart). Botones de exportar a Excel (SheetJS) y exportar a PDF (@react-pdf/renderer).
- Pestaña "Existencias": tabla de inventario con stock actual, valor de costo total por artículo. Exportable a Excel.
- Pestaña "Proyección": gráfica de línea con proyección de ventas usando promedio móvil de los últimos 30 días.

### Usuarios (`/users`) — solo Admin
- Tabla de usuarios con nombre, email, rol asignado y estado activo.
- Formulario de creación con campo de contraseña. Formulario de edición sin campo de contraseña (se muestra solo si el admin marca "Cambiar contraseña").

---

## Control de acceso por rol

Define una tabla de permisos explícita en `src/router/index.tsx`. El componente `ProtectedRoute` recibe el rol requerido y, si el usuario no lo tiene, redirige a la pantalla permitida más cercana (no muestra `403` como pantalla completa, usa un toast).

| Ruta | Admin | Vendedor |
|---|---|---|
| `/dashboard` | ✅ | ❌ |
| `/catalog/*` | ✅ | ❌ |
| `/inventory` | ✅ | ❌ |
| `/movements/purchase` | ✅ | ❌ |
| `/movements/sale` | ✅ | ✅ |
| `/reports` | ✅ | ❌ |
| `/users` | ✅ | ❌ |

---

## Seguridad en el frontend

- Nunca almacenar tokens en `localStorage`. Usar **Zustand con persist en `sessionStorage`** para el access token. El refresh token se almacena en una cookie `httpOnly` (el backend la setea; el frontend no la lee directamente).
- El interceptor de Axios nunca loguea tokens en consola.
- Sanitizar cualquier dato proveniente de la API antes de renderizarlo en el DOM (`DOMPurify` para campos de texto libre como descripciones).
- Las rutas privadas verifican el token en cada navegación, no solo al cargar la app.
- Los formularios de eliminación siempre requieren confirmación mediante `AlertDialog`.

---

## Buenas prácticas de código limpio

- **Naming**: componentes en PascalCase, hooks en camelCase con prefijo `use`, schemas Zod con sufijo `Schema`, types con sufijo `Type` o interfaz sin sufijo.
- **Separación de responsabilidades**: cada feature tiene su propio hook de datos (`useInventory.ts`) separado del componente de UI. Los componentes no llaman a Axios directamente.
- **Un solo nivel de abstracción por función**: las funciones de `src/api/*.ts` solo hacen la llamada HTTP y devuelven el dato tipado. La lógica de negocio (cálculo de precio, validación de stock) vive en los hooks o en utils.
- **Invalidación de caché declarativa**: al crear, editar o eliminar un recurso, invalidar explícitamente la query correspondiente con `queryClient.invalidateQueries({ queryKey: ['inventory'] })`.
- **Manejo de errores centralizado**: un helper `handleApiError(error)` en `src/lib/utils.ts` que extrae el `detail` del body del error de Axios y lo pasa a Sonner.
- **Sin magic strings**: todos los query keys de TanStack Query definidos como constantes en `src/api/*.ts`. Todas las rutas de navegación definidas como constantes en `src/router/routes.ts`.
- **Accesibilidad mínima**: todos los `<button>` tienen `aria-label`, todos los inputs tienen `<label>` asociado, el contraste de color cumple WCAG AA en ambos modos.
genera el .gitignore para el proyecto
genera un Readme.MD con toda la explicación del proyecto, que y como se puede usar. 
Crea el docker para el proyecto, con un archivo docker-compose.yml que permita ejecutar el proyecto en local y comunicarse con el contenedor del backend.
---

## Consideraciones para Capacitor (Android)

- `capacitor.config.ts` configurado con `appId: 'com.panalera.app'` y `webDir: 'dist'`.
- El bloque `server.url` (para hot reload local) debe estar comentado en el build de producción.
- La variable de entorno `VITE_API_URL` en `.env.production` apunta a la URL del backend desplegado en Render.com.
- La variable en `.env.development` apunta a `http://localhost:8000/api/v1`.
- El cliente Axios debe leer la URL base desde `import.meta.env.VITE_API_URL`.

---

## Entregables esperados

Genera los siguientes archivos en el orden indicado:

1. `tailwind.config.ts` con los tokens de color y fuentes definidos.
2. `src/main.tsx` con QueryClientProvider, RouterProvider, Toaster de Sonner y ThemeProvider para dark mode.
3. `src/stores/authStore.ts` con Zustand y persist en sessionStorage.
4. `src/api/client.ts` con la instancia Axios y los dos interceptores completos (request + response con refresh).
5. `src/api/auth.ts`, `src/api/catalog.ts`, `src/api/inventory.ts`, `src/api/movements.ts`, `src/api/users.ts` con las funciones tipadas de cada módulo.
6. `src/types/*.ts` con todas las interfaces TypeScript derivadas del contrato de la API.
7. `src/router/index.tsx` con `createBrowserRouter`, todas las rutas y el componente `ProtectedRoute`.
8. `src/components/layout/AppLayout.tsx`, `Sidebar.tsx` y `Header.tsx`.
9. Cada feature en el orden: `auth` → `catalog` → `inventory` → `movements` → `reports` → `users`.
10. `capacitor.config.ts` y `.env.example`.

---

## Restricciones absolutas

- No usar `Create React App` ni `Next.js`. Solo Vite.
- No usar `Redux` ni `Context API` para estado global. Solo Zustand.
- No usar `useEffect` para fetch de datos. Solo TanStack Query.
- No usar `any` en TypeScript. Activar `strict: true` en `tsconfig.json`.
- No usar librerías de componentes distintas a shadcn/ui + Lucide. No MUI, no Ant Design, no Chakra.
- No hardcodear la URL del backend. Siempre desde variables de entorno.
- No almacenar tokens en `localStorage`.