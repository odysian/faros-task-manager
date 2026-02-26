"""make_remaining_datetimes_timezone_aware

Revision ID: 9d3f2c6117ac
Revises: 1826eab43703
Create Date: 2026-02-26 11:20:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9d3f2c6117ac"
down_revision: Union[str, Sequence[str], None] = "1826eab43703"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert remaining naive datetimes to TIMESTAMPTZ, assuming stored UTC values."""
    op.alter_column(
        "tasks",
        "created_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "task_files",
        "uploaded_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="uploaded_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "task_comments",
        "updated_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "task_shares",
        "shared_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        existing_server_default=sa.text("now()"),
        postgresql_using="shared_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    """Revert TIMESTAMPTZ columns back to naive timestamps."""
    op.alter_column(
        "task_shares",
        "shared_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=True,
        existing_server_default=sa.text("now()"),
        postgresql_using="shared_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "task_comments",
        "updated_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=True,
        postgresql_using="updated_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "task_files",
        "uploaded_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=True,
        postgresql_using="uploaded_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "tasks",
        "created_at",
        schema="faros",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=False,
        existing_server_default=sa.text("now()"),
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
