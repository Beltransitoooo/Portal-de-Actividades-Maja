from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import Optional
from datetime import date, timedelta
from app import models, schemas


# ---------------------------------------------------------------------------
# Utilidades internas
# ---------------------------------------------------------------------------

def _estado_por_defecto(completada: bool, horas_utilizadas: float) -> str:
    """Estado inferido cuando el cliente no lo envía (misma regla que la migración)."""
    if completada:
        return "COMPLETADA"
    if (horas_utilizadas or 0) > 0:
        return "EN_PROGRESO"
    return "PENDIENTE"


def _fecha_mx(valor: date) -> str:
    return valor.strftime("%d/%m/%Y")


def _texto(valor) -> Optional[str]:
    """Convierte un valor a texto legible para el historial."""
    if valor is None:
        return None
    if isinstance(valor, date):
        return _fecha_mx(valor)
    if isinstance(valor, float):
        return f"{valor:g}"
    return str(valor)[:500]


def _nombre_usuario(db: Session, usuario_id: Optional[int]) -> str:
    if not usuario_id:
        return "Sin asignar"
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    return (usuario.name_users or usuario.usuario) if usuario else f"Usuario {usuario_id}"


def _nombre_lider(db: Session, lider_id: Optional[int]) -> str:
    if not lider_id:
        return "Sin líder"
    lider = db.query(models.LiderTecnico).filter(models.LiderTecnico.id == lider_id).first()
    return lider.nombre if lider else f"Líder {lider_id}"


def _nombre_para_respuesta(usuario: Optional[models.Usuario]) -> Optional[str]:
    if usuario is None:
        return None
    return usuario.name_users or usuario.usuario


def _registrar_historial(db: Session, actividad_id: int, usuario: models.Usuario, campo: str, anterior, nuevo) -> None:
    """Agrega una fila a la bitácora (el commit lo hace quien llama)."""
    db.add(models.HistorialActividad(
        actividad_id=actividad_id,
        usuario_id=usuario.id,
        campo=campo,
        valor_anterior=_texto(anterior),
        valor_nuevo=_texto(nuevo),
    ))


