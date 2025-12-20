"""make_verification_expires_timezone_aware

Revision ID: 72bcc27d54a7
Revises: ea39397b99b1
Create Date: 2025-12-19 19:36:12.347114

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "72bcc27d54a7"
down_revision: Union[str, Sequence[str], None] = "ea39397b99b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Convert column to timezone-aware
    op.alter_column(
        "users",
        "verification_expires",
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "verification_expires",
        type_=sa.DateTime(timezone=False),
        existing_nullable=True,
    )
