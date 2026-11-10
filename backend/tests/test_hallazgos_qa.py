"""Regresiones de los hallazgos de QA del 10/11/2026."""
from datetime import datetime, timedelta

from app import models

CLAVE = "Prueba123!"


# ---------- Registro solo con dominio corporativo ----------
def test_registro_solo_dominio_corporativo(client):
    base = {"name_users": "Persona Prueba", "contrasena": CLAVE}
    r = client.post("/auth/registrar", json={**base, "usuario": "alguien@example.com"})
    assert r.status_code == 400
    r = client.post("/auth/registrar", json={**base, "usuario": "Alguien@MajaSportswear.com"})
    assert r.status_code == 201 and r.json()["area_id"] is None


# ---------- Sin área no es un área compartida ----------
def test_sin_area_no_ve_lo_de_otras_cuentas_sin_area(client, f, mundo, crear_actividad):
    uno = f.usuario("uno@example.com", "Uno Sin Area")
    dos = f.usuario("dos@example.com", "Dos Sin Area")
    propia = crear_actividad(uno, titulo="De uno")
    ajena = crear_actividad(dos, titulo="De dos")

    ids = [a["id"] for a in client.get("/actividades/", headers=f.auth(uno)).json()]
    assert ids == [propia["id"]]
    assert client.get(f"/actividades/{ajena['id']}/comentarios", headers=f.auth(uno)).status_code == 404
    assert client.put(f"/actividades/{ajena['id']}", json={"titulo": "X"}, headers=f.auth(uno)).status_code == 404

    usuarios = client.get("/usuarios/", headers=f.auth(uno)).json()
    assert [u["id"] for u in usuarios] == [uno.id]


def test_sin_area_ve_lo_que_le_asignan(client, f, mundo, crear_actividad):
    nuevo = f.usuario("nuevo@example.com", "Nuevo Sin Area")
    a = crear_actividad(mundo["admin"], titulo="Asignada", asignado_a_id=nuevo.id, area_id=mundo["qa"].id)
    ids = [x["id"] for x in client.get("/actividades/", headers=f.auth(nuevo)).json()]
    assert ids == [a["id"]]


# ---------- Mover de área y asignar a otros: solo admin ----------
def test_no_admin_no_mueve_actividad_de_area(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    r = client.put(f"/actividades/{a['id']}", json={"area_id": mundo["dev"].id}, headers=f.auth(mundo["ana"]))
    assert r.status_code == 403
    # Mandar su misma área no es un cambio
    r = client.put(f"/actividades/{a['id']}", json={"area_id": mundo["qa"].id}, headers=f.auth(mundo["ana"]))
    assert r.status_code == 200
    r = client.put(f"/actividades/{a['id']}", json={"area_id": mundo["dev"].id}, headers=f.auth(mundo["admin"]))
    assert r.status_code == 200 and r.json()["area_id"] == mundo["dev"].id
    assert client.put(f"/actividades/{a['id']}", json={"area_id": 9999}, headers=f.auth(mundo["admin"])).status_code == 404


def test_no_admin_no_asigna_a_otros_al_crear(client, f, mundo):
    h = f.auth(mundo["ana"])
    assert client.post("/actividades/", json={"titulo": "X", "asignado_a_id": mundo["dani"].id}, headers=h).status_code == 403
    r = client.post("/actividades/", json={"titulo": "X", "asignado_a_id": mundo["ana"].id}, headers=h)
    assert r.status_code == 201


# ---------- Datos antiguos con estimación mínima > máxima ----------
def test_editar_actividad_con_estimacion_antigua_invalida(client, f, db, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], estimacion_max_hrs=8)
    fila = db.query(models.Actividad).get(a["id"])
    fila.estimacion_min_hrs = 10  # como quedó en producción tras la migración de horas
    db.commit()
    h = f.auth(mundo["ana"])
    assert client.put(f"/actividades/{a['id']}", json={"titulo": "Editada"}, headers=h).status_code == 200
    assert client.put(f"/actividades/{a['id']}", json={"estimacion_max_hrs": 6}, headers=h).status_code == 200
    # Si la edición manda ambos valores, la regla sigue aplicando
    r = client.put(f"/actividades/{a['id']}", json={"estimacion_min_hrs": 9, "estimacion_max_hrs": 6}, headers=h)
    assert r.status_code == 400


