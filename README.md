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

| Comando                      | Descripción                                         |
| ---------------------------- | --------------------------------------------------- |
| `pnpm dev`                   | Servidor de desarrollo (Turbopack)                  |
| `pnpm build`                 | Build de producción                                 |
| `pnpm start`                 | Sirve el build de producción                        |
| `pnpm lint`                  | Linter (ESLint)                                     |
| `pnpm prisma:generate`       | Regenera el cliente de Prisma                       |
| `pnpm prisma:migrate`        | Crea/aplica migraciones (dev)                       |
| `pnpm prisma:studio`         | Abre Prisma Studio para ver/editar datos            |
| `pnpm prisma:migrate:deploy` | Aplica migraciones ya generadas (uso en producción) |

## Deploy

### Railway (recomendado, sin Docker)

El repo incluye [`railway.json`](railway.json) usando el builder **Nixpacks**, que detecta `pnpm` automáticamente. Pasos:

1. Crea el proyecto en Railway y conéctalo a este repositorio.
2. Define las variables de entorno en el servicio: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` y `DATABASE_URL`.
3. Como SQLite es un archivo local, el filesystem de Railway **no persiste** entre deploys a menos que agregues un [Volume](https://docs.railway.com/reference/volumes). Crea un volumen (por ejemplo montado en `/data`) y usa `DATABASE_URL=file:/data/prod.db`.
4. Railway ejecuta `pnpm install` (dispara `postinstall` → `prisma generate`) y `pnpm build`. Al arrancar corre el `startCommand` definido en `railway.json`: `pnpm prisma:migrate:deploy && pnpm start`, que aplica migraciones pendientes antes de levantar el servidor.

> Si ves el error `packages field missing or empty` al desplegar: pnpm exige que `pnpm-workspace.yaml` tenga la clave `packages` (aunque el repo no sea un monorepo). Ya está corregido con `packages: ["."]` en [`pnpm-workspace.yaml`](pnpm-workspace.yaml), además de declarar `pnpm.onlyBuiltDependencies` en `package.json` para que los `postinstall` de Prisma/sharp corran sin pedir aprobación interactiva en CI.

### Contenerización (Docker)

También puedes desplegar con el [`Dockerfile`](Dockerfile) incluido (build multi-stage: deps → build → runtime, basado en `node:20-alpine`):

```bash
docker build -t zencash .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  -e JWT_ACCESS_SECRET="cambia-esto" \
  -e JWT_REFRESH_SECRET="cambia-esto" \
  -v zencash-data:/app/prisma \
  zencash
```

El `CMD` del contenedor corre `prisma migrate deploy` antes de `next start`. Monta un volumen en `/app/prisma` (o la ruta que uses en `DATABASE_URL`) para que la base SQLite persista entre reinicios del contenedor. En Railway, si eliges el builder **Dockerfile** en vez de Nixpacks, se usa este mismo archivo automáticamente.
