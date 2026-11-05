# FieldOps — arquitectura y decisiones
## Contexto
FieldOps es un MVP de gestión de órdenes para administradores, supervisores y técnicos. El monolito modular NestJS es el único dueño de la base de datos PostgreSQL; el servicio ASP.NET Core computa indicadores sin conectarse directamente a la base. React Native consume exclusivamente HTTP desde la API.
## Componentes
- NestJS: JWT, roles, usuarios, órdenes, historial de cambios y gateway de reportes.
- PostgreSQL: usuarios, órdenes y eventos. Los UUID y claves foráneas mantienen integridad.
- Reporting C#: agrega métricas SLA de los últimos 5000 registros, sin persistencia.
- Expo: inicio de sesión, listado, creación y cambio de estados, reportes básicos.
## Contratos
- POST /auth/login es público; GET /auth/me requiere Bearer.
- GET /work-orders devuelve hasta 200 órdenes; técnico ve solo las asignadas.
- POST /work-orders requiere ADMIN o SUPERVISOR.
- PATCH /work-orders/:id permite solo modificar estado si el usuario es técnico asignado; administradores y supervisores pueden editar otros campos.
- GET /work-orders/:id/events expone historial a usuarios con acceso.
- GET /reports/overview requiere ADMIN o SUPERVISOR; Nest llama a C# con token de servicio y timeout.
## Estados
PENDING -> IN_PROGRESS -> COMPLETED
PENDING -> CANCELLED
IN_PROGRESS -> CANCELLED
No se permiten modificaciones de órdenes cerradas.
## Decisiones
- SQL parametrizado con pg, sin ORM, para mantener la configuración simple y transparentar consultas.
- Transacción con SELECT FOR UPDATE para garantizar transiciones de estado sin carreras.
- C# no conoce contraseñas ni tiene acceso a DB.
- Docker Compose únicamente para desarrollo local, sin TLS ni alta disponibilidad.
## Riesgos pendientes antes de producción
- Rate limiting de inicio de sesión y protección contra fuerza bruta.
- Refresh-token rotatorio, invalidación inmediata y MFA.
- Gestión de secretos, backups, recuperación y TLS.
- Paginación real, filtros, trazabilidad adicional, métricas SLA acordadas y pruebas de integración con PostgreSQL.
- Pruebas de accesibilidad, E2E móvil, revisión de dependencia y observabilidad.
- La app móvil usa HTTP únicamente para desarrollo LAN; en producción debe utilizar HTTPS.
