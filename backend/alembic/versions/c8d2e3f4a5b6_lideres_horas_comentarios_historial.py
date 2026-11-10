"""Líderes técnicos, horas por día, comentarios, historial y restablecimiento

Cambios (no se elimina ninguna columna ni tabla existente):
- Tabla lideres_tecnicos (catálogo) con los cuatro líderes iniciales.
- actividades.lider_catalogo_id y actividades.motivo_bloqueo.
- Tabla registros_horas (horas por día). Las horas que ya existían en
  actividades.horas_utilizadas se copian como un registro por actividad
  (fecha de inicio o de creación) para que la suma siga coincidiendo.
- Tablas comentarios, historial_actividades y tokens_restablecimiento.

Revision ID: c8d2e3f4a5b6
Revises: b7c1d2e3f4a5
Create Date: 2026-11-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'b7c1d2e3f4a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LIDERES_INICIALES = ("Aurelio Morales", "Miguel Lopez", "Jazmin Villa", "Jesus Acosta")


def upgrade() -> None:
    """Upgrade schema."""
    # --- Catálogo de líderes técnicos ---
    lideres = op.create_table(
        'lideres_tecnicos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('nombre', sa.String(length=100), nullable=False, unique=True),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
    )
    op.create_index('ix_lideres_tecnicos_id', 'lideres_tecnicos', ['id'])
    op.bulk_insert(lideres, [{'nombre': n, 'activo': True} for n in LIDERES_INICIALES])

    # --- Columnas nuevas en actividades ---
    op.add_column('actividades', sa.Column('lider_catalogo_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_actividades_lider_catalogo', 'actividades', 'lideres_tecnicos', ['lider_catalogo_id'], ['id']
    )
    op.add_column('actividades', sa.Column('motivo_bloqueo', sa.String(length=500), nullable=True))

    # --- Horas por día ---
    op.create_table(
        'registros_horas',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('actividad_id', sa.Integer(), sa.ForeignKey('actividades.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('horas', sa.Float(), nullable=False),
        sa.Column('nota', sa.String(length=300), nullable=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('creado', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('horas > 0 AND horas <= 24', name='ck_registros_horas_rango'),
    )
    op.create_index('ix_registros_horas_id', 'registros_horas', ['id'])
    op.create_index('ix_registros_horas_actividad_id', 'registros_horas', ['actividad_id'])
    op.create_index('ix_registros_horas_fecha', 'registros_horas', ['fecha'])

    # Copia de las horas ya registradas (una fila por actividad con horas > 0)
    op.execute(
        """
        INSERT INTO registros_horas (actividad_id, fecha, horas, nota, usuario_id, creado)
        SELECT id,
               COALESCE(fecha_inicio, fecha_creacion::date),
               LEAST(horas_utilizadas, 24),
               'Horas previas (sin detalle por día)',
               asignado_a_id,
               now()
        FROM actividades
        WHERE horas_utilizadas > 0 AND horas_utilizadas <= 24
        """
    )
    # Actividades con más de 24 h acumuladas: se reparten en filas de 24 h como máximo
    op.execute(
        """
        INSERT INTO registros_horas (actividad_id, fecha, horas, nota, usuario_id, creado)
        SELECT a.id,
               COALESCE(a.fecha_inicio, a.fecha_creacion::date) + g.n,
               LEAST(24, a.horas_utilizadas - 24 * g.n),
               'Horas previas (sin detalle por día)',
               a.asignado_a_id,
               now()
        FROM actividades a
        CROSS JOIN LATERAL generate_series(0, CEIL(a.horas_utilizadas / 24.0)::int - 1) AS g(n)
        WHERE a.horas_utilizadas > 24
        """
    )

    # --- Comentarios y evidencias ---
    op.create_table(
        'comentarios',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('actividad_id', sa.Integer(), sa.ForeignKey('actividades.id', ondelete='CASCADE'), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('texto', sa.String(length=2000), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=True),
        sa.Column('creado', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_comentarios_id', 'comentarios', ['id'])
    op.create_index('ix_comentarios_actividad_id', 'comentarios', ['actividad_id'])

    # --- Historial (sin FK a actividades: sobrevive a su eliminación) ---
    op.create_table(
        'historial_actividades',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('actividad_id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('campo', sa.String(length=40), nullable=False),
        sa.Column('valor_anterior', sa.String(length=500), nullable=True),
        sa.Column('valor_nuevo', sa.String(length=500), nullable=True),
        sa.Column('creado', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_historial_actividades_id', 'historial_actividades', ['id'])
    op.create_index('ix_historial_actividades_actividad_id', 'historial_actividades', ['actividad_id'])

    # --- Restablecimiento de contraseña (solo hash del token) ---
    op.create_table(
        'tokens_restablecimiento',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False, unique=True),
        sa.Column('expira', sa.DateTime(), nullable=False),
        sa.Column('usado', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('creado_por_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='SET NULL'), nullable=True),
        sa.Column('creado', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_tokens_restablecimiento_id', 'tokens_restablecimiento', ['id'])
    op.create_index('ix_tokens_restablecimiento_usuario_id', 'tokens_restablecimiento', ['usuario_id'])
    op.create_index('ix_tokens_restablecimiento_token_hash', 'tokens_restablecimiento', ['token_hash'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('tokens_restablecimiento')
    op.drop_table('historial_actividades')
    op.drop_table('comentarios')
    op.drop_table('registros_horas')
    op.drop_column('actividades', 'motivo_bloqueo')
    op.drop_constraint('fk_actividades_lider_catalogo', 'actividades', type_='foreignkey')
    op.drop_column('actividades', 'lider_catalogo_id')
    op.drop_table('lideres_tecnicos')
