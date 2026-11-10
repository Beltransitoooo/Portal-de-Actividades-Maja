from datetime import date, timedelta

from app import models


def test_crear_sin_estado_es_pendiente(mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    assert a["estado"] == "PENDIENTE"
    assert a["completada"] is False
    assert a["horas_utilizadas"] == 0


def test_crear_cliente_antiguo_completada_true(mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], completada=True)
    assert a["estado"] == "COMPLETADA"


def test_crear_bloqueada_exige_motivo(client, f, mundo):
    h = f.auth(mundo["ana"])
    r = client.post("/actividades/", json={"titulo": "X", "estado": "BLOQUEADA"}, headers=h)
    assert r.status_code == 400
    r = client.post("/actividades/", json={"titulo": "X", "estado": "BLOQUEADA", "motivo_bloqueo": "Falta ambiente"}, headers=h)
    assert r.status_code == 201
    assert r.json()["motivo_bloqueo"] == "Falta ambiente"


def test_entradas_invalidas_en_crear(client, f, mundo):
    h = f.auth(mundo["ana"])
    assert client.post("/actividades/", json={"titulo": "X", "estado": "INVENTADO"}, headers=h).status_code == 422
    assert client.post("/actividades/", json={"titulo": "X", "horas_utilizadas": -1}, headers=h).status_code == 422
    assert client.post("/actividades/", json={"titulo": "X", "estimacion_max_hrs": -3}, headers=h).status_code == 400
    r = client.post("/actividades/", json={"titulo": "X", "fecha_inicio": "2026-11-10", "fecha_vencimiento": "2026-11-09"}, headers=h)
    assert r.status_code == 400
    # Asignar a otra persona solo lo hace el administrador; si el usuario no existe, 404
    assert client.post("/actividades/", json={"titulo": "X", "asignado_a_id": 9999}, headers=h).status_code == 403
    assert client.post("/actividades/", json={"titulo": "X", "asignado_a_id": 9999}, headers=f.auth(mundo["admin"])).status_code == 404


def test_sin_sesion_401(client):
    assert client.get("/actividades/").status_code == 401
    assert client.put("/actividades/1", json={"titulo": "X"}).status_code == 401


def test_editar_campos_y_validar(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], fecha_inicio="2026-11-10", fecha_vencimiento="2026-11-12")
    h = f.auth(mundo["ana"])
    r = client.put(f"/actividades/{a['id']}", json={"titulo": "  Nuevo título  ", "prioridad": "Alta", "estimacion_max_hrs": 12}, headers=h)
    assert r.status_code == 200
    assert r.json()["titulo"] == "Nuevo título"
    assert r.json()["prioridad"] == "Alta"
    # Fecha de vencimiento anterior al inicio (combinando con el valor guardado)
    assert client.put(f"/actividades/{a['id']}", json={"fecha_vencimiento": "2026-11-01"}, headers=h).status_code == 400
    assert client.put(f"/actividades/{a['id']}", json={"titulo": "   "}, headers=h).status_code == 400
    assert client.put(f"/actividades/{a['id']}", json={"estimacion_max_hrs": -1}, headers=h).status_code == 400


