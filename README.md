# Task Manager API - Learning Project

A learning project building a REST API with FastAPI. This is my first real Python web application after working through backend fundamentals.

## What I'm Learning

- Building APIs with FastAPI
- Data validation with Pydantic
- REST principles (CRUD operations, proper HTTP methods/status codes)
- Query parameters for filtering and pagination
- Working with dates and timestamps in Python
- Code organization (separating models, routes, data)

## Current Features

- Create, read, update, and delete tasks
- Filter by completion status, priority, tags
- Search across task titles and descriptions
- Sort by different fields (date, priority, title)
- Pagination (skip/limit)
- Tag management (add/remove tags from tasks)
- Due dates with overdue detection
- Basic statistics endpoint
- Bulk operations

## Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic

# Run the API
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` to see the interactive API documentation.

## Project Structure
```
task-manager-api/
├── main.py           # App setup and entry point
├── models.py         # Pydantic models (data validation)
├── database.py       # In-memory data storage (temporary)
└── routers/
    └── tasks.py      # All task-related endpoints
```

## Example Endpoints
```bash
# Get all tasks
GET /tasks

# Filter high-priority tasks
GET /tasks?priority=high

# Search for tasks
GET /tasks?search=fastapi

# Create a task
POST /tasks
{
  "title": "Learn SQLAlchemy",
  "priority": "high",
  "tags": ["learning", "backend"]
}

# Get task statistics
GET /tasks/stats
```

## What I'm Working On Next

- Replace in-memory storage with PostgreSQL
- Learn SQL and SQLAlchemy ORM
- Database migrations with Alembic
- Proper database connection management

## Notes

- Currently using in-memory storage (data resets when server restarts)
- No authentication yet, will implement later
- Following a structured learning roadmap for Python backend development
- Building towards a portfolio of multiple deployed projects

## Resources I'm Using

- [FastAPI Official Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Real Python](https://realpython.com/)