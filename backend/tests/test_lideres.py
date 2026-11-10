def test_listar_lideres_requiere_sesion(client, f, mundo):
    f.lider("Persona Uno")
    assert client.get("/lideres-tecnicos/").status_code == 401
    r = client.get("/lideres-tecnicos/", headers=f.auth(mundo["ana"]))
    assert r.status_code == 200 and [x["nombre"] for x in r.json()] == ["Persona Uno"]


def test_crear_y_validar(client, f, mundo):
    admin, ana = f.auth(mundo["admin"]), f.auth(mundo["ana"])
    assert client.post("/lideres-tecnicos/", json={"nombre": "Nuevo Líder"}, headers=ana).status_code == 403
    r = client.post("/lideres-tecnicos/", json={"nombre": "  Nuevo   Líder "}, headers=admin)
    assert r.status_code == 201 and r.json()["nombre"] == "Nuevo Líder" and r.json()["activo"] is True
    assert client.post("/lideres-tecnicos/", json={"nombre": "nuevo líder"}, headers=admin).status_code == 400  # duplicado sin importar mayúsculas
    assert client.post("/lideres-tecnicos/", json={"nombre": "A"}, headers=admin).status_code == 422
    assert client.post("/lideres-tecnicos/", json={"nombre": ""}, headers=admin).status_code == 422


def test_actualizar_y_desactivar(client, f, mundo):
    admin, ana = f.auth(mundo["admin"]), f.auth(mundo["ana"])
    lider = f.lider("Persona Uno")
    f.lider("Persona Dos")
    url = f"/lideres-tecnicos/{lider.id}"
    assert client.put(url, json={"activo": False}, headers=ana).status_code == 403
    r = client.put(url, json={"activo": False}, headers=admin)
    assert r.status_code == 200 and r.json()["activo"] is False
    assert client.put(url, json={"nombre": "Persona Dos"}, headers=admin).status_code == 400  # choca con otro
    assert client.put(url, json={"nombre": "Persona Uno B"}, headers=admin).json()["nombre"] == "Persona Uno B"
    assert client.put("/lideres-tecnicos/9999", json={"activo": True}, headers=admin).status_code == 404
