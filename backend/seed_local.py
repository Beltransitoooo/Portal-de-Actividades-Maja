"""Carga datos de EJEMPLO en la base de datos LOCAL (Docker) para desarrollo de frontend.

Uso (desde la raíz del repo, con la BD local levantada):
    docker compose run --rm -e PERMITIR_SEED_LOCAL=1 backend python seed_local.py

Reglas de seguridad:
- Exige la confirmación explícita PERMITIR_SEED_LOCAL=1.
- Solo corre si todos los hosts de DATABASE_URL son locales (db, localhost, 127.0.0.1),
  incluidos los parámetros ?host= / ?hostaddr=. Se niega con Supabase, ?service= o cualquier otro servidor.
- Solo corre si la tabla de usuarios está vacía (no mezcla con datos existentes).
- Todos los nombres y correos son ficticios (dominio reservado example.com).
"""
import os
import sys
from datetime import date, datetime, timedelta
from urllib.parse import urlparse, parse_qs

from app.config import settings

HOSTS_LOCALES = {"db", "localhost", "127.0.0.1"}


def _hosts_destino(url: str) -> list:
    """Todos los hosts a los que podría conectarse el driver.

    libpq permite cambiar el destino con parámetros (?host=, ?hostaddr=, varios hosts separados
    por coma); por eso no basta con revisar el host de la URL.
    """
    partes = urlparse(url)
    query = parse_qs(partes.query)
    hosts = [partes.hostname or ""]
    for clave in ("host", "hostaddr"):
        for valor in query.get(clave, []):
            hosts.extend(h.strip() for h in valor.split(","))
    return hosts


# Confirmación explícita: un túnel o port-forward a una BD remota también se ve como "localhost"
if os.getenv("PERMITIR_SEED_LOCAL") != "1":
    sys.exit("ABORTADO: falta PERMITIR_SEED_LOCAL=1. Úsalo solo contra la BD local de Docker.")

_url = settings.DATABASE_URL
_hosts = _hosts_destino(_url)
_no_locales = [h for h in _hosts if h not in HOSTS_LOCALES]
if _no_locales or "supabase" in _url.lower() or "service" in parse_qs(urlparse(_url).query):
    sys.exit(f"ABORTADO: DATABASE_URL no es local (hosts {_no_locales or _hosts}). Este script solo se usa en la BD de Docker.")

from app import models, security  # noqa: E402
from app.database import SessionLocal  # noqa: E402

# Contraseña de las cuentas de prueba (solo local). Se puede cambiar con SEED_PASSWORD.
CONTRASENA = os.getenv("SEED_PASSWORD", "Prueba123!")


