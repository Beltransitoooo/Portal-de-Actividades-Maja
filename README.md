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

---
