from db_config import SessionLocal
from db_models import Task
from datetime import datetime, date, timedelta

# Create session
db = SessionLocal()

# Clear existing data (optional)
db.query(Task).delete()
db.commit()

# Create sample tasks
now = datetime.now()
today = date.today()

sample_tasks = [
    Task(
        title="Learn FastAPI",
        description="Complete the FastAPI tutorial",
        completed=False,
        priority="high",
        created_at=now - timedelta(days=7),
        due_date=today + timedelta(days=2),
        tags=["learning", "backend"]
    ),
    Task(
        title="Build Task API",
        description="Create CRUD endpoints with PostgreSQL",
        completed=True,
        priority="medium",
        created_at=now - timedelta(days=6),
        due_date=None,
        tags=["backend", "api"]
    ),
    Task(
        title="Add authentication",
        description=None,
        completed=False,
        priority="low",
        created_at=now - timedelta(days=5),
        due_date=today - timedelta(days=1),  # Overdue!
        tags=["security", "backend"]
    ),
    Task(
        title="Deploy to AWS",
        description="Use ECS for deployment",
        completed=False,
        priority="high",
        created_at=now - timedelta(days=4),
        due_date=today,
        tags=["devops", "aws"]
    ),
    Task(
        title="Write tests",
        description="Add pytest test suite",
        completed=False,
        priority="medium",
        created_at=now - timedelta(days=3),
        due_date=today + timedelta(days=7),
        tags=["testing", "backend"]
    ),
    Task(
        title="Setup CI/CD",
        description="GitHub Actions pipeline",
        completed=True,
        priority="low",
        created_at=now - timedelta(days=2),
        due_date=None,
        tags=["devops", "automation"]
    ),
    Task(
        title="Add pagination",
        description="Implement skip and limit",
        completed=False,
        priority="medium",
        created_at=now - timedelta(days=1),
        due_date=today + timedelta(days=3),
        tags=["backend", "api"]
    ),
    Task(
        title="Document API",
        description=None,
        completed=True,
        priority="high",
        created_at=now,
        due_date=None,
        tags=["documentation"]
    ),
]

# Add all tasks
for task in sample_tasks:
    db.add(task)

# Commit to database
db.commit()

print(f"Created {len(sample_tasks)} tasks successfully!")

# Show them
tasks = db.query(Task).all()
for task in tasks:
    print(f"{task.id}: {task.title} - {task.priority} - {task.tags}")

db.close()