"""Bloqueo de login por intentos fallidos y limpieza de estimaciones antiguas

Cambios (no se elimina ninguna columna ni tabla existente):
- usuarios.intentos_fallidos y usuarios.bloqueado_hasta (protección contra fuerza bruta).
- actividades.estimacion_min_hrs: antes guardaba las horas usadas (ya copiadas a
  horas_utilizadas en b7c1d2e3f4a5). Donde quedó mayor que la estimación máxima se
  pone en NULL, porque ese par inválido bloqueaba la edición de la actividad.

Revision ID: d9e3f4a5b6c7
Revises: c8d2e3f4a5b6
Create Date: 2026-11-10 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9e3f4a5b6c7'
down_revision: Union[str, Sequence[str], None] = 'c8d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('usuarios', sa.Column('intentos_fallidos', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('usuarios', sa.Column('bloqueado_hasta', sa.DateTime(), nullable=True))

    op.execute(
        "UPDATE actividades SET estimacion_min_hrs = NULL "
        "WHERE estimacion_min_hrs IS NOT NULL AND estimacion_max_hrs IS NOT NULL "
        "AND estimacion_min_hrs > estimacion_max_hrs"
    )


def downgrade() -> None:
    """Downgrade schema (la limpieza de estimaciones no se revierte)."""
    op.drop_column('usuarios', 'bloqueado_hasta')
    op.drop_column('usuarios', 'intentos_fallidos')
