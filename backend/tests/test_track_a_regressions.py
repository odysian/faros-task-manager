import os
from datetime import datetime
from unittest.mock import patch

import pytest
from pydantic import ValidationError
from sqlalchemy import text

import db_models
from core.security import create_access_token
from core.settings import Settings


def _parse_iso_datetime(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def test_timestamptz_model_columns_are_timezone_aware():
    """Regression guard for Track A Task #2 model timezone settings."""
    assert db_models.Task.created_at.type.timezone is True
    assert db_models.TaskFile.uploaded_at.type.timezone is True
    assert db_models.TaskComment.updated_at.type.timezone is True
    assert db_models.TaskShare.shared_at.type.timezone is True


def test_timestamptz_database_columns_use_timestamp_with_time_zone(db_session):
    """Regression guard for Track A Task #2 migration output."""
    rows = db_session.execute(
        text(
            """
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'faros'
              AND (
                    (table_name = 'tasks' AND column_name = 'created_at')
                 OR (table_name = 'task_files' AND column_name = 'uploaded_at')
                 OR (table_name = 'task_comments' AND column_name = 'updated_at')
                 OR (table_name = 'task_shares' AND column_name = 'shared_at')
              )
            """
        )
    ).fetchall()

    assert len(rows) == 4
    assert all(row.data_type == "timestamp with time zone" for row in rows)


def test_task_created_at_response_is_timezone_aware(authenticated_client):
    """Regression guard for API serialization after TIMESTAMPTZ migration."""
    response = authenticated_client.post(
        "/tasks",
        json={"title": "Timezone regression guard", "priority": "medium"},
    )

    assert response.status_code == 201
    created_at = response.json()["created_at"]
    parsed = _parse_iso_datetime(created_at)
    assert parsed.tzinfo is not None


def test_settings_fail_fast_when_required_security_values_are_missing():
    """Regression guard for Task #4 centralized settings validation."""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValidationError):
            Settings(_env_file=None)


def test_settings_environment_defaults_and_overrides():
    with patch.dict(
        os.environ,
        {"SECRET_KEY": "secret", "ALGORITHM": "HS256", "ENVIRONMENT": "development"},
        clear=True,
    ):
        dev_settings = Settings(_env_file=None)
        assert dev_settings.database_url.endswith(":5433/task_manager")
        assert dev_settings.redis_url == "redis://localhost:6380/0"
        assert dev_settings.bcrypt_rounds == 12

    with patch.dict(
        os.environ,
        {"SECRET_KEY": "secret", "ALGORITHM": "HS256", "ENVIRONMENT": "production"},
        clear=True,
    ):
        prod_settings = Settings(_env_file=None)
        assert prod_settings.database_url.endswith(":5432/task_manager")
        assert prod_settings.redis_url == "redis://localhost:6379/0"

    with patch.dict(
        os.environ,
        {
            "SECRET_KEY": "secret",
            "ALGORITHM": "HS256",
            "DATABASE_URL": "postgresql://example/custom_db",
            "REDIS_URL": "redis://cache.example:6379/5",
            "TESTING": "true",
            "BCRYPT_ROUNDS": "8",
        },
        clear=True,
    ):
        explicit_settings = Settings(_env_file=None)
        assert explicit_settings.database_url == "postgresql://example/custom_db"
        assert explicit_settings.redis_url == "redis://cache.example:6379/5"
        assert explicit_settings.bcrypt_rounds == 8


def test_protected_route_rejects_token_without_subject_claim(client):
    """Auth edge case regression guard for cookie/bearer transition compatibility."""
    invalid_payload_token = create_access_token({"scope": "test-only"})
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {invalid_payload_token}"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token payload"


def test_protected_route_rejects_token_for_deleted_user(
    client, db_session, create_user_and_token
):
    """Auth edge case regression guard: token remains invalid after user deletion."""
    token = create_user_and_token("tempuser", "tempuser@test.com", "password123")

    user = (
        db_session.query(db_models.User)
        .filter(db_models.User.username == "tempuser")
        .first()
    )
    db_session.delete(user)
    db_session.commit()

    response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
    assert response.json()["detail"] == "User not found"
