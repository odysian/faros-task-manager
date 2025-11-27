from fastapi import status

def test_create_task_successfully(authenticated_client):
    """Test that an authenticated user can create a task"""

    # ARRANGE
    task_data = {
        "title": "Write more tests",
        "description": "Test all the task endpoints",
        "priority": "high"
    }

    # ACT
    response = authenticated_client.post("/tasks", json=task_data)

    # ASSERT
    assert response.status_code == status.HTTP_201_CREATED

    response_data = response.json()
    assert response_data["title"] == "Write more tests"
    assert response_data["description"] == "Test all the task endpoints"
    assert response_data["priority"] == "high"
    assert response_data["completed"] == False
    assert "id" in response_data
    assert "created_at" in response_data
    assert "user_id" in response_data


def test_create_task_without_authentication(client):
    """Test that craeting a task without auth fails"""

    # ARRANGE
    task_data = {
        "title": "Unauthorized task",
        "priority": "low"
    }

    # ACT
    response = client.post("/tasks", json=task_data)

    # ASSERT
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_tasks_returns_only_user_tasks(authenticated_client):
    """Test that users only see their own tasks"""

    # ARRANGE - Create 2 tasks as authenticated user
    task1 = {"title": "My task 1", "priority": "high"}
    task2 = {"title": "My task 2", "priority": "low"}

    authenticated_client.post("/tasks", json=task1)
    authenticated_client.post("/tasks", json=task2)

    # ACT
    response = authenticated_client.get("/tasks")

    # ASSERT
    assert response.status_code == status.HTTP_200_OK

    tasks = response.json()
    assert len(tasks) == 2
    assert tasks[0]["title"] == "My task 1"
    assert tasks[1]["title"] == "My task 2"


def test_get_tasks_empty_list(authenticated_client):
    """Test that getting tasks with no tasks returns empty list"""

    # ARRANGE - Don't create any tasks

    # ACT
    response = authenticated_client.get("/tasks")

    # ASSERT
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_get_single_task_successfully(authenticated_client):
    """Test getting a specific task by ID"""

    # ARRANGE - Create a task first
    create_response = authenticated_client.post("/tasks", json={
        "title": "Specific task",
        "priority": "medium"
    })
    task_id = create_response.json()["id"]

    # ACT
    response = authenticated_client.get(f"/tasks/{task_id}")

    # ASSERT
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == task_id
    assert response.json()["title"] == "Specific task"


def test_get_nonexistent_task(authenticated_client):
    """Test that getting a non-existent task returns 404"""

    # ARRANGE
    nonexistent_id = 99999

    # ACT
    response = authenticated_client.get(f"/tasks/{nonexistent_id}")

    # ASSERT
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_task_successfully(authenticated_client):
    """Test that a user can update their own task"""

    # ARRANGE - Create a task first
    create_response = authenticated_client.post("/tasks", json={
        "title": "Original title",
        "description": "Original description",
        "priority": "low",
        "completed": False
    })
    task_id = create_response.json()["id"]

    # Prepare the update data
    update_data = {
        "title": "Updated title",
        "completed": True,
        "priority": "high"
    }

    # ACT
    response = authenticated_client.patch(f"/tasks/{task_id}", json=update_data)

    # ASSERT
    assert response.status_code == status.HTTP_200_OK

    updated_task = response.json()
    assert updated_task["title"] == "Updated title"
    assert updated_task["completed"] == True
    assert updated_task["priority"] == "high"
    assert updated_task["description"] == "Original description" # Unchanged


def test_update_nonexistent_task(authenticated_client):
    """Test that updating a non-existent task returns 404"""

    # ARRANGE
    update_data = {"title": "New title"}

    # ACT
    response = authenticated_client.patch("/tasks/99999", json=update_data)

    # ASSERT
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_task_successfully(authenticated_client):
    """Test that a user can delete their own task"""

    # ARRANGE - Create a task first
    create_response = authenticated_client.post("/tasks", json={
        "title": "Original title",
        "priority": "low"
    })
    task_id = create_response.json()["id"]

    # ACT
    response = authenticated_client.delete(f"/tasks/{task_id}")

    # ASSERT
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify task is actually deleted
    get_response = authenticated_client.get(f"/tasks/{task_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_nonexistent_task(authenticated_client):
    """Test that deletting a non-existent task returns 404"""

    # ACT
    response = authenticated_client.delete("/tasks/99999")

    # ASSERT
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_user_cannot_get_another_users_task(client, create_user_and_token):
    """Test that a user cannot access another user's task"""
    
    # ARRANGE - Create User A with a task
    user_a_token = create_user_and_token("usera", "usera@test.com", "pass1234")
    user_b_token = create_user_and_token("userb", "userb@test.com", "pass5678")
    
    # User A creates a task
    task_response = client.post("/tasks", 
        json={"title": "User A's task", "priority": "high"},
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    task_id = task_response.json()["id"]
    
    # ACT - User B tries to access User A's task
    response = client.get(f"/tasks/{task_id}",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )
    
    # ASSERT
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_user_cannot_update_another_users_task(client, create_user_and_token):
    """Test that a user cannot update another user's task"""
    
    # ARRANGE
    user_a_token = create_user_and_token("usera", "usera@test.com", "pass1234")
    user_b_token = create_user_and_token("userb", "userb@test.com", "pass5678")
    
    # User A creates a task
    task_response = client.post("/tasks",
        json={"title": "User A's task", "priority": "high"},
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    task_id = task_response.json()["id"]
    
    # ACT - User B tries to update User A's task
    response = client.patch(f"/tasks/{task_id}",
        json={"title": "Hacked!"},
        headers={"Authorization": f"Bearer {user_b_token}"}
    )
    
    # ASSERT
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_user_cannot_delete_another_users_task(client, create_user_and_token):
    """Test that a user cannot delete another user's task"""
    
    # ARRANGE
    user_a_token = create_user_and_token("usera", "usera@test.com", "pass1234")
    user_b_token = create_user_and_token("userb", "userb@test.com", "pass5678")
    
    # User A creates a task
    task_response = client.post("/tasks",
        json={"title": "User A's task", "priority": "high"},
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    task_id = task_response.json()["id"]
    
    # ACT - User B tries to delete User A's task
    response = client.delete(f"/tasks/{task_id}",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )
    
    # ASSERT
    assert response.status_code == status.HTTP_403_FORBIDDEN 