#!/bin/sh
# Respaldo automático de la BD de Supabase cada 24 horas.
# Lo ejecuta el servicio "backup" de docker-compose (perfil "backup"); no se usa a mano.
#   Activar:   docker compose --profile backup up -d backup
#   Ver log:   docker compose logs backup
#   Detener:   docker compose stop backup
# La conexión sale de .env.backup (SUPABASE_DB_URL o PROD_DB_URL). Los archivos quedan en backups/.
set -eu

INTERVALO="${BACKUP_INTERVALO_SEG:-86400}"
RETENCION_DIAS="${RETENCION_DIAS:-14}"
DESTINO=/backups

URL="${SUPABASE_DB_URL:-${PROD_DB_URL:-}}"
if [ -z "$URL" ]; then
  echo "ERROR: falta SUPABASE_DB_URL en .env.backup; el servicio se detiene." >&2
  exit 1
fi
# libpq no entiende el prefijo de SQLAlchemy
PGURL=$(printf '%s' "$URL" | sed 's#^postgresql+psycopg2:#postgresql:#')
export PGURL

respaldar() {
  archivo="$DESTINO/supabase_portal_actividades_$(date +%Y-%m-%d_%H%M%S).dump"
  tmp="$archivo.tmp"
  if pg_dump "$PGURL" -Fc --schema=public --no-owner --no-privileges > "$tmp" \
    && [ -s "$tmp" ] && pg_restore --list "$tmp" > /dev/null; then
    mv "$tmp" "$archivo"
    chmod 600 "$archivo"
    find "$DESTINO" -name 'supabase_portal_actividades_*.dump' -type f -mtime +"$RETENCION_DIAS" -delete
    echo "$(date '+%d/%m/%Y %H:%M:%S') OK: $(basename "$archivo") ($(du -h "$archivo" | cut -f1))"
  else
    rm -f "$tmp"
    echo "$(date '+%d/%m/%Y %H:%M:%S') ERROR: el respaldo falló; se reintenta en el siguiente ciclo." >&2
  fi
}

while true; do
  respaldar
  sleep "$INTERVALO"
done
