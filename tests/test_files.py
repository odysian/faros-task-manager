from unittest.mock import MagicMock, patch

import pytest
from fastapi import status


# --- FIXTURE: Mock Storage ---
@pytest.fixture
def mock_s3():
    """
    Mocks the storage abstraction layer for file operations.
    Works with both local and S3 storage implementations.
    """
    from unittest.mock import MagicMock

    mock_storage = MagicMock()
    mock_storage.upload_file.return_value = None
    mock_storage.download_file.return_value = b"real content"
    mock_storage.delete_file.return_value = None
    mock_storage.file_exists.return_value = True

    # For local storage, also mock get_file_path
    mock_storage.get_file_path.return_value = MagicMock(exists=lambda: True)

    with patch("core.storage.storage", mock_storage):
        # Also patch in routers for backward compatibility
        with patch("routers.files.storage", mock_storage):
            with patch("routers.users.storage", mock_storage):
                with patch("services.background_tasks.storage", mock_storage):
                    yield mock_storage


# --- Editor Can Upload ---
def test_editor_can_upload_file(client, create_user_and_token, mock_s3):
    """Test that a shared user with EDIT permissions CAN upload"""

    # ARRANGE
    alice_token = create_user_and_token("alice", "alice@test.com", "password")
    bob_token = create_user_and_token("bob", "bob@test.com", "password")

    # 1. Setup Task & Share
    task = client.post(
        "/tasks",
        json={"title": "File Task", "priority": "low"},
        headers={"Authorization": f"Bearer {alice_token}"},
    ).json()
    task_id = task["id"]

    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "bob", "permission": "edit"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # 2. Fake File
    files_payload = {"file": ("test.txt", b"fake content", "text/plain")}

    # ACT
    response = client.post(
        f"/tasks/{task_id}/files",
        files=files_payload,
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    # ASSERT
    assert response.status_code == status.HTTP_201_CREATED
    mock_s3.upload_file.assert_called_once()


# --- Viewer Cannot Upload ---
def test_viewer_cannot_upload_file(client, create_user_and_token, mock_s3):
    """Test that a shared user with VIEW permissions CANNOT upload"""

    # ARRANGE
    alice_token = create_user_and_token("alice", "alice@test.com", "password")
    charlie_token = create_user_and_token("charlie", "charlie@test.com", "password")

    # 1. Setup Task & Share
    task = client.post(
        "/tasks",
        json={"title": "View Task", "priority": "low"},
        headers={"Authorization": f"Bearer {alice_token}"},
    ).json()
    task_id = task["id"]

    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "charlie", "permission": "view"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    files_payload = {"file": ("test.txt", b"content", "text/plain")}

    # ACT
    response = client.post(
        f"/tasks/{task_id}/files",
        files=files_payload,
        headers={"Authorization": f"Bearer {charlie_token}"},
    )

    # ASSERT
    assert response.status_code == status.HTTP_403_FORBIDDEN
    mock_s3.upload_file.assert_not_called()


# --- Viewer Can Download ---
def test_viewer_can_download_file(client, create_user_and_token, mock_s3):
    """Test that a viewer can download a file"""

    # ARRANGE
    alice_token = create_user_and_token("alice", "alice@test.com", "password")
    charlie_token = create_user_and_token("charlie", "charlie@test.com", "password")

    # 1. Setup Task & Share
    task = client.post(
        "/tasks",
        json={"title": "Download Task", "priority": "low"},
        headers={"Authorization": f"Bearer {alice_token}"},
    ).json()
    task_id = task["id"]

    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "charlie", "permission": "view"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # 2. Alice uploads a file (to populate DB)
    files_payload = {"file": ("alice_file.txt", b"real content", "text/plain")}
    upload_res = client.post(
        f"/tasks/{task_id}/files",
        files=files_payload,
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    file_id = upload_res.json()["id"]

    # ACT (Using the NEW clean URL)
    response = client.get(
        f"/files/{file_id}",  # <--- Look! No double /files/files/
        headers={"Authorization": f"Bearer {charlie_token}"},
    )

    # ASSERT
    assert response.status_code == status.HTTP_200_OK
    assert response.content == b"real content"
    mock_s3.download_file.assert_called_once()


# --- Editor Can Delete ---
def test_editor_can_delete_file(client, create_user_and_token, mock_s3):
    """Test that an editor can delete a file"""

    # ARRANGE
    alice_token = create_user_and_token("alice", "alice@test.com", "password")
    bob_token = create_user_and_token("bob", "bob@test.com", "password")

    # 1. Setup Task & Share
    task = client.post(
        "/tasks",
        json={"title": "Delete Task", "priority": "low"},
        headers={"Authorization": f"Bearer {alice_token}"},
    ).json()
    task_id = task["id"]

    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "bob", "permission": "edit"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # 2. Upload file
    files_payload = {"file": ("todelete.txt", b"trash", "text/plain")}
    upload_res = client.post(
        f"/tasks/{task_id}/files",
        files=files_payload,
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    file_id = upload_res.json()["id"]

    # ACT (Using the NEW clean URL)
    response = client.delete(
        f"/files/{file_id}",  # <--- Clean URL
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    # ASSERT
    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_s3.delete_file.assert_called_once()
