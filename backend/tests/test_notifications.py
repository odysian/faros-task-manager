from unittest.mock import MagicMock, patch

import pytest
from fastapi import status

import db_models
from services.notifications import get_or_create_preferences


def mark_email_verified(db_session, username):
    """Mark a user's email as verified in notification preferences."""
    # Look up user
    user = (
        db_session.query(db_models.User)
        .filter(db_models.User.username == username)
        .first()
    )

    if not user:
        raise ValueError(f"User {username} not found")

    # Get or create preferences
    prefs = get_or_create_preferences(user.id, db_session)

    # Mark as verified
    prefs.email_verified = True  # type: ignore
    db_session.commit()


@pytest.fixture
def mock_sns():
    """
    Mocks the email service for notification sending.
    Works with both Resend and AWS email implementations.
    """
    from unittest.mock import MagicMock

    mock_email = MagicMock()
    mock_email.send_email.return_value = True

    with patch("core.email.email_service", mock_email):
        # Also patch in services for backward compatibility
        with patch("services.notifications.email_service", mock_email):
            yield mock_email


def test_notification_preferences(authenticated_client):
    """
    Test that default notification preferences are set
    and that users can update them
    """
    response = authenticated_client.get("/notifications/preferences")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    print(data)
    assert data["email_enabled"] is True
    assert data["task_shared_with_me"] is True
    assert data["email_verified"] is False

    update = authenticated_client.patch(
        "/notifications/preferences", json={"task_shared_with_me": False}
    )
    assert update.status_code == status.HTTP_200_OK
    assert update.json()["task_shared_with_me"] is False

    response = response = authenticated_client.get("/notifications/preferences")
    data = response.json()
    assert data["task_shared_with_me"] == False
    assert data["email_enabled"] is True


def test_notification_lifecycle(client, db_session, create_user_and_token, mock_sns):
    # Bob's email is verified
    # Alice shares task with bob
    # Assert that sns_client is called when sharing task

    user_a_token = create_user_and_token("Alice", "usera@test.com", "password123")
    user_b_token = create_user_and_token("Bob", "userb@test.com", "password456")

    # Alice creates task
    response = client.post(
        "/tasks",
        json={"title": "User A task", "priority": "low"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED

    task_id = response.json()["id"]

    mark_email_verified(db_session, "Bob")

    # Alice shares task with Bob
    response = client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "Bob", "permission": "view"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    assert response.status_code == status.HTTP_201_CREATED
    mock_sns.send_email.assert_called_once()


def test_comment_notification(client, db_session, create_user_and_token, mock_sns):
    """Test that task owner gets notified when someone comments"""
    # ARRANGE
    user_a_token = create_user_and_token("Alice", "usera@test.com", "password123")
    user_b_token = create_user_and_token("Bob", "userb@test.com", "password456")

    # Alice verifies email
    mark_email_verified(db_session, "Alice")

    # Alice creates task
    task = client.post(
        "/tasks",
        json={"title": "User A task", "priority": "low"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    task_id = task.json()["id"]

    # Alice shares task with Bob
    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "Bob", "permission": "view"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # Reset mock to ignore the share notification
    mock_sns.reset_mock()

    # ACT: Bob comments
    client.post(
        f"/tasks/{task_id}/comments",
        json={"content": "This is a comment for a test"},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )

    # ASSERT
    mock_sns.send_email.assert_called_once()

    # Verify content
    call_args = mock_sns.send_email.call_args
    assert "New Comment" in call_args.kwargs["subject"]
    assert "Bob" in call_args.kwargs["body_text"]


def test_completed_notification(client, db_session, create_user_and_token, mock_sns):
    """Test that task owner gets notified when someone marks their task completed"""
    # ARRANGE
    user_a_token = create_user_and_token("Alice", "usera@test.com", "password123")
    user_b_token = create_user_and_token("Bob", "userb@test.com", "password456")

    # Alice verifies email
    mark_email_verified(db_session, "Alice")

    # Alice enables task completed notification
    response = client.patch(
        "notifications/preferences",
        json={"task_completed": True},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200

    # Alice creates task
    task = client.post(
        "/tasks",
        json={"title": "User A task", "priority": "low"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    task_id = task.json()["id"]

    # Alice shares task with Bob
    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "Bob", "permission": "edit"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # Reset mock to ignore the share notification
    mock_sns.reset_mock()

    # ACT: Bob marks Alice's task as completed
    response = client.patch(
        f"/tasks/{task_id}",
        json={"completed": True},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert response.status_code == status.HTTP_200_OK

    # ASSERT
    mock_sns.send_email.assert_called_once()

    # Verify content
    call_args = mock_sns.send_email.call_args
    assert "Task Completed" in call_args.kwargs["subject"]
    assert "Bob" in call_args.kwargs["body_text"]


def test_notification_guards(client, create_user_and_token, mock_sns):
    """Test that endpoints respect preferences"""
    # ARRANGE
    user_a_token = create_user_and_token("Alice", "usera@test.com", "password123")
    user_b_token = create_user_and_token("Bob", "userb@test.com", "password456")

    # Alice creates three tasks
    task1 = client.post(
        "/tasks",
        json={"title": "User A task 1", "priority": "low"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    task2 = client.post(
        "/tasks",
        json={"title": "User A task 2", "priority": "medium"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    task3 = client.post(
        "/tasks",
        json={"title": "User A task 3", "priority": "high"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    task1_id = task1.json()["id"]
    task2_id = task2.json()["id"]
    task3_id = task3.json()["id"]

    # SCENARIO 1: Unverified email
    # Alice shares task with Bob
    client.post(
        f"/tasks/{task1_id}/share",
        json={"shared_with_username": "Bob", "permission": "view"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    mock_sns.send_email.assert_not_called()
    mock_sns.reset_mock()

    # SCENARIO 2: Verified but sharing preference disabled
    # Bob verifies but disables sharing notification
    client.post(
        "notifications/verify", headers={"Authorization": f"Bearer {user_b_token}"}
    )
    client.patch(
        "/notifications/preferences",
        json={"task_shared_with_me": False},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )

    # Alice shares task with Bob
    client.post(
        f"/tasks/{task2_id}/share",
        json={"shared_with_username": "Bob", "permission": "view"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    mock_sns.send_email.assert_not_called()
    mock_sns.reset_mock()

    # SCENARIO 3: Master Switch
    # Bob enables sharing notification but disables master switch
    client.patch(
        "/notifications/preferences",
        json={"task_shared_with_me": True, "email_enabled": False},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    # Alice shares task with Bob
    client.post(
        f"/tasks/{task3_id}/share",
        json={"shared_with_username": "Bob", "permission": "view"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    mock_sns.send_email.assert_not_called()
