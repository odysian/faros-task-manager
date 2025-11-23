from fastapi import HTTPException
from typing import Dict, Any

# In-memory storage (will be replaced with database later)
tasks = []
task_id_counter = 0

# Sample data for testing
sample_tasks = [
        {"id": 1, "title": "Learn FastAPI", "description": "Complete the tutorial", "completed": False},
        {"id": 2, "title": "Build Task API", "description": "Create CRUD endpoints", "completed": True},
        {"id": 3, "title": "Add authentication", "description": None, "completed": False},
        {"id": 4, "title": "Deploy to AWS", "description": "Use ECS for deployment", "completed": False},
        {"id": 5, "title": "Write tests", "description": "Add pytest test suite", "completed": False},
        {"id": 6, "title": "Setup CI/CD", "description": "GitHub Actions pipeline", "completed": True},
        {"id": 7, "title": "Add pagination", "description": "Implement skip and limit", "completed": False},
        {"id": 8, "title": "Document API", "description": None, "completed": True},
]
tasks.extend(sample_tasks)
task_id_counter = len(tasks)

def get_task_by_id(task_id: int) -> dict: # type: ignore
    """
    Find a task by ID or raise 404.

    This centralizes the search logic so endpoints dont repeat it.
    """
    for task in tasks:
        if task["id"] == task_id:
            return task
        
        raise HTTPException(
            status_code=404,
            detail=f"Task with id {task_id} not found"
        )