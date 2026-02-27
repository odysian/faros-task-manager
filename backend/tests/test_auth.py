from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from fastapi import status

import db_models
from core.settings import settings


@pytest.fixture
def mock_ses():
    """Mock email service for email sending."""
    from unittest.mock import MagicMock

    mock_email = MagicMock()
    mock_email.send_email.return_value = True

    with patch("core.email.email_service", mock_email):
        # Also patch in services for backward compatibility
        with patch("services.notifications.email_service", mock_email):
            yield mock_email


def test_register_new_user(client):
    """Test that a new user can successfully register"""

    # ARRANGE
    user_data = {
        "username": "chris",
        "email": "chris@example.com",
        "password": "secure_password123",
    }

    # ACT
    response = client.post("/auth/register", json=user_data)

    # ASSERT
    assert response.status_code == status.HTTP_201_CREATED

    response_data = response.json()
    assert response_data["username"] == "chris"
    assert response_data["email"] == "chris@example.com"
    assert "id" in response_data
    assert "hashed_password" not in response_data  # Security: don't return password
    assert "password" not in response_data


def test_register_duplicate_username(client, test_user):
    """Test that registering with an existing username fails"""

    # ARRANGE
    # test_user fixture already created user with username "testuser"
    duplicate_user = {
        "username": "testuser",  # Same username
        "email": "different@example.com",  # Different email
        "password": "password123",
    }

    # ACT
    response = client.post("/auth/register", json=duplicate_user)

    # ASSERT
    assert response.status_code == status.HTTP_409_CONFLICT


def test_login_success(client, test_user):
    """Test that a user can login with correct credentials"""

    # ARRANGE
    # test_user fixture created a user, we have their credentials
    login_data = {"username": test_user["username"], "password": test_user["password"]}

    # ACT
    response = client.post("/auth/login", json=login_data)

    # ASSERT
    assert response.status_code == status.HTTP_200_OK

    response_data = response.json()
    assert "access_token" in response_data
    assert response_data["token_type"] == "bearer"


def test_login_invalid_password(client, test_user):
    """Test that login fails with wrong password"""

    # ARRANGE
    login_data = {"username": test_user["username"], "password": "wrong_password"}

    # ACT
    response = client.post("/auth/login", json=login_data)

    # ASSERT
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_sets_http_only_auth_cookie(client, test_user):
    """Login should set the auth cookie with explicit cookie policy attributes."""
    response = client.post(
        "/auth/login",
        json={"username": test_user["username"], "password": test_user["password"]},
    )

    assert response.status_code == status.HTTP_200_OK

    set_cookie = response.headers.get("set-cookie", "")
    lowered = set_cookie.lower()

    assert f"{settings.ACCESS_TOKEN_COOKIE_NAME}=" in set_cookie
    assert "httponly" in lowered
    assert "path=/" in lowered
    assert f"max-age={settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}" in lowered
    assert f"samesite={settings.cookie_samesite}" in lowered


def test_cookie_auth_allows_access_without_bearer_header(client, test_user):
    """Auth dependency should accept cookie-backed session during migration rollout."""
    login_response = client.post(
        "/auth/login",
        json={"username": test_user["username"], "password": test_user["password"]},
    )
    assert login_response.status_code == status.HTTP_200_OK

    profile_response = client.get("/users/me")
    assert profile_response.status_code == status.HTTP_200_OK
    assert profile_response.json()["username"] == test_user["username"]


def test_logout_clears_cookie_and_blocks_follow_up_cookie_auth(client, test_user):
    """Logout should clear auth cookie and make subsequent cookie-only calls unauthenticated."""
    login_response = client.post(
        "/auth/login",
        json={"username": test_user["username"], "password": test_user["password"]},
    )
    assert login_response.status_code == status.HTTP_200_OK

    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == status.HTTP_200_OK
    assert logout_response.json()["message"] == "Logged out successfully"

    set_cookie = logout_response.headers.get("set-cookie", "").lower()
    assert f"{settings.ACCESS_TOKEN_COOKIE_NAME}=" in set_cookie
    assert "max-age=0" in set_cookie

    profile_response = client.get("/users/me")
    assert profile_response.status_code == status.HTTP_401_UNAUTHORIZED
    assert profile_response.json()["detail"] == "Not authenticated"


def test_bearer_header_still_supported_during_cookie_migration(client, test_user):
    """Compatibility window: bearer tokens continue to authenticate protected routes."""
    login_response = client.post(
        "/auth/login",
        json={"username": test_user["username"], "password": test_user["password"]},
    )
    assert login_response.status_code == status.HTTP_200_OK
    token = login_response.json()["access_token"]

    client.cookies.clear()
    profile_response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert profile_response.status_code == status.HTTP_200_OK
    assert profile_response.json()["username"] == test_user["username"]


def test_change_password_success(authenticated_client):
    """Test successful password change"""

    response = authenticated_client.patch(
        "/users/me/change-password",
        json={
            "current_password": "testpass123",  # Original password
            "new_password": "newpassword123",
        },
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

    # Verify old password no longer works
    login_response = authenticated_client.post(
        "/auth/login", json={"username": "testuser", "password": "password123"}
    )
    assert login_response.status_code == 401

    # Verify new password works
    login_response = authenticated_client.post(
        "/auth/login", json={"username": "testuser", "password": "newpassword123"}
    )
    assert login_response.status_code == 200


def test_password_reset_lifecycle(client, create_user_and_token, mock_ses, db_session):
    """Test that password reset request sends"""

    test_user_token = create_user_and_token("Alice", "usera@test.com", "password123")

    reset_request_data = {"email": "usera@test.com"}
    response = client.post("/auth/password-reset/request", json=reset_request_data)
    assert response.status_code == 200
    assert response.json()["message"] == "If email exists, password reset sent"
    mock_ses.send_email.assert_called_once()

    user_data = (
        db_session.query(db_models.User)
        .filter(db_models.User.email == "usera@test.com")
        .first()
    )
    reset_token = user_data.password_reset_token

    response = client.post(
        "/auth/password-reset/verify",
        json={"token": reset_token, "new_password": "password456"},
    )
    assert response.status_code == 200
    assert (
        response.json()["message"]
        == "Password updated successfully. You can now log in with your new password."
    )