def test_put_vacio_y_estado_null_no_fallan(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    assert client.put(f"/actividades/{a['id']}", json={}, headers=h).status_code == 200
    r = client.put(f"/actividades/{a['id']}", json={"estado": None}, headers=h)
    assert r.status_code == 200 and r.json()["estado"] == "PENDIENTE"


def test_bloqueo_con_motivo_y_se_limpia_al_salir(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}"
    assert client.put(url, json={"estado": "BLOQUEADA"}, headers=h).status_code == 400
    assert client.put(url, json={"estado": "BLOQUEADA", "motivo_bloqueo": "  "}, headers=h).status_code == 400
    r = client.put(url, json={"estado": "BLOQUEADA", "motivo_bloqueo": "Espera aprobación"}, headers=h)
    assert r.status_code == 200 and r.json()["motivo_bloqueo"] == "Espera aprobación"
    assert r.json()["completada"] is False
    r = client.put(url, json={"estado": "EN_PROGRESO"}, headers=h)
    assert r.status_code == 200 and r.json()["motivo_bloqueo"] is None


def test_sincronia_estado_completada(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}"
    r = client.put(url, json={"completada": True}, headers=h).json()
    assert r["estado"] == "COMPLETADA"
    r = client.put(url, json={"completada": False}, headers=h).json()
    assert r["estado"] == "PENDIENTE"  # sin horas se reabre como pendiente
    r = client.put(url, json={"estado": "EN_REVISION"}, headers=h).json()
    assert r["completada"] is False
    r = client.put(url, json={"completada": False}, headers=h).json()
    assert r["estado"] == "EN_REVISION"  # desmarcar no pisa un estado intermedio


def test_reasignar_solo_admin(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], asignado_a_id=mundo["ana"].id)
    url = f"/actividades/{a['id']}"
    r = client.put(url, json={"asignado_a_id": mundo["beto"].id}, headers=f.auth(mundo["ana"]))
    assert r.status_code == 403
    r = client.put(url, json={"asignado_a_id": mundo["beto"].id}, headers=f.auth(mundo["admin"]))
    assert r.status_code == 200 and r.json()["asignado_a_id"] == mundo["beto"].id


def test_aislamiento_por_area(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    dani = f.auth(mundo["dani"])
    assert client.get("/actividades/", headers=dani).json() == []
    assert client.put(f"/actividades/{a['id']}", json={"titulo": "Hackeada"}, headers=dani).status_code == 404
    assert client.get(f"/actividades/{a['id']}/historial", headers=dani).status_code == 404
    assert client.get(f"/actividades/{a['id']}/horas", headers=dani).status_code == 404
    assert client.get(f"/actividades/{a['id']}/comentarios", headers=dani).status_code == 404
    # El administrador sí ve todo
    assert len(client.get("/actividades/", headers=f.auth(mundo["admin"])).json()) == 1


def test_filtro_equipo_filtra_por_area_sin_error(client, f, mundo, crear_actividad):
    crear_actividad(mundo["ana"])
    admin = f.auth(mundo["admin"])
    assert len(client.get("/actividades/?equipo=QA", headers=admin).json()) == 1
    assert client.get("/actividades/?equipo=DEV", headers=admin).json() == []


def test_eliminar_solo_admin_conserva_historial_y_borra_hijos(client, f, db, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    ana = f.auth(mundo["ana"])
    client.post(f"/actividades/{a['id']}/horas", json={"fecha": date.today().isoformat(), "horas": 2}, headers=ana)
    client.post(f"/actividades/{a['id']}/comentarios", json={"texto": "Nota"}, headers=ana)
    url = f"/actividades/{a['id']}"
    assert client.delete(url, headers=ana).status_code == 403
    assert client.delete(url, headers=f.auth(mundo["admin"])).status_code == 204
    assert client.delete(url, headers=f.auth(mundo["admin"])).status_code == 404
    assert db.query(models.RegistroHoras).count() == 0
    assert db.query(models.Comentario).count() == 0
    campos = [h.campo for h in db.query(models.HistorialActividad).filter_by(actividad_id=a["id"]).all()]
    assert "eliminada" in campos and "creada" in campos


def test_lider_del_catalogo(client, f, mundo, crear_actividad):
    lider = f.lider("Persona Líder")
    a = crear_actividad(mundo["ana"], lider_catalogo_id=lider.id)
    assert a["lider_catalogo_id"] == lider.id
    h = f.auth(mundo["ana"])
    assert client.put(f"/actividades/{a['id']}", json={"lider_catalogo_id": 9999}, headers=h).status_code == 404
    r = client.put(f"/actividades/{a['id']}", json={"lider_catalogo_id": None}, headers=h)
    assert r.status_code == 200 and r.json()["lider_catalogo_id"] is None
