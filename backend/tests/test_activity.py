# tests/test_activity.py

from datetime import date

import pytest
from fastapi import status
from fastapi.testclient import TestClient


def test_activity_log_created_on_task_creation(authenticated_client):
    """Test that creating a task generates an activity log"""

    # Create a task
    response = authenticated_client.post(
        "/tasks",
        json={
            "title": "Test task",
            "priority": "high",
            "completed": False,
            "due_date": "2025-12-25",
        },
    )
    assert response.status_code == 201
    task_id = response.json()["id"]

    # Get activity logs
    activity_response = authenticated_client.get("/activity")
    assert activity_response.status_code == 200

    logs = activity_response.json()
    # Should have exactly one log (the task creation)
    assert len(logs) == 1

    log = logs[0]
    assert log["action"] == "created"
    assert log["resource_type"] == "task"
    assert log["resource_id"] == task_id
    assert log["username"] == "testuser"

    # Check details contain the task data
    assert log["details"]["title"] == "Test task"
    assert log["details"]["priority"] == "high"
    assert log["details"]["due_date"] == "2025-12-25"


def test_activity_log_tracks_updates_with_old_new_values(authenticated_client):
    """Test that updating a task logs old and new values"""

    # Create a task
    create_response = authenticated_client.post(
        "/tasks",
        json={"title": "Original title", "priority": "low", "completed": False},
    )
    task_id = create_response.json()["id"]

    # Update the task
    authenticated_client.patch(
        f"/tasks/{task_id}", json={"title": "Updated title", "priority": "high"}
    )

    # Get activity logs
    activity_response = authenticated_client.get("/activity?action=updated")

    logs = activity_response.json()
    assert len(logs) == 1

    log = logs[0]
    assert log["action"] == "updated"

    # Check old/new values tracking
    details = log["details"]
    assert "changed_fields" in details
    assert set(details["changed_fields"]) == {"title", "priority"}

    assert details["old_values"]["title"] == "Original title"
    assert details["old_values"]["priority"] == "low"

    assert details["new_values"]["title"] == "Updated title"
    assert details["new_values"]["priority"] == "high"


def test_activity_log_captures_data_before_deletion(authenticated_client):
    """Test that deleting a task logs the task data before deletion"""

    # Create a task
    create_response = authenticated_client.post(
        "/tasks",
        json={"title": "Task to delete", "priority": "medium", "completed": True},
    )
    task_id = create_response.json()["id"]

    # Delete the task
    delete_response = authenticated_client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    # Get activity logs
    activity_response = authenticated_client.get("/activity?action=deleted")

    logs = activity_response.json()
    assert len(logs) == 1

    log = logs[0]
    assert log["action"] == "deleted"
    assert log["resource_type"] == "task"
    assert log["resource_id"] == task_id

    # Verify deleted task data is preserved in log
    details = log["details"]
    assert details["title"] == "Task to delete"
    assert details["priority"] == "medium"
    assert details["completed"] == True