def main():
    db = SessionLocal()
    try:
        if db.query(models.Usuario).count() > 0:
            sys.exit("ABORTADO: la tabla usuarios ya tiene datos. Para recargar, borra el volumen de la BD local.")

        hash_ = security.hash_contrasena(CONTRASENA)
        hoy = date.today()

        areas = {n: models.Area(nombre=n, activa=True) for n in ("QA", "Desarrollo", "Diseño")}
        db.add_all(areas.values())
        db.flush()

        def usuario(correo, nombre, area=None, admin=False):
            u = models.Usuario(usuario=correo, name_users=nombre, contrasena=hash_, es_admin=admin,
                               area_id=areas[area].id if area else None)
            db.add(u)
            return u

        admin = usuario("admin@example.com", "Admin Prueba", "QA", admin=True)
        qa1 = usuario("qa1@example.com", "QA Prueba Uno", "QA")
        qa2 = usuario("qa2@example.com", "QA Prueba Dos", "QA")
        dev1 = usuario("dev1@example.com", "Dev Prueba Uno", "Desarrollo")
        diseno1 = usuario("diseno1@example.com", "Diseño Prueba Uno", "Diseño")
        usuario("sinarea@example.com", "Usuario Sin Área")
        db.flush()

        lider_a = models.LiderTecnico(nombre="Líder Ejemplo A", activo=True)
        lider_b = models.LiderTecnico(nombre="Líder Ejemplo B", activo=True)
        db.add_all([lider_a, lider_b])
        db.flush()

        # (título, tipo, prioridad, estado, creador, asignado, área, inicio, vence, est_min, est_max, horas por día)
        datos = [
            ("Probar flujo de inicio de sesión", "Pruebas", "Alta", "EN_PROGRESO", admin, qa1, "QA", -3, 2, 4, 8, [2, 3]),
            ("Casos de prueba del módulo de horas", "Pruebas", "Media", "PENDIENTE", admin, qa1, "QA", 1, 5, 6, 10, []),
            ("Error al exportar reporte a CSV", "Bug", "Crítica", "BLOQUEADA", qa2, dev1, "Desarrollo", -5, -1, 2, 4, [1.5]),
            ("Regresión del cronograma", "Pruebas", "Alta", "EN_REVISION", admin, qa2, "QA", -6, 0, 5, 8, [3, 2, 2]),
            ("Ajustar validaciones del formulario", "Tarea", "Media", "EN_PROGRESO", admin, dev1, "Desarrollo", -2, 4, 3, 6, [2]),
            ("Revisar contraste de la paleta", "Tarea", "Baja", "PENDIENTE", admin, diseno1, "Diseño", 2, 9, 2, 3, []),
            ("Documentar plan de pruebas", "Tarea", "Media", "COMPLETADA", admin, qa2, "QA", -10, -4, 4, 6, [2, 3]),
            ("Botón de guardar no responde en móvil", "Bug", "Alta", "COMPLETADA", qa1, dev1, "Desarrollo", -8, -3, 1, 2, [1.5]),
            ("Actividad sin asignar (ejemplo)", "Tarea", "Baja", "PENDIENTE", admin, None, "QA", 3, 12, 1, 2, []),
            ("Actividad vencida (ejemplo)", "Tarea", "Alta", "PENDIENTE", admin, qa1, "QA", -9, -2, 2, 4, []),
        ]

        for i, (titulo, tipo, prio, estado, creador, asignado, area, ini, ven, emin, emax, horas) in enumerate(datos):
            act = models.Actividad(
                titulo=titulo,
                descripcion=f"Actividad de ejemplo para desarrollo local ({tipo.lower()}).",
                tipo_actividad=tipo,
                prioridad=prio,
                estado=estado,
                completada=estado == "COMPLETADA",
                creador_id=creador.id,
                asignado_a_id=asignado.id if asignado else None,
                area_id=areas[area].id,
                lider_catalogo_id=(lider_a if i % 2 == 0 else lider_b).id,
                fecha_inicio=hoy + timedelta(days=ini),
                fecha_vencimiento=hoy + timedelta(days=ven),
                estimacion_min_hrs=emin,
                estimacion_max_hrs=emax,
                motivo_bloqueo="Esperando ambiente de pruebas (ejemplo)" if estado == "BLOQUEADA" else None,
                horas_utilizadas=round(sum(horas), 2),  # siempre igual a la suma de registros
            )
            db.add(act)
            db.flush()

            quien = asignado or creador
            for d, h in enumerate(horas):
                db.add(models.RegistroHoras(actividad_id=act.id, fecha=hoy + timedelta(days=ini + d),
                                            horas=h, nota="Registro de ejemplo", usuario_id=quien.id))
            if horas:
                db.add(models.Comentario(actividad_id=act.id, usuario_id=quien.id,
                                         texto="Comentario de ejemplo.", url="https://example.com/evidencia"))
            # Bitácora con la misma forma que genera el backend: "creada" y luego cada transición
            momento = datetime.combine(hoy + timedelta(days=ini - 1), datetime.min.time()) + timedelta(hours=16)

            def bitacora(usuario_id, campo, anterior, nuevo, dia):
                db.add(models.HistorialActividad(actividad_id=act.id, usuario_id=usuario_id, campo=campo,
                                                 valor_anterior=anterior, valor_nuevo=nuevo,
                                                 creado=momento + timedelta(days=dia)))

            bitacora(creador.id, "creada", None, titulo, 0)
            for d, h in enumerate(horas):
                bitacora(quien.id, "horas", None, f"{h:g} h el {(hoy + timedelta(days=ini + d)).strftime('%d/%m/%Y')}", d + 1)
            transiciones = {
                "EN_PROGRESO": ["EN_PROGRESO"],
                "EN_REVISION": ["EN_PROGRESO", "EN_REVISION"],
                "BLOQUEADA": ["EN_PROGRESO", "BLOQUEADA"],
                "COMPLETADA": ["EN_PROGRESO", "EN_REVISION", "COMPLETADA"],
            }.get(estado, [])
            anterior = "PENDIENTE"
            for paso, nuevo in enumerate(transiciones, start=1):
                bitacora(quien.id, "estado", anterior, nuevo, paso)
                anterior = nuevo
            if estado == "COMPLETADA" and i % 2 == 0:
                # Ejemplo de reprogramación: el vencimiento se movió un día
                original = (hoy + timedelta(days=ven - 1)).isoformat()
                bitacora(creador.id, "fecha_vencimiento", original, act.fecha_vencimiento.isoformat(), 1)

        db.commit()
        print(f"Datos de ejemplo cargados: {len(areas)} áreas, 6 usuarios, 2 líderes, {len(datos)} actividades.")
        print("Cuentas: admin@example.com (admin), qa1@, qa2@, dev1@, diseno1@, sinarea@ (todas @example.com).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
