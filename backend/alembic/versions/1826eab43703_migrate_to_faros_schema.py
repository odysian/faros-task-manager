"""migrate_to_faros_schema

Revision ID: 1826eab43703
Revises: a144594cccf5
Create Date: 2026-02-03 19:42:32.631847

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op
from db_config import Base
from db_models import (  # noqa: F401
    ActivityLog,
    NotificationPreference,
    Task,
    TaskComment,
    TaskFile,
    TaskShare,
    User,
)

# revision identifiers, used by Alembic.
revision: str = "1826eab43703"
down_revision: Union[str, Sequence[str], None] = "a144594cccf5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - create faros schema and ensure alembic_version is in faros."""
    # Create faros schema if it doesn't exist
    # (This is also handled automatically by env.py, but including for safety)
    op.execute(sa.text("CREATE SCHEMA IF NOT EXISTS faros"))

    # Handle alembic_version table migration
    # Check if it exists in both schemas
    connection = op.get_bind()

    # Check if it exists in faros schema
    result_faros = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'faros'
            AND table_name = 'alembic_version'
        )
    """
        )
    )
    exists_in_faros = result_faros.scalar()

    # Check if it exists in public schema
    result_public = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'alembic_version'
        )
    """
        )
    )
    exists_in_public = result_public.scalar()

    # Only move if it exists in public but NOT in faros
    # (If it's already in faros, Alembic created it there automatically - leave it alone)
    if exists_in_public and not exists_in_faros:
        op.execute(sa.text("ALTER TABLE public.alembic_version SET SCHEMA faros"))
    # If it exists in both, drop the one in public (shouldn't happen, but handle it)
    elif exists_in_public and exists_in_faros:
        op.execute(sa.text("DROP TABLE public.alembic_version"))
    # If it doesn't exist in either, Alembic will create it automatically in faros
    # (because version_table_schema is set to 'faros' in env.py)

    # Create all application tables in faros schema
    # We explicitly create each table with schema='faros' to ensure they're in the right place

    # 1. Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("email_verified", sa.Boolean(), nullable=True),
        sa.Column("verification_code", sa.String(), nullable=True),
        sa.Column("verification_expires", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_reset_token", sa.String(), nullable=True),
        sa.Column("password_reset_token_expires", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="faros",
    )
    op.create_index(op.f("ix_faros_users_email"), "users", ["email"], unique=True, schema="faros")
    op.create_index(op.f("ix_faros_users_id"), "users", ["id"], unique=False, schema="faros")
    op.create_index(op.f("ix_faros_users_username"), "users", ["username"], unique=True, schema="faros")

    # 2. Tasks table
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("tags", sa.ARRAY(sa.String()), nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["faros.users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="faros",
    )
    op.create_index(op.f("ix_faros_tasks_id"), "tasks", ["id"], unique=False, schema="faros")

    # 3. Task files table
    op.create_table(
        "task_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["task_id"], ["faros.tasks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_filename"),
        schema="faros",
    )
    op.create_index(op.f("ix_faros_task_files_id"), "task_files", ["id"], unique=False, schema="faros")

    # 4. Task comments table
    op.create_table(
        "task_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.String(length=1000), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["task_id"],
            ["faros.tasks.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["faros.users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="faros",
    )

    # 5. Task shares table
    op.create_table(
        "task_shares",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), nullable=False),
        sa.Column("permission", sa.String(length=20), nullable=False),
        sa.Column(
            "shared_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True
        ),
        sa.Column("shared_by_user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["faros.tasks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["shared_with_user_id"],
            ["faros.users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["shared_by_user_id"],
            ["faros.users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("task_id", "shared_with_user_id", name="unique_task_share"),
        schema="faros",
    )
    op.create_index(op.f("ix_faros_task_shares_id"), "task_shares", ["id"], unique=False, schema="faros")

    # 6. Notification preferences table
    op.create_table(
        "notification_preferences",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("email_enabled", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("task_shared_with_me", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("task_completed", sa.Boolean(), server_default="false", nullable=True),
        sa.Column("comment_on_my_task", sa.Boolean(), server_default="true", nullable=True),
        sa.Column("task_due_soon", sa.Boolean(), server_default="true", nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["faros.users.id"],
        ),
        sa.PrimaryKeyConstraint("user_id"),
        schema="faros",
    )

    # 7. Activity logs table
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("resource_type", sa.String(length=50), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["faros.users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="faros",
    )
    op.create_index(
        "ix_activity_logs_action", "activity_logs", ["action"], unique=False, schema="faros"
    )
    op.create_index(
        "ix_activity_logs_created_at", "activity_logs", ["created_at"], unique=False, schema="faros"
    )
    op.create_index(
        "ix_activity_logs_resource",
        "activity_logs",
        ["resource_type", "resource_id"],
        unique=False,
        schema="faros",
    )
    op.create_index(
        "ix_activity_logs_user_id", "activity_logs", ["user_id"], unique=False, schema="faros"
    )

    # Note: The tables in public schema will remain there unused.
    # This migration creates fresh tables in the faros schema.
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema - drop all tables in faros schema and move alembic_version back to public."""
    # Drop all application tables in faros schema (in reverse order due to foreign keys)
    op.drop_index("ix_activity_logs_user_id", table_name="activity_logs", schema="faros")
    op.drop_index("ix_activity_logs_resource", table_name="activity_logs", schema="faros")
    op.drop_index("ix_activity_logs_created_at", table_name="activity_logs", schema="faros")
    op.drop_index("ix_activity_logs_action", table_name="activity_logs", schema="faros")
    op.drop_table("activity_logs", schema="faros")

    op.drop_table("notification_preferences", schema="faros")

    op.drop_index(op.f("ix_faros_task_shares_id"), table_name="task_shares", schema="faros")
    op.drop_table("task_shares", schema="faros")

    op.drop_table("task_comments", schema="faros")

    op.drop_index(op.f("ix_faros_task_files_id"), table_name="task_files", schema="faros")
    op.drop_table("task_files", schema="faros")

    op.drop_index(op.f("ix_faros_tasks_id"), table_name="tasks", schema="faros")
    op.drop_table("tasks", schema="faros")

    op.drop_index(op.f("ix_faros_users_username"), table_name="users", schema="faros")
    op.drop_index(op.f("ix_faros_users_id"), table_name="users", schema="faros")
    op.drop_index(op.f("ix_faros_users_email"), table_name="users", schema="faros")
    op.drop_table("users", schema="faros")

    # Move alembic_version table back to public schema
    connection = op.get_bind()

    # Check if it exists in faros schema
    result_faros = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'faros'
            AND table_name = 'alembic_version'
        )
    """
        )
    )
    exists_in_faros = result_faros.scalar()

    # Check if it exists in public schema
    result_public = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'alembic_version'
        )
    """
        )
    )
    exists_in_public = result_public.scalar()

    # Only move if it exists in faros and not in public
    if exists_in_faros and not exists_in_public:
        op.execute(sa.text("ALTER TABLE faros.alembic_version SET SCHEMA public"))
    # If it doesn't exist in faros, Alembic will handle version tracking
    # ### end Alembic commands ###