# ---------- Login ----------
def test_cuenta_google_sin_contrasena_no_da_500(client, f):
    usuario = f.usuario("google@example.com", "Cuenta Google")
    usuario.contrasena = ""
    f.db.commit()
    r = client.post("/auth/login", json={"usuario": "google@example.com", "contrasena": CLAVE})
    assert r.status_code == 400


def test_login_devuelve_nombre(client, f):
    f.usuario("nombre@example.com", "Nombre Real", contrasena=CLAVE)
    r = client.post("/auth/login", json={"usuario": "nombre@example.com", "contrasena": CLAVE})
    assert r.status_code == 200 and r.json()["name_users"] == "Nombre Real"


def test_bloqueo_tras_intentos_fallidos(client, f, db):
    usuario = f.usuario("bloqueo@example.com", "Bloqueo Prueba", contrasena=CLAVE)
    mala = {"usuario": "bloqueo@example.com", "contrasena": "Mala#Clave1"}
    buena = {"usuario": "bloqueo@example.com", "contrasena": CLAVE}
    for _ in range(4):
        assert client.post("/auth/login", json=mala).status_code == 400
    # Un acierto antes del límite reinicia el contador
    assert client.post("/auth/login", json=buena).status_code == 200
    for _ in range(5):
        assert client.post("/auth/login", json=mala).status_code == 400
    # Ya bloqueada: ni la contraseña correcta entra
    assert client.post("/auth/login", json=buena).status_code == 429
    # Pasado el tiempo de bloqueo vuelve a entrar
    db.refresh(usuario)
    usuario.bloqueado_hasta = datetime.utcnow() - timedelta(seconds=1)
    db.commit()
    assert client.post("/auth/login", json=buena).status_code == 200


def test_restablecer_levanta_el_bloqueo(client, f, db, mundo):
    usuario = f.usuario("reset@example.com", "Reset Prueba", contrasena=CLAVE)
    usuario.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    enlace = client.post(f"/usuarios/{usuario.id}/restablecimiento", headers=f.auth(mundo["admin"])).json()
    assert client.post("/auth/restablecer", json={"token": enlace["token"], "contrasena": "Nueva#Clave1"}).status_code == 200
    assert client.post("/auth/login", json={"usuario": "reset@example.com", "contrasena": "Nueva#Clave1"}).status_code == 200


# ---------- Filtro de fechas inclusivo ----------
def test_filtro_fecha_fin_incluye_todo_el_dia(client, f, db, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    fila = db.query(models.Actividad).get(a["id"])
    fila.fecha_creacion = datetime(2026, 11, 10, 15, 30)
    db.commit()
    r = client.get("/actividades/?fecha_inicio=2026-11-10&fecha_fin=2026-11-10", headers=f.auth(mundo["ana"]))
    assert [x["id"] for x in r.json()] == [a["id"]]


# ---------- Áreas y asignación de área ----------
def test_admin_crea_area_y_asigna_usuario(client, f, mundo):
    admin = f.auth(mundo["admin"])
    assert client.post("/areas/", json={"nombre": "Ecom"}, headers=f.auth(mundo["ana"])).status_code == 403
    r = client.post("/areas/", json={"nombre": "  E-COM  "}, headers=admin)
    assert r.status_code == 201 and r.json()["nombre"] == "E-COM"
    assert client.post("/areas/", json={"nombre": "e-com"}, headers=admin).status_code == 400
    nombres = [a["nombre"] for a in client.get("/areas/", headers=f.auth(mundo["ana"])).json()]
    assert "E-COM" in nombres

    nuevo = f.usuario("sinarea@example.com", "Sin Area")
    r = client.put(f"/usuarios/{nuevo.id}", json={"area_id": mundo["qa"].id}, headers=admin)
    assert r.status_code == 200 and r.json()["area_id"] == mundo["qa"].id
    r = client.put(f"/usuarios/{nuevo.id}", json={"area_id": None}, headers=admin)
    assert r.status_code == 200 and r.json()["area_id"] is None
    assert client.put(f"/usuarios/{nuevo.id}", json={"area_id": 1}, headers=f.auth(mundo["ana"])).status_code == 403


# ---------- Encabezados y documentación ----------
def test_encabezados_de_seguridad_y_docs_apagados(client):
    r = client.get("/db-check")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404
