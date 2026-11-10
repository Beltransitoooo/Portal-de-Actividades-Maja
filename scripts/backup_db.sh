#!/usr/bin/env bash
# Respaldo de la base de datos del Portal de Actividades (PostgreSQL en Docker).
# Uso:   ./scripts/backup_db.sh            (desde cualquier carpeta)
# Salida: backups/portal_actividades_AAAA-MM-DD_HHMMSS.dump (formato custom de pg_dump)
# Retención: conserva los últimos $RETENCION_DIAS días (por defecto 14).
# Nota: los respaldos contienen datos personales (LFPDPPP). No los subas a git ni los compartas por chat o correo.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="${BACKUP_DIR:-$RAIZ/backups}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
SERVICIO="${DB_SERVICE:-db}"

cd "$RAIZ"
mkdir -p "$DESTINO"
chmod 700 "$DESTINO"

# Verifica que el contenedor de la BD esté arriba
if ! docker compose ps --status running --services | grep -qx "$SERVICIO"; then
  echo "ERROR: el servicio '$SERVICIO' no está corriendo. Ejecuta: docker compose up -d" >&2
  exit 1
fi

ARCHIVO="$DESTINO/portal_actividades_$(date +%Y-%m-%d_%H%M%S).dump"
TMP="$ARCHIVO.tmp"

# pg_dump corre dentro del contenedor, con el usuario y la BD definidos por sus variables de entorno.
# No se escribe ninguna contraseña en este script.
docker compose exec -T "$SERVICIO" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$TMP"

# Valida que el archivo no esté vacío y que pg_restore pueda leerlo
if [ ! -s "$TMP" ] || ! docker compose exec -T "$SERVICIO" pg_restore --list < "$TMP" > /dev/null; then
  rm -f "$TMP"
  echo "ERROR: el respaldo salió vacío o corrupto; se descartó." >&2
  exit 1
fi

mv "$TMP" "$ARCHIVO"
chmod 600 "$ARCHIVO"

# Rotación: borra respaldos con más de N días
find "$DESTINO" -name 'portal_actividades_*.dump' -type f -mtime +"$RETENCION_DIAS" -delete

echo "OK: $ARCHIVO ($(du -h "$ARCHIVO" | cut -f1))"
