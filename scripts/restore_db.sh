#!/usr/bin/env bash
# Restaura un respaldo en una base de datos NUEVA del contenedor local (no pisa la actual).
# Uso:   ./scripts/restore_db.sh backups/archivo.dump [nombre_bd_destino]
# Por defecto restaura en "restore_test", útil para comprobar que el respaldo sirve.
# Acepta respaldos locales y de Supabase (los que empiezan con "supabase_").
# Para sustituir la BD real, hazlo a mano y a propósito (ver README), nunca desde este script.
# Este script NUNCA escribe en Supabase.
set -euo pipefail

[ $# -ge 1 ] || { echo "Uso: $0 <archivo.dump> [bd_destino]" >&2; exit 1; }
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVO="$1"; DESTINO_BD="${2:-restore_test}"
PG_CLIENT_IMAGE="${PG_CLIENT_IMAGE:-postgres:17}"
cd "$RAIZ"
[ -s "$ARCHIVO" ] || { echo "ERROR: no existe o está vacío: $ARCHIVO" >&2; exit 1; }

if [ "$DESTINO_BD" = "portal_actividades" ]; then
  echo "ERROR: este script no restaura sobre portal_actividades." >&2; exit 1
fi

docker compose exec -T db sh -c "createdb -U \"\$POSTGRES_USER\" \"$DESTINO_BD\""

case "$(basename "$ARCHIVO")" in
  supabase_*|vercel_*)
    # El respaldo de Supabase se generó con un pg_dump más nuevo que el de la BD local:
    # el cliente nuevo lo convierte a SQL y el psql local lo aplica.
    # Se omiten "transaction_timeout" (la versión local de PostgreSQL no lo reconoce) y
    # "CREATE SCHEMA public" (la BD nueva ya trae ese esquema).
    docker run --rm -i "$PG_CLIENT_IMAGE" pg_restore --no-owner --no-privileges -f - < "$ARCHIVO" \
      | grep -vE '^(SET transaction_timeout|CREATE SCHEMA public;)' \
      | docker compose exec -T db sh -c "psql -q -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d \"$DESTINO_BD\"" > /dev/null
    ;;
  *)
    docker compose exec -T db sh -c "pg_restore -U \"\$POSTGRES_USER\" -d \"$DESTINO_BD\" --no-owner" < "$ARCHIVO"
    ;;
esac

echo "OK: respaldo restaurado en la BD '$DESTINO_BD'."
echo "Para borrarla: docker compose exec db sh -c 'dropdb -U \"\$POSTGRES_USER\" $DESTINO_BD'"