def test_activity_log_tracks_sharing(client, create_user_and_token):
    """Test that sharing a task creates activity log"""
    alice_token = create_user_and_token("alice", "alice@test.com", "pass1234")
    bob_token = create_user_and_token("bob", "bob@test.com", "pass1234")

    # Alice creates a task
    create_response = client.post(
        "/tasks",
        json={"title": "Shared task", "priority": "high"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    task_id = create_response.json()["id"]

    # Alice shares with Bob
    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "bob", "permission": "edit"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Check Alice's activity
    activity_response = client.get(
        "/activity?action=shared", headers={"Authorization": f"Bearer {alice_token}"}
    )

    logs = activity_response.json()
    assert len(logs) == 1

    log = logs[0]
    assert log["action"] == "shared"
    assert log["resource_type"] == "task"
    assert log["resource_id"] == task_id

    details = log["details"]
    assert details["shared_with_username"] == "bob"
    assert details["permission"] == "edit"


def test_activity_filtering_by_resource_type(authenticated_client):
    """Test filtering activity logs by resource type"""

    # Create a task
    task_response = authenticated_client.post(
        "/tasks", json={"title": "Test task", "priority": "high"}
    )
    task_id = task_response.json()["id"]

    # Add a comment
    authenticated_client.post(
        f"/tasks/{task_id}/comments", json={"content": "Test comment"}
    )

    # Get all activity (should have 2: task + comment)
    all_activity = authenticated_client.get("/activity")
    assert len(all_activity.json()) == 2

    # Filter for tasks only
    task_activity = authenticated_client.get("/activity?resource_type=task")
    task_logs = task_activity.json()
    assert len(task_logs) == 1
    assert task_logs[0]["resource_type"] == "task"

    # Filter for comments only
    comment_activity = authenticated_client.get("/activity?resource_type=comment")
    comment_logs = comment_activity.json()
    assert len(comment_logs) == 1
    assert comment_logs[0]["resource_type"] == "comment"


def test_activity_pagination(authenticated_client):
    """Test activity log pagination"""

    # Create 15 tasks
    for i in range(15):
        authenticated_client.post(
            "/tasks", json={"title": f"Task {i}", "priority": "low"}
        )

    # Get first page (limit 10)
    page1 = authenticated_client.get("/activity?limit=10&offset=0")
    assert len(page1.json()) == 10

    # Get second page
    page2 = authenticated_client.get("/activity?limit=10&offset=10")
    assert len(page2.json()) == 5  # Remaining 5

    # Verify no overlap between pages
    page1_ids = {log["id"] for log in page1.json()}
    page2_ids = {log["id"] for log in page2.json()}
    assert len(page1_ids & page2_ids) == 0  # No intersection


def test_users_only_see_their_own_activity(client, create_user_and_token):
    """Test that users can only see their own activity logs"""
    alice_token = create_user_and_token("alice", "alice@test.com", "pass1234")
    bob_token = create_user_and_token("bob", "bob@test.com", "pass1234")

    # Alice creates a task
    client.post(
        "/tasks",
        json={"title": "Alice's task", "priority": "high"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Bob creates a task
    client.post(
        "/tasks",
        json={"title": "Bob's task", "priority": "low"},
        headers={"Authorization": f"Bearer {bob_token}"},
    )

    # Bob checks his activity
    bob_activity = client.get(
        "/activity", headers={"Authorization": f"Bearer {bob_token}"}
    )
    bob_logs = bob_activity.json()

    # Bob should only see his own activity
    assert len(bob_logs) == 1
    assert bob_logs[0]["username"] == "bob"
    assert bob_logs[0]["details"]["title"] == "Bob's task"

    # Verify Alice's activity is not visible to Bob
    for log in bob_logs:
        assert log["username"] != "alice"


def test_task_timeline_shows_complete_history(authenticated_client):
    """Test task timeline endpoint shows all actions on a task"""

    # Create a task
    create_response = authenticated_client.post(
        "/tasks", json={"title": "Original", "priority": "low"}
    )
    task_id = create_response.json()["id"]

    # Update it
    authenticated_client.patch(f"/tasks/{task_id}", json={"title": "Updated"})

    # Update again
    authenticated_client.patch(f"/tasks/{task_id}", json={"priority": "high"})

    # Get task timeline
    timeline_response = authenticated_client.get(f"/activity/tasks/{task_id}")

    timeline = timeline_response.json()
    # Should have 3 logs: create + 2 updates
    assert len(timeline) == 3

    # Verify order (chronological for timeline)
    assert timeline[0]["action"] == "created"
    assert timeline[1]["action"] == "updated"
    assert timeline[2]["action"] == "updated"

    # Verify it's the same task
    for log in timeline:
        assert log["resource_type"] == "task"
        assert log["resource_id"] == task_id


def test_task_timeline_requires_permission(client, create_user_and_token):
    """Test that task timeline respects task permissions"""
    alice_token = create_user_and_token("alice", "alice@test.com", "pass1234")
    bob_token = create_user_and_token("bob", "bob@test.com", "pass1234")

    # Alice creates a task
    create_response = client.post(
        "/tasks",
        json={"title": "Alice's task", "priority": "high"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )
    task_id = create_response.json()["id"]

    # Bob tries to view timeline (should fail - not shared)
    bob_timeline = client.get(
        f"/activity/tasks/{task_id}", headers={"Authorization": f"Bearer {bob_token}"}
    )
    assert bob_timeline.status_code == 403

    # Alice shares with Bob
    client.post(
        f"/tasks/{task_id}/share",
        json={"shared_with_username": "bob", "permission": "view"},
        headers={"Authorization": f"Bearer {alice_token}"},
    )

    # Now Bob can view timeline
    bob_timeline = client.get(
        f"/activity/tasks/{task_id}", headers={"Authorization": f"Bearer {bob_token}"}
    )
    assert bob_timeline.status_code == 200

    # Bob sees activity from both users (Alice created, Alice shared)
    timeline = bob_timeline.json()
    assert len(timeline) >= 2  # At least creation + sharing


def test_activity_stats(authenticated_client):
    """Test activity statistics endpoint"""

    # Create some activity
    task1 = authenticated_client.post(
        "/tasks", json={"title": "Task 1", "priority": "high"}
    )
    task1_id = task1.json()["id"]

    task2 = authenticated_client.post(
        "/tasks", json={"title": "Task 2", "priority": "low"}
    )
    task2_id = task2.json()["id"]

    # Update one
    authenticated_client.patch(f"/tasks/{task1_id}", json={"title": "Updated"})

    # Delete one
    authenticated_client.delete(f"/tasks/{task2_id}")

    # Get stats
    stats_response = authenticated_client.get("/activity/stats")

    stats = stats_response.json()
    assert stats["total_activities"] == 4  # 2 creates + 1 update + 1 delete
    assert stats["by_action"]["created"] == 2
    assert stats["by_action"]["updated"] == 1
    assert stats["by_action"]["deleted"] == 1
    assert stats["by_resource"]["task"] == 4
