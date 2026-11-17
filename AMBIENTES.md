# Ambientes — Portal de Actividades MAJA

Actualizado: 17/11/2026

El portal tiene dos ambientes. Ya no existe el servidor compartido de la red interna.

| | Local (desarrollo) | Producción |
|---|---|---|
| **Dirección** | http://localhost:5173 | https://portal-de-actividades-maja-1ohq.vercel.app |
| **Quién lo ve** | Solo quien lo corre en su Mac | Todo el equipo |
| **Para qué sirve** | Hacer y probar cambios antes de subirlos | Uso real del portal |
| **Dónde corre** | Mac de cada desarrollador | Vercel |
| **Backend (API)** | Local en Docker: http://localhost:8000 | https://portal-de-actividades-maja.vercel.app |
| **Base de datos** | PostgreSQL local en Docker, **solo datos de ejemplo** | Supabase, **datos reales** |
| **Se actualiza** | Al instante, al guardar un archivo | Cuando se sube un cambio a GitHub y Vercel lo despliega |

> **Regla:** los datos de cada ambiente están aislados en ambos sentidos.
> - El local no lee ni usa datos de producción: solo datos de ejemplo y de prueba.
> - Nada de los datos locales se sube a producción. Lo único que viaja es código, a través de git.

## Local (desarrollo)

### Configuración (una sola vez)

Estos archivos no se suben a git; cada quien crea los suyos.

1. **`.env` en la raíz:** contraseña de la base de datos local (`POSTGRES_PASSWORD`; opcionales `POSTGRES_DB` y `POSTGRES_USER`).
2. **`backend/.env`:** `DATABASE_URL` apuntando al contenedor `db` (nunca a Supabase), `SECRET_KEY` propia, `CORS_ORIGINS=http://localhost,http://localhost:5173` y, si se quiere ver `/docs`, `MOSTRAR_DOCS=true`.
3. **`frontend/.env.development.local`:**

   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Opcional — `docker-compose.override.yml`:** solo si el puerto 5433 ya lo usa otro proyecto en tu Mac. Ejemplo:

   ```yaml
   services:
     db:
       ports: !override
         - "127.0.0.1:5434:5432"
     backend:
       ports: !override
         - "127.0.0.1:8000:8000"
   ```

   Para que git lo ignore solo en tu Mac: `echo "docker-compose.override.yml" >> .git/info/exclude`.

### Primera vez: crear tablas y cargar datos de ejemplo

Desde la raíz del repo:

```bash
docker compose up -d db
docker compose run --rm backend alembic upgrade head
docker compose run --rm -e PERMITIR_SEED_LOCAL=1 backend python seed_local.py
```

`seed_local.py` exige `PERMITIR_SEED_LOCAL=1`, solo corre contra la base local (se detiene si detecta otro servidor) y solo si la base no tiene usuarios.

### Día a día

```bash
# En la raíz: API y base de datos
docker compose up -d db backend

# En frontend/: pantallas
npm run dev -- --port 5173
```

### Cuentas de prueba

Todas usan la contraseña `Prueba123!` (ficticia, solo existe en la base local).

| Cuenta | Rol | Área |
|---|---|---|
| admin@example.com | Administrador | QA |
| qa1@example.com, qa2@example.com | Usuario | QA |
| dev1@example.com | Usuario | Desarrollo |
| diseno1@example.com | Usuario | Diseño |
| sinarea@example.com | Usuario | Sin área |

### Volver a empezar con datos limpios

```bash
docker compose build backend    # necesario si cambió seed_local.py o cualquier archivo del backend
docker compose down -v          # borra la base local (solo la de Docker)
docker compose up -d db
docker compose run --rm backend alembic upgrade head
docker compose run --rm -e PERMITIR_SEED_LOCAL=1 backend python seed_local.py
```

## Producción

Frontend y backend están en Vercel; la base de datos es Supabase.

### Cómo llega un cambio a producción

1. **Desarrollo en local**, con datos de ejemplo.
2. **Auditoría antes del commit.** Se revisa el cambio antes de confirmarlo.
3. **Commit y push.** Al subirlo, Vercel lo despliega automáticamente.

Desde el local nunca se ejecuta nada contra producción: ni scripts, ni migraciones, ni cargas de datos. Las migraciones de Alembic son código y viajan en el commit como cualquier otro cambio. `seed_local.py` se niega a correr fuera de la base local.

## Si algo no carga en local

| Síntoma | Causa probable |
|---|---|
| localhost:5173 no abre | Vite no está corriendo (`npm run dev` en `frontend/`) |
| El portal abre, pero el login se queda cargando | La API local no está levantada (`docker compose up -d db backend`) o `VITE_API_URL` no apunta a `http://localhost:8000` |
| Error "port is already allocated" al levantar Docker | Otro proyecto usa ese puerto; usar `docker-compose.override.yml` (ver arriba) |
| Usuario o contraseña incorrectos | Faltan los datos de ejemplo (`seed_local.py`) |
| Después de cambiar un `.env` no se nota el cambio | Reiniciar Vite o `docker compose up -d --force-recreate backend` |
| Un cambio en el backend o en `seed_local.py` no se refleja | La imagen guarda una copia del código: `docker compose build backend` y volver a levantarlo |
