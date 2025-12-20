from fastapi import status


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
