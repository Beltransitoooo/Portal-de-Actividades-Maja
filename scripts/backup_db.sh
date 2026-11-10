#!/usr/bin/env bash
# Respaldo de la base de datos del Portal de Actividades.
#
# Uso:
#   ./scripts/backup_db.sh           BD local (contenedor "db" de docker compose)
#   ./scripts/backup_db.sh supabase  BD de producción en Supabase (la que usa la app en Vercel)
#
# Salida (formato custom de pg_dump):
#   backups/portal_actividades_AAAA-MM-DD_HHMMSS.dump          (local)
#   backups/supabase_portal_actividades_AAAA-MM-DD_HHMMSS.dump (Supabase)
#
# Retención: conserva los últimos $RETENCION_DIAS días (por defecto 14), por separado para cada origen.
#
# Supabase: la conexión se toma de la variable SUPABASE_DB_URL o, si no existe, del archivo
# .env.backup en la raíz del proyecto (ignorado por git), con una sola línea entre comillas simples:
#   SUPABASE_DB_URL='<cadena de conexión de Supabase; es el mismo DATABASE_URL del backend en Vercel>'
# Cópiala de Supabase (botón Connect) o de Vercel (proyecto del backend > Settings > Environment Variables).
# Úsalo tal cual. Con el puerto 6543 (pooler en modo transacción) el respaldo funciona en este
# proyecto (probado el 10/11/2026); aun así, comprueba cada tanto que restaura con restore_db.sh.
# El prefijo "+psycopg2" se quita solo.
# Solo se respalda el esquema "public" (las tablas de la app).
#
# Nota: los respaldos contienen datos personales (LFPDPPP). No los subas a git ni los compartas por chat o correo.
set -euo pipefail

ORIGEN="${1:-local}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="${BACKUP_DIR:-$RAIZ/backups}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
SERVICIO="${DB_SERVICE:-db}"
# Cliente de PostgreSQL para el respaldo remoto: pg_dump debe ser igual o más nuevo que el servidor.
PG_CLIENT_IMAGE="${PG_CLIENT_IMAGE:-postgres:17}"
FECHA="$(date +%Y-%m-%d_%H%M%S)"

cd "$RAIZ"
mkdir -p "$DESTINO"
chmod 700 "$DESTINO"

case "$ORIGEN" in
  local)
    PREFIJO="portal_actividades"
    if ! docker compose ps --status running --services | grep -qx "$SERVICIO"; then
      echo "ERROR: el servicio '$SERVICIO' no está corriendo. Ejecuta: docker compose up -d" >&2
      exit 1
    fi
    ;;
  supabase)
    PREFIJO="supabase_portal_actividades"
    if [ -z "${SUPABASE_DB_URL:-}" ] && [ -f "$RAIZ/.env.backup" ]; then
      # shellcheck disable=SC1091
      set -a; . "$RAIZ/.env.backup"; set +a
    fi
    # También acepta el nombre PROD_DB_URL en .env.backup
    SUPABASE_DB_URL="${SUPABASE_DB_URL:-${PROD_DB_URL:-}}"
    if [ -z "${SUPABASE_DB_URL:-}" ]; then
      echo "ERROR: falta SUPABASE_DB_URL (variable de entorno o archivo .env.backup). Ver encabezado del script." >&2
      exit 1
    fi
    # libpq no entiende el prefijo de SQLAlchemy
    PGURL="${SUPABASE_DB_URL/postgresql+psycopg2:/postgresql:}"
    case "$PGURL" in
      *:6543/*) echo "Nota: puerto 6543 (modo transacción). Funciona, pero comprueba el respaldo con restore_db.sh." >&2 ;;
    esac
    export PGURL
    ;;
  *)
    echo "Uso: $0 [local|supabase]" >&2
    exit 1
    ;;
esac

ARCHIVO="$DESTINO/${PREFIJO}_${FECHA}.dump"
TMP="$ARCHIVO.tmp"
trap 'rm -f "$TMP"' EXIT

if [ "$ORIGEN" = "local" ]; then
  # pg_dump corre dentro del contenedor con el usuario y la BD de sus variables de entorno; sin contraseñas aquí.
  docker compose exec -T "$SERVICIO" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$TMP"
  validar() { docker compose exec -T "$SERVICIO" pg_restore --list < "$1" > /dev/null; }
else
  # La URL viaja al contenedor como variable (-e PGURL), así no aparece en la línea de comandos.
  docker run --rm -i -e PGURL "$PG_CLIENT_IMAGE" \
    sh -c 'pg_dump "$PGURL" -Fc --schema=public --no-owner --no-privileges' > "$TMP"
  validar() { docker run --rm -i "$PG_CLIENT_IMAGE" pg_restore --list < "$1" > /dev/null; }
fi

# Valida que el archivo no esté vacío y que pg_restore pueda leerlo
if [ ! -s "$TMP" ] || ! validar "$TMP"; then
  echo "ERROR: el respaldo salió vacío o corrupto; se descartó." >&2
  exit 1
fi

mv "$TMP" "$ARCHIVO"
chmod 600 "$ARCHIVO"

# Rotación: borra respaldos de este origen con más de N días
find "$DESTINO" -name "${PREFIJO}_*.dump" -type f -mtime +"$RETENCION_DIAS" -delete

echo "OK: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"
