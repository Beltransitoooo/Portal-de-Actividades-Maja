#!/usr/bin/env bash
# Restaura un respaldo en una base de datos NUEVA (no pisa la actual).
# Uso:   ./scripts/restore_db.sh backups/archivo.dump [nombre_bd_destino]
# Por defecto restaura en "restore_test", útil para comprobar que el respaldo sirve.
# Para sustituir la BD real, hazlo a mano y a propósito (ver README), nunca desde este script.
set -euo pipefail

[ $# -ge 1 ] || { echo "Uso: $0 <archivo.dump> [bd_destino]" >&2; exit 1; }
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVO="$1"; DESTINO_BD="${2:-restore_test}"
cd "$RAIZ"
[ -s "$ARCHIVO" ] || { echo "ERROR: no existe o está vacío: $ARCHIVO" >&2; exit 1; }

if [ "$DESTINO_BD" = "portal_actividades" ]; then
  echo "ERROR: este script no restaura sobre portal_actividades." >&2; exit 1
fi

docker compose exec -T db sh -c "createdb -U \"\$POSTGRES_USER\" \"$DESTINO_BD\""
docker compose exec -T db sh -c "pg_restore -U \"\$POSTGRES_USER\" -d \"$DESTINO_BD\" --no-owner" < "$ARCHIVO"
echo "OK: respaldo restaurado en la BD '$DESTINO_BD'."
echo "Para borrarla: docker compose exec db sh -c 'dropdb -U \"\$POSTGRES_USER\" $DESTINO_BD'"
