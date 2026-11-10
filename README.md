# 🚀 Portal de Actividades Maja - Backend API

API RESTful para la gestión y asignación de tareas diarias en tiempo real. Diseñada con una arquitectura limpia en tres capas y control de acceso basado en roles (RBAC).


---


## ⚡ Características Principales

* **Autenticación Segura (JWT):** Inicio de sesión con cifrado mediante Passlib y Bcrypt.
* **Control de Acceso (RBAC):**
  * **Usuarios Estándar:** Creación, consulta y actualización de tareas generales.
  * **Administradores:** Asignación y reasignación exclusiva de tareas a miembros del equipo.
* **Base de Datos Relacional:** ORM integrado con SQLAlchemy e índices en PostgreSQL.
* **Validación Estricta:** Garantizada mediante esquemas de Pydantic.
* **Documentación Automática:** Swagger UI y ReDoc integrados nativamente.


---


## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
| --- | --- |
| Lenguaje | Python 3.10+ |
| Framework Web | FastAPI |
| ORM | SQLAlchemy |
| Base de Datos | PostgreSQL (psycopg2) |
| Seguridad | Passlib, PyJWT, Cryptography |
| Servidor ASGI | Uvicorn |


---


## 🔒 Rutas Principales

**Autenticación (`/auth`)**
* `POST /auth/registrar` - Registro de nuevos usuarios.
* `POST /auth/login` - Generación de Token JWT.

**Actividades (`/actividades`)**
* `GET /actividades/` - Listar todas las tareas (Requiere Auth).
* `POST /actividades/` - Crear tarea (Solo Admin asigna responsables).
* `PUT /actividades/{id}` - Actualizar estado o datos de tarea.
* `DELETE /actividades/{id}` - Eliminar tarea.


## 📂 Estructura del Proyecto

```text
backend/
├── app/
│   ├── routes/
│   │   ├── actividades.py
│   │   └── auth.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── security.py
├── main.py
└── requirements.txt
```

---


## 💾 Respaldos de la Base de Datos

Los scripts están en `scripts/` y requieren Docker. Los respaldos se guardan en `backups/` (ignorada por git) y se conservan 14 días.

> ⚠️ Los respaldos contienen datos personales (LFPDPPP). No los subas al repositorio ni los compartas por chat o correo.

**Respaldar**

```bash
./scripts/backup_db.sh           # BD local (contenedor "db")
./scripts/backup_db.sh supabase  # BD de producción en Supabase (la que usa la app en Vercel)
```

Para producción, crea en la raíz un archivo `.env.backup` (ignorado por git) con una sola línea:

```
SUPABASE_DB_URL='<cadena de conexión de Supabase>'
```

Cópiala de Supabase (botón **Connect**) o del `DATABASE_URL` del backend en Vercel; es la misma. Protege el archivo con `chmod 600 .env.backup`. Si prefieres no guardarlo en disco, exporta `SUPABASE_DB_URL` solo en la terminal.

**Respaldo automático cada 24 horas**

El servicio `backup` de `docker-compose.yml` respalda Supabase al arrancar y después cada 24 horas, con la misma retención de 14 días. No arranca con `docker compose up`; hay que pedirlo:

```bash
docker compose --profile backup up -d backup   # activar
docker compose logs backup                     # ver resultados
docker compose stop backup                     # detener
```

Solo respalda mientras Docker está corriendo en el equipo que lo activó.

**Comprobar que un respaldo sirve**

```bash
./scripts/restore_db.sh backups/<archivo>.dump            # restaura en la BD local "restore_test"
docker compose exec db sh -c 'dropdb -U "$POSTGRES_USER" restore_test'   # bórrala al terminar
```

`restore_db.sh` nunca escribe en producción ni sobre `portal_actividades`. Restaurar la BD real es un proceso manual: consúltalo con el administrador de la BD.

---

## ⚙️ Variables de entorno del backend (seguridad)

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `DOMINIOS_REGISTRO` | `majasportswear.com` | Dominios de correo permitidos en el registro (separados por coma). |
| `INTENTOS_LOGIN_MAX` | `5` | Intentos fallidos antes de bloquear temporalmente la cuenta. |
| `MINUTOS_BLOQUEO_LOGIN` | `15` | Minutos de bloqueo tras superar los intentos. Un enlace de restablecimiento lo levanta. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Vigencia de la sesión (8 h). |
| `MOSTRAR_DOCS` | `false` | Publica `/docs`, `/redoc` y `/openapi.json`. Úsalo solo en local (`MOSTRAR_DOCS=true`). |

> La migración `d9e3f4a5b6c7` agrega las columnas del bloqueo de login y limpia estimaciones antiguas inválidas. Debe aplicarse (`alembic upgrade head`) antes de desplegar el backend.
