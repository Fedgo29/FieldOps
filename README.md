# FieldOps
MVP full-stack de órdenes de trabajo: NestJS, PostgreSQL, React Native / Expo y servicio C# ASP.NET Core.

## Estado
Código de MVP integrado en rama de desarrollo. No publicar en producción sin pruebas de integración, seguridad y operación.

## Requisitos
- Docker Desktop con Compose
- Node.js 24 (para Expo y desarrollo NestJS)
- Expo Go en dispositivo, o emulador Android
- SDK .NET 10 opcional si se ejecuta reporting fuera de Docker

## Inicio rápido (Windows / PowerShell)
1. Copia `.env.example` a `.env` en la raíz.
2. Reemplaza `DB_PASSWORD`, `JWT_SECRET` (32+ caracteres) y `REPORTING_SERVICE_TOKEN` (24+ caracteres) por valores aleatorios y distintos. Para DB_PASSWORD usa caracteres URL-safe (letras, números, guiones).
3. En raíz: `docker compose up -d --build`
4. Configura el usuario inicial en PowerShell sin guardarlo en el repositorio:
   `$env:ADMIN_EMAIL="admin@fieldops.local"`
   `$env:ADMIN_PASSWORD="una-clave-aleatoria-fuerte"`
   `docker compose run --rm -e ADMIN_EMAIL -e ADMIN_PASSWORD api node scripts/seed-admin.mjs`
   `Remove-Item Env:ADMIN_PASSWORD`
5. Comprueba `http://localhost:3000/health` (debe responder status ok). La API sólo está expuesta en localhost en Docker.

## API
POST /auth/login — `{"email":"admin@fieldops.local","password":"..."}`.
Usa el `accessToken` como header `Authorization: Bearer <token>`.

- GET /auth/me
- GET /users (ADMIN)
- POST /users (ADMIN): `{"fullName":"Técnico Uno","email":"tech@example.com","password":"clave-larga-unica","role":"TECHNICIAN"}`
- PATCH /users/:id/status (ADMIN): `{"active":false}`
- GET /work-orders
- POST /work-orders (ADMIN o SUPERVISOR): `{"title":"Revisar servidor","priority":"HIGH","technicianId":"<uuid>"}`
- GET /work-orders/:id
- PATCH /work-orders/:id: `{"status":"IN_PROGRESS"}`
- GET /work-orders/:id/events
- GET /reports/overview (ADMIN o SUPERVISOR)

## Mobile
`cd apps/mobile`; `npm install`; copia `.env.example` a `.env` y cambia `EXPO_PUBLIC_API_URL` por el IPv4 LAN de tu computadora, por ejemplo `http://192.168.1.25:3000`. **La configuración Compose escucha sólo en 127.0.0.1**, por lo que debes habilitar acceso seguro desde el dispositivo para pruebas LAN (véase abajo).
`npx expo start`.
Para probar en teléfono conectado a la misma red, cambia temporalmente el mapeo de `api` en `docker-compose.yml` de `127.0.0.1:3000:3000` a `3000:3000`, comprueba el firewall y usa sólo redes de confianza. Restáuralo al terminar.
En Android emulador usa `http://10.0.2.2:3000` si corresponde al emulador Android estándar. Nunca expongas API por HTTP a Internet.

## Pruebas y build
`cd apps/api`; `npm install`; `npm run build`; `npm run test -- --runInBand`.
`cd services/reporting`; `dotnet build`.
`cd apps/mobile`; `npm install`; `npx tsc --noEmit`.
Para ver el estado de los servicios: `docker compose ps` y `docker compose logs api`.

## Limitaciones
El historial registra cambios de estado, pero no cambios de campos descriptivos. Los reportes tienen SLA demostrativos (4h/8h/24h/72h según prioridad) y sólo agregan los últimos 5000 registros. No hay adjuntos, notificaciones push, refresh tokens ni modo offline. Más información en docs/ARCHITECTURE.md.
