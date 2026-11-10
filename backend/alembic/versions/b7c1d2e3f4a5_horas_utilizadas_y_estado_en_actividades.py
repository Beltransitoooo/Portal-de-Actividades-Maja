"""Horas utilizadas y estado en actividades

Agrega dos columnas a "actividades" sin eliminar ninguna existente:
- horas_utilizadas: horas reales registradas. Hasta ahora el frontend las guardaba
  en estimacion_min_hrs; se copian para no perder información. estimacion_min_hrs
  se conserva tal cual.
- estado: flujo PENDIENTE / EN_PROGRESO / EN_REVISION / COMPLETADA / BLOQUEADA.
  Se calcula a partir de los datos actuales con la misma regla que usaba el
  frontend (completada -> COMPLETADA; con horas -> EN_PROGRESO; si no -> PENDIENTE).

Revision ID: b7c1d2e3f4a5
Revises: 6e71ecbc6cb5
Create Date: 2026-11-10 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7c1d2e3f4a5'
down_revision: Union[str, Sequence[str], None] = '6e71ecbc6cb5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'actividades',
        sa.Column('horas_utilizadas', sa.Float(), nullable=False, server_default='0'),
    )
    op.add_column(
        'actividades',
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='PENDIENTE'),
    )

    # Copia de datos existentes (GREATEST evita violar el CHECK si hubiera negativos)
    op.execute(
        "UPDATE actividades SET horas_utilizadas = GREATEST(COALESCE(estimacion_min_hrs, 0), 0)"
    )
    op.execute(
        """
        UPDATE actividades SET estado = CASE
            WHEN completada IS TRUE THEN 'COMPLETADA'
            WHEN COALESCE(estimacion_min_hrs, 0) > 0 THEN 'EN_PROGRESO'
            ELSE 'PENDIENTE'
        END
        """
    )

    op.create_check_constraint(
        'ck_actividades_horas_utilizadas_no_negativas',
        'actividades',
        'horas_utilizadas >= 0',
    )
    op.create_check_constraint(
        'ck_actividades_estado_valido',
        'actividades',
        "estado IN ('PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA', 'BLOQUEADA')",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('ck_actividades_estado_valido', 'actividades', type_='check')
    op.drop_constraint('ck_actividades_horas_utilizadas_no_negativas', 'actividades', type_='check')
    op.drop_column('actividades', 'estado')
    op.drop_column('actividades', 'horas_utilizadas')
