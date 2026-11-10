from datetime import date, timedelta


def hoy():
    return date.today().isoformat()


def test_registrar_horas_suma_y_avanza_pendiente(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    r = client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 2.5, "nota": "Pruebas de humo"}, headers=h)
    assert r.status_code == 201
    assert r.json()["usuario_nombre"] == "Ana Prueba"
    client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 1.5}, headers=h)
    act = [x for x in client.get("/actividades/", headers=h).json() if x["id"] == a["id"]][0]
    assert act["horas_utilizadas"] == 4
    assert act["estado"] == "EN_PROGRESO"  # PENDIENTE avanza solo al registrar horas


def test_no_cambia_otros_estados_al_registrar(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], estado="EN_REVISION")
    h = f.auth(mundo["ana"])
    client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 1}, headers=h)
    act = client.get("/actividades/", headers=h).json()[0]
    assert act["estado"] == "EN_REVISION"


def test_entradas_invalidas(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    b = crear_actividad(mundo["ana"], titulo="Otra")
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}/horas"
    assert client.post(url, json={"fecha": hoy(), "horas": 0}, headers=h).status_code == 422
    assert client.post(url, json={"fecha": hoy(), "horas": -2}, headers=h).status_code == 422
    assert client.post(url, json={"fecha": hoy(), "horas": 25}, headers=h).status_code == 422
    assert client.post(url, json={"fecha": "no-es-fecha", "horas": 1}, headers=h).status_code == 422
    futura = (date.today() + timedelta(days=5)).isoformat()
    assert client.post(url, json={"fecha": futura, "horas": 1}, headers=h).status_code == 400
    # Más de 24 h en un mismo día sumando varias actividades
    assert client.post(url, json={"fecha": hoy(), "horas": 20}, headers=h).status_code == 201
    assert client.post(f"/actividades/{b['id']}/horas", json={"fecha": hoy(), "horas": 5}, headers=h).status_code == 400
    assert client.post("/actividades/9999/horas", json={"fecha": hoy(), "horas": 1}, headers=h).status_code == 404


def test_eliminar_horas_permisos_y_recalculo(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    ana, beto, admin = f.auth(mundo["ana"]), f.auth(mundo["beto"]), f.auth(mundo["admin"])
    r1 = client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 3}, headers=ana).json()
    r2 = client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 2}, headers=beto).json()
    # Beto no puede borrar el registro de Ana; el administrador sí
    assert client.delete(f"/actividades/{a['id']}/horas/{r1['id']}", headers=beto).status_code == 403
    assert client.delete(f"/actividades/{a['id']}/horas/{r1['id']}", headers=admin).status_code == 204
    assert client.delete(f"/actividades/{a['id']}/horas/{r1['id']}", headers=admin).status_code == 404
    act = client.get("/actividades/", headers=ana).json()[0]
    assert act["horas_utilizadas"] == 2
    # Un registro de otra actividad no se puede borrar por esta ruta
    otra = crear_actividad(mundo["ana"], titulo="Otra")
    assert client.delete(f"/actividades/{otra['id']}/horas/{r2['id']}", headers=beto).status_code == 404


def test_listado_general_por_rango_y_area(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    ana = f.auth(mundo["ana"])
    ayer = (date.today() - timedelta(days=1)).isoformat()
    client.post(f"/actividades/{a['id']}/horas", json={"fecha": ayer, "horas": 1}, headers=ana)
    client.post(f"/actividades/{a['id']}/horas", json={"fecha": hoy(), "horas": 2}, headers=ana)
    assert len(client.get("/horas/", headers=ana).json()) == 2
    solo_hoy = client.get(f"/horas/?desde={hoy()}&hasta={hoy()}", headers=ana).json()
    assert len(solo_hoy) == 1 and solo_hoy[0]["horas"] == 2
    assert client.get("/horas/", headers=f.auth(mundo["dani"])).json() == []  # otra área
    assert len(client.get("/horas/", headers=f.auth(mundo["admin"])).json()) == 2
    assert client.get("/horas/").status_code == 401


def test_horas_iniciales_al_crear_quedan_como_registro(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"], horas_utilizadas=3)
    assert a["horas_utilizadas"] == 3
    r = client.get(f"/actividades/{a['id']}/horas", headers=f.auth(mundo["ana"])).json()
    assert len(r) == 1 and r[0]["horas"] == 3
