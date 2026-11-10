def test_comentario_con_evidencia(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}/comentarios"
    r = client.post(url, json={"texto": "  Captura del error  ", "url": "https://example.com/captura.png"}, headers=h)
    assert r.status_code == 201
    assert r.json()["texto"] == "Captura del error"
    assert r.json()["usuario_nombre"] == "Ana Prueba"
    assert len(client.get(url, headers=h).json()) == 1


def test_comentario_entradas_invalidas(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}/comentarios"
    assert client.post(url, json={"texto": ""}, headers=h).status_code == 422
    assert client.post(url, json={"texto": "   "}, headers=h).status_code == 422
    assert client.post(url, json={"texto": "x" * 2001}, headers=h).status_code == 422
    # Enlaces que no son http/https (podrían ejecutar código al abrirse)
    for peligroso in ("javascript:alert(1)", "data:text/html,<script>1</script>", "ftp://example.com", "example.com"):
        assert client.post(url, json={"texto": "x", "url": peligroso}, headers=h).status_code == 422, peligroso
    assert client.post(url, json={"texto": "x", "url": ""}, headers=h).status_code == 201  # vacío = sin enlace


def test_eliminar_comentario_permisos(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    url = f"/actividades/{a['id']}/comentarios"
    c = client.post(url, json={"texto": "Mío"}, headers=f.auth(mundo["ana"])).json()
    assert client.delete(f"{url}/{c['id']}", headers=f.auth(mundo["beto"])).status_code == 403
    assert client.delete(f"{url}/{c['id']}", headers=f.auth(mundo["ana"])).status_code == 204
    c2 = client.post(url, json={"texto": "Otro"}, headers=f.auth(mundo["ana"])).json()
    assert client.delete(f"{url}/{c2['id']}", headers=f.auth(mundo["admin"])).status_code == 204
    assert client.delete(f"{url}/99999", headers=f.auth(mundo["admin"])).status_code == 404


def test_historial_registra_cambios_con_nombres_legibles(client, f, mundo, crear_actividad):
    lider = f.lider("Persona Líder")
    a = crear_actividad(mundo["ana"], asignado_a_id=mundo["ana"].id)
    admin = f.auth(mundo["admin"])
    url = f"/actividades/{a['id']}"
    client.put(url, json={"titulo": "Título nuevo", "estado": "BLOQUEADA", "motivo_bloqueo": "Sin acceso",
                          "asignado_a_id": mundo["beto"].id, "lider_catalogo_id": lider.id}, headers=admin)
    h = client.get(f"{url}/historial", headers=admin).json()
    por_campo = {x["campo"]: x for x in h}
    assert por_campo["creada"]["valor_nuevo"] == "Actividad de prueba"
    assert por_campo["titulo"]["valor_anterior"] == "Actividad de prueba" and por_campo["titulo"]["valor_nuevo"] == "Título nuevo"
    assert por_campo["estado"]["valor_nuevo"] == "BLOQUEADA"
    assert por_campo["motivo_bloqueo"]["valor_nuevo"] == "Sin acceso"
    assert por_campo["asignado_a"]["valor_anterior"] == "Ana Prueba" and por_campo["asignado_a"]["valor_nuevo"] == "Beto Prueba"
    assert por_campo["lider_catalogo"]["valor_nuevo"] == "Persona Líder"
    assert por_campo["titulo"]["usuario_nombre"] == "Admin Prueba"


def test_historial_no_registra_cambios_vacios(client, f, mundo, crear_actividad):
    a = crear_actividad(mundo["ana"])
    h = f.auth(mundo["ana"])
    url = f"/actividades/{a['id']}"
    client.put(url, json={"titulo": a["titulo"], "prioridad": a["prioridad"]}, headers=h)  # mismos valores
    assert [x["campo"] for x in client.get(f"{url}/historial", headers=h).json()] == ["creada"]