def _obtener_actividad(db: Session, actividad_id: int, usuario: models.Usuario) -> models.Actividad:
    """Devuelve la actividad si existe y el usuario puede verla.

    Mismo criterio que el listado: los administradores ven todo y el resto solo su área.
    Si no tiene acceso se responde 404 para no revelar que la actividad existe.
    """
    actividad = db.query(models.Actividad).filter(models.Actividad.id == actividad_id).first()
    if not actividad or (not usuario.es_admin and actividad.area_id != usuario.area_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada")
    return actividad


def _recalcular_horas(db: Session, actividad: models.Actividad) -> None:
    """horas_utilizadas siempre es la suma de los registros por día."""
    total = (
        db.query(func.coalesce(func.sum(models.RegistroHoras.horas), 0.0))
        .filter(models.RegistroHoras.actividad_id == actividad.id)
        .scalar()
    )
    actividad.horas_utilizadas = round(float(total), 2)


def _validar_referencias(db: Session, datos: dict) -> None:
    """Comprueba que los ids enviados existan (usuario, líder técnico, líder del catálogo)."""
    if datos.get("lider_tecnico_id"):
        if not db.query(models.Usuario).filter(models.Usuario.id == datos["lider_tecnico_id"]).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El líder técnico especificado no existe")

    if datos.get("asignado_a_id"):
        if not db.query(models.Usuario).filter(models.Usuario.id == datos["asignado_a_id"]).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario asignado no existe")

    if datos.get("lider_catalogo_id"):
        lider = db.query(models.LiderTecnico).filter(models.LiderTecnico.id == datos["lider_catalogo_id"]).first()
        if not lider:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El líder técnico especificado no existe")


def _validar_valores(fecha_inicio, fecha_vencimiento, min_hrs, max_hrs) -> None:
    """Reglas de fechas y estimaciones (se usan al crear y al editar, con los valores ya combinados)."""
    if fecha_inicio and fecha_vencimiento and fecha_vencimiento < fecha_inicio:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La fecha de vencimiento no puede ser anterior a la de inicio")

    if (min_hrs is not None and min_hrs < 0) or (max_hrs is not None and max_hrs < 0):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Las estimaciones no pueden ser negativas")

    if min_hrs is not None and max_hrs is not None and max_hrs < min_hrs:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La estimación máxima no puede ser menor a la mínima")


def _exigir_motivo(motivo: Optional[str]) -> str:
    motivo = (motivo or "").strip()
    if len(motivo) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Indica el motivo del bloqueo")
    return motivo


# ---------------------------------------------------------------------------
# Actividades
# ---------------------------------------------------------------------------

def listar(
    db: Session,
    usuario_actual: models.Usuario,
    equipo: Optional[str] = None,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None
):
    query = db.query(models.Actividad)

    if not usuario_actual.es_admin:
        query = query.filter(models.Actividad.area_id == usuario_actual.area_id)

    if equipo:
        # "equipo" se interpreta como el nombre del área (la actividad no tiene un campo "equipo")
        query = query.join(models.Area, models.Actividad.area_id == models.Area.id).filter(models.Area.nombre == equipo)

    if fecha_inicio:
        query = query.filter(models.Actividad.fecha_creacion >= fecha_inicio)

    if fecha_fin:
        query = query.filter(models.Actividad.fecha_creacion <= fecha_fin)

    return query.order_by(models.Actividad.id).all()


def crear(db: Session, actividad_in: schemas.ActividadCreate, usuario_actual: models.Usuario):
    datos = actividad_in.model_dump()

    _validar_referencias(db, datos)

    if datos.get("area_id"):
        area = db.query(models.Area).filter(models.Area.id == datos["area_id"]).first()
        if not area:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El área especificada no existe")

        if not usuario_actual.es_admin and datos["area_id"] != usuario_actual.area_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para crear actividades en otra área")
    else:
        datos["area_id"] = usuario_actual.area_id

    _validar_valores(
        datos.get("fecha_inicio"), datos.get("fecha_vencimiento"),
        datos.get("estimacion_min_hrs"), datos.get("estimacion_max_hrs"),
    )

    # Las horas iniciales (si las hay) se guardan como un registro por día, igual que el resto
    horas_iniciales = datos.pop("horas_utilizadas", 0) or 0
    datos["horas_utilizadas"] = 0

    # "estado" manda; "completada" se deriva de él para mantener compatibilidad
    if not datos.get("estado"):
        datos["estado"] = _estado_por_defecto(datos.get("completada", False), horas_iniciales)
    datos["completada"] = datos["estado"] == "COMPLETADA"

    if datos["estado"] == "BLOQUEADA":
        datos["motivo_bloqueo"] = _exigir_motivo(datos.get("motivo_bloqueo"))
    else:
        datos["motivo_bloqueo"] = None

    nueva_actividad = models.Actividad(**datos, creador_id=usuario_actual.id)
    db.add(nueva_actividad)
    db.flush()

    if horas_iniciales > 0:
        db.add(models.RegistroHoras(
            actividad_id=nueva_actividad.id,
            fecha=date.today(),
            horas=min(horas_iniciales, 24),
            nota="Horas iniciales",
            usuario_id=usuario_actual.id,
        ))
        db.flush()
        _recalcular_horas(db, nueva_actividad)

    _registrar_historial(db, nueva_actividad.id, usuario_actual, "creada", None, nueva_actividad.titulo)
    db.commit()
    db.refresh(nueva_actividad)
    return nueva_actividad


# Campos que se registran en el historial al editar (clave del modelo -> nombre en la bitácora)
_CAMPOS_HISTORIAL = {
    "titulo": "titulo",
    "descripcion": "descripcion",
    "estado": "estado",
    "prioridad": "prioridad",
    "tipo_actividad": "tipo_actividad",
    "fecha_inicio": "fecha_inicio",
    "fecha_vencimiento": "fecha_vencimiento",
    "estimacion_max_hrs": "estimacion_max_hrs",
    "motivo_bloqueo": "motivo_bloqueo",
}


def actualizar(db: Session, actividad_id: int, datos_in: schemas.ActividadUpdate, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    datos = datos_in.model_dump(exclude_unset=True)

    if "asignado_a_id" in datos:
        if datos["asignado_a_id"] != actividad.asignado_a_id and not usuario_actual.es_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el administrador puede reasignar tareas a otros usuarios"
            )

    # Columnas NOT NULL: un null explícito se ignora en lugar de romper la restricción
    if datos.get("estado") is None:
        datos.pop("estado", None)

    if "titulo" in datos:
        titulo = (datos["titulo"] or "").strip()
        if not titulo:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El título no puede estar vacío")
        datos["titulo"] = titulo

    # Sincronía estado <-> completada
    if "estado" in datos:
        datos["completada"] = datos["estado"] == "COMPLETADA"
    elif "completada" in datos:
        if datos["completada"]:
            datos["estado"] = "COMPLETADA"
        elif actividad.estado == "COMPLETADA":
            # Se reabre: vuelve a en progreso o pendiente según sus horas
            datos["estado"] = _estado_por_defecto(False, actividad.horas_utilizadas)
        # Si estaba en revisión o bloqueada, desmarcar "completada" no cambia su estado

    # Motivo de bloqueo: obligatorio al entrar a BLOQUEADA y se limpia al salir
    estado_final = datos.get("estado", actividad.estado)
    if estado_final == "BLOQUEADA":
        if actividad.estado != "BLOQUEADA" or "motivo_bloqueo" in datos:
            datos["motivo_bloqueo"] = _exigir_motivo(datos.get("motivo_bloqueo"))
    elif actividad.motivo_bloqueo or "motivo_bloqueo" in datos:
        datos["motivo_bloqueo"] = None

    _validar_referencias(db, datos)
    _validar_valores(
        datos.get("fecha_inicio", actividad.fecha_inicio),
        datos.get("fecha_vencimiento", actividad.fecha_vencimiento),
        datos.get("estimacion_min_hrs", actividad.estimacion_min_hrs),
        datos.get("estimacion_max_hrs", actividad.estimacion_max_hrs),
    )

    # Sin campos que cambiar: no hace falta escribir en la base
    if not datos:
        return actividad

    # Registro de cambios (solo campos que realmente cambian)
    for campo, nombre in _CAMPOS_HISTORIAL.items():
        if campo in datos and getattr(actividad, campo) != datos[campo]:
            _registrar_historial(db, actividad.id, usuario_actual, nombre, getattr(actividad, campo), datos[campo])

    if "asignado_a_id" in datos and datos["asignado_a_id"] != actividad.asignado_a_id:
        _registrar_historial(
            db, actividad.id, usuario_actual, "asignado_a",
            _nombre_usuario(db, actividad.asignado_a_id), _nombre_usuario(db, datos["asignado_a_id"]),
        )

    if "lider_catalogo_id" in datos and datos["lider_catalogo_id"] != actividad.lider_catalogo_id:
        _registrar_historial(
            db, actividad.id, usuario_actual, "lider_catalogo",
            _nombre_lider(db, actividad.lider_catalogo_id), _nombre_lider(db, datos["lider_catalogo_id"]),
        )

    for campo, valor in datos.items():
        setattr(actividad, campo, valor)

    db.commit()
    db.refresh(actividad)
    return actividad


def eliminar(db: Session, actividad_id: int, usuario_actual: models.Usuario):
    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede eliminar actividades"
        )

    actividad = db.query(models.Actividad).filter(models.Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada")

    # El historial se conserva (no tiene FK) y registra quién la eliminó
    _registrar_historial(db, actividad.id, usuario_actual, "eliminada", actividad.titulo, None)
    db.delete(actividad)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Horas por día
# ---------------------------------------------------------------------------

def _respuesta_horas(registro: models.RegistroHoras) -> dict:
    return {
        "id": registro.id,
        "actividad_id": registro.actividad_id,
        "fecha": registro.fecha,
        "horas": registro.horas,
        "nota": registro.nota,
        "usuario_id": registro.usuario_id,
        "usuario_nombre": _nombre_para_respuesta(registro.usuario),
        "creado": registro.creado,
    }


def listar_horas(
    db: Session,
    usuario_actual: models.Usuario,
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    actividad_id: Optional[int] = None,
):
    """Registros de horas de las actividades que el usuario puede ver."""
    query = db.query(models.RegistroHoras).join(
        models.Actividad, models.Actividad.id == models.RegistroHoras.actividad_id
    )
    if not usuario_actual.es_admin:
        query = query.filter(models.Actividad.area_id == usuario_actual.area_id)
    if actividad_id:
        query = query.filter(models.RegistroHoras.actividad_id == actividad_id)
    if desde:
        query = query.filter(models.RegistroHoras.fecha >= desde)
    if hasta:
        query = query.filter(models.RegistroHoras.fecha <= hasta)

    registros = query.order_by(models.RegistroHoras.fecha, models.RegistroHoras.id).all()
    return [_respuesta_horas(r) for r in registros]


def registrar_horas(db: Session, actividad_id: int, datos: schemas.RegistroHorasCreate, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)

    # Un día de margen para diferencias de zona horaria entre el navegador y el servidor
    if datos.fecha > date.today() + timedelta(days=1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes registrar horas en una fecha futura")

    ya_registradas = (
        db.query(func.coalesce(func.sum(models.RegistroHoras.horas), 0.0))
        .filter(models.RegistroHoras.usuario_id == usuario_actual.id, models.RegistroHoras.fecha == datos.fecha)
        .scalar()
    )
    if float(ya_registradas) + datos.horas > 24:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese día ya tienes registradas demasiadas horas (máximo 24 h por día)")

    registro = models.RegistroHoras(
        actividad_id=actividad.id,
        fecha=datos.fecha,
        horas=datos.horas,
        nota=(datos.nota or "").strip() or None,
        usuario_id=usuario_actual.id,
    )
    db.add(registro)
    db.flush()
    _recalcular_horas(db, actividad)

    # Al registrar las primeras horas, una actividad pendiente pasa a en progreso
    if actividad.estado == "PENDIENTE":
        _registrar_historial(db, actividad.id, usuario_actual, "estado", "PENDIENTE", "EN_PROGRESO")
        actividad.estado = "EN_PROGRESO"
        actividad.completada = False

    _registrar_historial(db, actividad.id, usuario_actual, "horas", None, f"{datos.horas:g} h el {_fecha_mx(datos.fecha)}")
    db.commit()
    db.refresh(registro)
    return _respuesta_horas(registro)


def eliminar_horas(db: Session, actividad_id: int, registro_id: int, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    registro = (
        db.query(models.RegistroHoras)
        .filter(models.RegistroHoras.id == registro_id, models.RegistroHoras.actividad_id == actividad.id)
        .first()
    )
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de horas no encontrado")

    if not usuario_actual.es_admin and registro.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes eliminar tus propios registros de horas")

    _registrar_historial(db, actividad.id, usuario_actual, "horas", f"{registro.horas:g} h el {_fecha_mx(registro.fecha)}", None)
    db.delete(registro)
    db.flush()
    _recalcular_horas(db, actividad)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Comentarios y evidencias
# ---------------------------------------------------------------------------

def _respuesta_comentario(comentario: models.Comentario) -> dict:
    return {
        "id": comentario.id,
        "actividad_id": comentario.actividad_id,
        "usuario_id": comentario.usuario_id,
        "usuario_nombre": _nombre_para_respuesta(comentario.usuario),
        "texto": comentario.texto,
        "url": comentario.url,
        "creado": comentario.creado,
    }


def listar_comentarios(db: Session, actividad_id: int, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    comentarios = (
        db.query(models.Comentario)
        .filter(models.Comentario.actividad_id == actividad.id)
        .order_by(models.Comentario.creado, models.Comentario.id)
        .all()
    )
    return [_respuesta_comentario(c) for c in comentarios]


def agregar_comentario(db: Session, actividad_id: int, datos: schemas.ComentarioCreate, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    comentario = models.Comentario(
        actividad_id=actividad.id, usuario_id=usuario_actual.id, texto=datos.texto, url=datos.url
    )
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return _respuesta_comentario(comentario)


def eliminar_comentario(db: Session, actividad_id: int, comentario_id: int, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    comentario = (
        db.query(models.Comentario)
        .filter(models.Comentario.id == comentario_id, models.Comentario.actividad_id == actividad.id)
        .first()
    )
    if not comentario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado")

    if not usuario_actual.es_admin and comentario.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes eliminar tus propios comentarios")

    db.delete(comentario)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Historial
# ---------------------------------------------------------------------------

def listar_historial(db: Session, actividad_id: int, usuario_actual: models.Usuario):
    actividad = _obtener_actividad(db, actividad_id, usuario_actual)
    filas = (
        db.query(models.HistorialActividad)
        .filter(models.HistorialActividad.actividad_id == actividad.id)
        .order_by(models.HistorialActividad.creado.desc(), models.HistorialActividad.id.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": f.id,
            "actividad_id": f.actividad_id,
            "usuario_id": f.usuario_id,
            "usuario_nombre": _nombre_para_respuesta(f.usuario),
            "campo": f.campo,
            "valor_anterior": f.valor_anterior,
            "valor_nuevo": f.valor_nuevo,
            "creado": f.creado,
        }
        for f in filas
    ]
