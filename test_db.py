from db_config import SessionLocal
from db_models import Task

# Create a session
db = SessionLocal()

# Create a task
new_task = Task(
    title="Test from SQLAlchemy",
    description="This is stored in PostgreSQL",
    priority="High",
    tags=["test", "database"]
)

# Add and commit
db.add(new_task)
db.commit()
db.refresh(new_task) # Get the ID that was assigned

print(f"Created task with ID: {new_task.id}")

# Query it back
tasks = db.query(Task).all()
for task in tasks:
    print(f"{task.id}: {task.title} - {task.priority}")

db.close()