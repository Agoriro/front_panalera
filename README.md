# Sistema de Gestión Pañalera — Frontend

Este es el frontend del Sistema de Gestión para una Pañalera, desarrollado como una Single Page Application (SPA) con **React 19**, **Vite 6**, **TypeScript 5**, y **Tailwind CSS v4**. Está diseñado con un estilo moderno y premium, y configurado para funcionar tanto en computadoras de escritorio como en dispositivos móviles Android a través de **Capacitor v7**.

## Stack Tecnológico

- **Framework principal**: React 19
- **Compilador y Bundler**: Vite 6
- **Tipado**: TypeScript 5 (Strict Mode)
- **Diseño y Estilos**: Tailwind CSS v4 & shadcn/ui
- **Iconografía**: Lucide React
- **Navegación y Rutas**: React Router v7
- **Gestor de Estado del Servidor**: TanStack Query v5 (React Query)
- **Gestor de Estado Local**: Zustand v5
- **Formularios**: React Hook Form v7 + Zod v4 (Esquemas de Validación estrictos)
- **Cliente HTTP**: Axios v1 (Con interceptores para inyección JWT y refresco automático de token)
- **Reportes y Tablas**: TanStack Table v8, Recharts v2 (Gráficos), SheetJS (Exportar a Excel), y `@react-pdf/renderer` (Exportar a PDF)
- **Dispositivos Móviles**: Capacitor v7 (Android)

---

## Estructura del Directorio

```
src/
├── api/          # Peticiones HTTP centralizadas (Axios) e Interceptores
├── components/   # Componentes globales de interfaz (ui) y diseño de Shell (layout)
├── features/     # Módulos del negocio (auth, catalog, inventory, movements, reports, users)
├── hooks/        # Hooks personalizados reutilizables
├── lib/          # Utilidades comunes de formateo y manejo de errores (cn, formatCurrency)
├── router/       # Router central y protección de accesos por roles (ProtectedRoute)
├── stores/       # Estados globales usando Zustand (sesiones de usuario, sidebar)
├── types/        # Interfaces TypeScript para contratos de la API
└── main.tsx      # Punto de entrada de la aplicación
```

---

## Requisitos Previos

Asegúrate de contar con lo siguiente instalado en tu entorno de desarrollo:
- **Node.js**: v20 o superior
- **npm**: v10 o superior
- **Android Studio** (si deseas realizar compilación móvil para Android)
- **Docker** y **Docker Compose** (si prefieres la ejecución mediante contenedores)

---

## Configuración y Ejecución Local

### 1. Clonar e Instalar Dependencias

Navega a la carpeta del proyecto e instala las dependencias (se incluye un archivo `.npmrc` configurado para resolver advertencias de dependencias sin problemas):
```bash
npm install
```

### 2. Variables de Entorno

Crea un archivo `.env.development` en la raíz (puedes basarte en `.env.example`):
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Iniciar Servidor de Desarrollo

Inicia el entorno local de desarrollo con Vite:
```bash
npm run dev
```
La aplicación estará disponible por defecto en: `http://localhost:5173`.

---

## Ejecución en Contenedores (Docker)

Puedes compilar e iniciar la aplicación utilizando Docker y Nginx para servir los archivos estáticos de producción:

```bash
docker-compose up --build
```
Una vez iniciado, la aplicación estará disponible en `http://localhost:3000`.

---

## Compilación y Despliegue en Android (Capacitor)

La aplicación está preconfigurada con Capacitor para crear un paquete APK nativo de Android.

### 1. Compilar el Frontend
Genera la versión estática de producción de React:
```bash
npm run build
```

### 2. Sincronizar con Capacitor
Agrega la plataforma Android e inyecta los estáticos generados en `dist/`:
```bash
npx cap add android
npx cap sync
```

### 3. Abrir en Android Studio
Abre el proyecto nativo generado en Android Studio para probarlo en un emulador o dispositivo real:
```bash
npx cap open android
```

---

## Políticas de Acceso y Roles

El sistema implementa rutas privadas y seguras. Al iniciar sesión, los usuarios se redirigen de forma automática según su rol:
- **Admin**: Acceso completo a Dashboard, Inventario, Catálogos, Compras, Ventas, Reportes de período, Existencias, Proyecciones y Gestión de Usuarios.
- **Vendedor**: Redirección directa a la pantalla de Ventas. El acceso a los demás módulos administrativos está denegado y se bloquea mediante el guard `ProtectedRoute` con alertas Sonner.
