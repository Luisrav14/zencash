# ZenCash

ZenCash es una PWA personal de finanzas: registra ingresos, gastos, cuentas, presupuestos por sobres y "próximos pagos" (pagos que aún no afectan tu balance pero ya están comprometidos). Está pensada para instalarse en el teléfono, funcionar sin conexión y publicarse como proyecto de portafolio.

## ¿Qué incluye?

- **Multiusuario** con registro/login por email + contraseña (JWT en cookies httpOnly).
- **Categorías con subcategorías infinitas** (self-relation `parentId`, sin tabla aparte), con categorías básicas precargadas al registrarte.
- **Cuentas** (efectivo / tarjeta / banco) para agrupar movimientos además de por categoría.
- **Movimientos** (ingreso/egreso) con monto, fecha, cuenta, categoría, nota y tags.
- **Presupuesto por sobres** (budget mensual por categoría).
- **Próximos pagos** ("el limbo"): pagos con fecha que no impactan tu saldo hasta marcarse como pagados.
- **Offline-first**: IndexedDB (Dexie) + cola de sincronización + Service Worker, para que la app funcione sin internet y sincronice al reconectar.

## Stack técnico

Monolito en **Next.js (App Router)**, sin backend separado y sin servicios codeless (Supabase/Firebase):

- **Next.js 16** + React 19 + TypeScript, Tailwind v4 (diseño fintech minimalista, mobile-first).
- **Prisma 6** + **SQLite** como base de datos (archivo local `prisma/dev.db`, cero infraestructura extra).
- **zod** para validación de entrada en los controllers.
- **jose** + cookies httpOnly para JWT (access token de 15 min + refresh token de 30 días).
- **bcryptjs** para el hash de contraseñas.
- **Dexie** (IndexedDB) para persistencia local y **TanStack Query** para el estado de datos remotos.
- **lucide-react** para iconografía.

### Arquitectura del backend (capas separadas dentro del monolito)

```
src/app/api/**              → rutas HTTP (route handlers de Next.js)
src/server/controllers/**   → parsea el request, valida con zod, arma la respuesta
src/server/services/**      → lógica de negocio pura (sin saber de HTTP)
src/server/repositories/**  → única capa que toca Prisma
src/server/middlewares/**   → withAuth: verifica el JWT e inyecta el userId
```

### Estructura de carpetas

```
prisma/schema.prisma          Modelo de datos (User, Category, Account, Transaction, Budget, UpcomingPayment)
src/app/
  (auth)/login, register      Rutas públicas de autenticación
  (app)/dashboard, ...         Rutas protegidas (requieren sesión), con bottom nav mobile
  api/**                       Endpoints REST protegidos con withAuth
src/server/                   Controllers, services, repositories, middlewares
src/lib/                      prisma.ts, jwt.ts, hash.ts, utils.ts
src/lib/client/               db.ts (Dexie), syncManager.ts, queryClient.ts, authClient.ts, useSession.ts
src/components/ui             Button, Card, Input
src/components/layout          TopBar, BottomNav
public/                       manifest.json, sw.js, icon.svg (assets de la PWA)
```

## Cómo correrlo

### Requisitos

- Node.js 20+
- pnpm

### Pasos

1. Instala dependencias:

   ```bash
   pnpm install
   ```

2. Copia las variables de entorno (ya viene un `.env` de ejemplo funcional para desarrollo local):

   ```bash
   cp .env.example .env
   ```

3. Crea la base de datos SQLite y aplica las migraciones:

   ```bash
   pnpm prisma:migrate
   ```

4. Levanta el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000), crea una cuenta desde "Crear cuenta gratis" y entra al dashboard.

> El Service Worker de la PWA solo se registra en producción (`pnpm build && pnpm start`) para evitar problemas de caché durante el desarrollo con Turbopack.

### Scripts disponibles

| Comando                | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `pnpm dev`             | Servidor de desarrollo (Turbopack)       |
| `pnpm build`           | Build de producción                      |
| `pnpm start`           | Sirve el build de producción             |
| `pnpm lint`            | Linter (ESLint)                          |
| `pnpm prisma:generate` | Regenera el cliente de Prisma            |
| `pnpm prisma:migrate`  | Crea/aplica migraciones (dev)            |
| `pnpm prisma:studio`   | Abre Prisma Studio para ver/editar datos |

## Estado del proyecto

Este es el andamiaje base: autenticación funcional, modelo de datos completo y CRUD por capas para categorías, cuentas, movimientos, presupuestos y próximos pagos vía API. Las pantallas de `(app)` (movimientos, sobres, próximos pagos, ajustes) son placeholders listos para conectarse a los endpoints y a Dexie/TanStack Query.
