import hashlib
from datetime import datetime, timedelta

from app import models

NUEVA = "Nueva#Clave1"


def test_mi_perfil(client, f, mundo):
    r = client.get("/usuarios/me", headers=f.auth(mundo["ana"]))
    assert r.status_code == 200 and r.json()["usuario"] == "ana@example.com" and r.json()["es_admin"] is False
    assert client.get("/usuarios/me").status_code == 401


def test_solo_admin_genera_enlace(client, f, mundo):
    url = f"/usuarios/{mundo['ana'].id}/restablecimiento"
    assert client.post(url, headers=f.auth(mundo["beto"])).status_code == 403
    assert client.post("/usuarios/9999/restablecimiento", headers=f.auth(mundo["admin"])).status_code == 404
    r = client.post(url, headers=f.auth(mundo["admin"]))
    assert r.status_code == 200 and len(r.json()["token"]) >= 40 and r.json()["usuario_nombre"] == "Ana Prueba"


def test_flujo_completo_cambia_la_contrasena(client, f, db, mundo):
    ana = f.usuario("login@example.com", "Persona Login", contrasena="Vieja#Clave1")
    enlace = client.post(f"/usuarios/{ana.id}/restablecimiento", headers=f.auth(mundo["admin"])).json()
    # En la base solo existe el hash, nunca el token
    guardado = db.query(models.TokenRestablecimiento).one()
    assert guardado.token_hash == hashlib.sha256(enlace["token"].encode()).hexdigest()
    assert guardado.token_hash != enlace["token"]

    r = client.post("/auth/restablecer", json={"token": enlace["token"], "contrasena": NUEVA})
    assert r.status_code == 200
    assert client.post("/auth/login", json={"usuario": "login@example.com", "contrasena": NUEVA}).status_code == 200
    assert client.post("/auth/login", json={"usuario": "login@example.com", "contrasena": "Vieja#Clave1"}).status_code == 400
    # De un solo uso
    assert client.post("/auth/restablecer", json={"token": enlace["token"], "contrasena": "Otra#Clave22"}).status_code == 400


def test_token_invalido_vencido_o_contrasena_debil(client, f, db, mundo):
    ana = mundo["ana"]
    enlace = client.post(f"/usuarios/{ana.id}/restablecimiento", headers=f.auth(mundo["admin"])).json()
    assert client.post("/auth/restablecer", json={"token": "x" * 43, "contrasena": NUEVA}).status_code == 400
    assert client.post("/auth/restablecer", json={"token": "corto", "contrasena": NUEVA}).status_code == 422
    # Contraseña que no cumple las reglas
    for debil in ("corta1!", "sinmayuscula1!", "SinEspecial123"):
        assert client.post("/auth/restablecer", json={"token": enlace["token"], "contrasena": debil}).status_code == 422, debil
    # Vencido
    registro = db.query(models.TokenRestablecimiento).one()
    registro.expira = datetime.utcnow() - timedelta(minutes=1)
    db.commit()
    assert client.post("/auth/restablecer", json={"token": enlace["token"], "contrasena": NUEVA}).status_code == 400


def test_un_enlace_nuevo_invalida_el_anterior(client, f, mundo):
    url = f"/usuarios/{mundo['ana'].id}/restablecimiento"
    admin = f.auth(mundo["admin"])
    primero = client.post(url, headers=admin).json()
    segundo = client.post(url, headers=admin).json()
    assert client.post("/auth/restablecer", json={"token": primero["token"], "contrasena": NUEVA}).status_code == 400
    assert client.post("/auth/restablecer", json={"token": segundo["token"], "contrasena": NUEVA}).status_code == 200
