# Task Manager API - Learning Project

A REST API built with FastAPI and PostgreSQL as I work through a 16-week backend development roadmap. This project tracks my progression from basic CRUD operations through database integration to a secure multi-user system with proper testing and error handling.

**GitHub Repository:** https://github.com/odysian/task-manager-api

## What I've Built So Far

**Phase 1: FastAPI Fundamentals**
- Building REST APIs with proper HTTP methods and status codes
- Request/response validation with Pydantic
- Query parameters for filtering, search, sorting, pagination
- Working with dates and timestamps
- Organizing code into modules (models, routes, database)

**Phase 2: Database Integration**
- PostgreSQL setup and configuration
- SQLAlchemy ORM (models, sessions, queries)
- Database migrations with Alembic
- Connection management via dependency injection
- Migrating from in-memory storage to persistent database

**Phase 3: Authentication & Security**
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes using FastAPI dependencies
- Multi-user data isolation (users can only see their own tasks)
- Environment variables for secrets management

**Phase 4: Testing & Error Handling**
- Pytest test suite with 38 passing tests
- Test database isolation using fixtures
- Custom exception classes for business logic errors
- Centralized exception handlers for consistent error responses
- Production-quality logging (file + console output)
- Complete audit trail for debugging and security

## Current Features

- Full CRUD operations for tasks
- Advanced filtering (completed status, priority, tags, overdue detection)
- Text search across title and description
- Sorting and pagination
- Tag management (add/remove tags per task)
- Bulk updates (modify multiple tasks at once)
- Task statistics (completion rates, priority breakdown, tag counts)
- User registration and login with JWT tokens
- Multi-user support with proper data isolation
- Comprehensive test coverage (38 tests)
- Structured error handling with custom exceptions
- Application logging for monitoring and debugging

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose), bcrypt (passlib)
- **Testing:** pytest, httpx
- **Server:** Uvicorn
- **Environment:** Python 3.12 on Xubuntu VM

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL

### Installation
```bash
# Clone and navigate
git clone https://github.com/odysian/task-manager-api
cd task-manager-api

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic sqlalchemy psycopg2-binary alembic \
  "passlib[bcrypt]" "python-jose[cryptography]" python-dotenv pytest httpx

# Set up PostgreSQL
sudo -i -u postgres
psql
CREATE DATABASE task_manager;
CREATE DATABASE task_manager_test;
CREATE USER task_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE task_manager TO task_user;
GRANT ALL PRIVILEGES ON DATABASE task_manager_test TO task_user;
\q
exit

# Create .env file
cat > .env << EOF
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOF

# Run migrations
alembic upgrade head

# Start the server
uvicorn main:app --reload
```

Visit http://localhost:8000/docs for interactive API documentation.

## Project Structure
```
task-manager-api/
├── main.py              # App setup, exception handlers, lifespan
├── models.py            # Pydantic models (request/response validation)
├── db_models.py         # SQLAlchemy models (database tables)
├── db_config.py         # Database connection and session management
├── auth.py              # Password hashing and JWT utilities
├── dependencies.py      # FastAPI dependencies (get_current_user)
├── exceptions.py        # Custom exception classes
├── logging_config.py    # Logging setup (console + file)
├── .env                 # Secrets (not in Git)
├── alembic/             # Database migrations
│   └── versions/
├── routers/
│   ├── tasks.py         # Task endpoints
│   └── auth.py          # Registration and login
├── tests/               # Pytest test suite (38 tests)
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_tasks.py
├── logs/
│   └── app.log          # Application logs (not in Git)
└── notes/
    ├── 01-fastapi.md
    ├── 02-databases.md
    └── 03-auth.md
```

## Example Usage

### Authentication

Register and login to get a JWT token:
```bash
# Register
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "chris", "email": "chris@example.com", "password": "securepass"}'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "chris", "password": "securepass"}'

# Returns: {"access_token": "eyJhbGc...", "token_type": "bearer"}
```

Use the token in the Authorization header for all task endpoints.

### Task Management
```bash
# Create a task
POST /tasks
{
  "title": "Learn SQLAlchemy",
  "description": "Master ORM concepts",
  "priority": "high",
  "due_date": "2025-12-01",
  "tags": ["learning", "backend"]
}

# Get all tasks with filters
GET /tasks?priority=high&completed=false&sort_by=due_date

# Search tasks
GET /tasks?search=sqlalchemy

# Get overdue tasks
GET /tasks?overdue=true

# Add tags to existing task
POST /tasks/1/tags
["urgent", "review"]

# Bulk update
PATCH /tasks/bulk
{
  "task_ids": [1, 2, 3],
  "updates": {"completed": true, "priority": "low"}
}

# Get statistics
GET /tasks/stats
```

## Testing

Run the test suite:
```bash
# All tests
pytest

# Verbose output
pytest -v

# Specific test file
pytest tests/test_auth.py

# With coverage
pytest --cov=. --cov-report=html
```

**Test Coverage (38 tests):**
- Authentication (4 tests): registration, login, token validation, failures
- CRUD operations (6 tests): create, read, update, delete, not found, empty lists
- Authorization (3 tests): multi-user isolation across GET/PATCH/DELETE
- Validation (4 tests): missing fields, invalid types, edge cases
- Query parameters (6 tests): filtering, search, sorting, pagination
- Statistics (3 tests): basic stats, empty stats, multi-user isolation
- Bulk operations (3 tests): valid updates, partial failures, validation
- Tag management (6 tests): add tags, remove tags, duplicates, not found, authorization

All tests use a separate test database with automatic cleanup between tests.

## Error Handling

Custom exception classes provide structured error responses:
```json
// Task not found
GET /tasks/99999
{
  "error": "Task Not Found",
  "message": "Task with ID 99999 not found",
  "task_id": 99999
}

// Unauthorized access (trying to access another user's task)
GET /tasks/5
{
  "error": "Unauthorized Access",
  "message": "You do not have permission to access this task"
}

// Duplicate username
POST /auth/register
{
  "error": "Duplicate User",
  "message": "Username 'chris' is already registered",
  "field": "username"
}
```

## Logging

Application logs go to both console and `logs/app.log`:
```
2025-11-29 00:10:58 - routers.auth - INFO - User registered successfully: username='chris', user_id=1
2025-11-29 00:10:59 - routers.auth - WARNING - Login failed for username: chris (invalid credentials)
2025-11-29 00:11:03 - routers.tasks - WARNING - Unauthorized access attempt: user_id=2 tried to access task_id=1
2025-11-29 00:11:01 - main - ERROR - TaskNotFoundError: Task with ID 99999 not found (path: /tasks/99999)
```

Log levels:
- **INFO**: Normal operations (login, task created, etc.)
- **WARNING**: Security events (failed login, unauthorized access)
- **ERROR**: Failures (task not found, validation errors)

This creates a complete audit trail for debugging and security monitoring.

## Database Migrations
```bash
# After changing models
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View history
alembic history
```

## Security Notes

- Passwords hashed with bcrypt (never stored in plain text)
- JWT tokens expire after 60 minutes
- SECRET_KEY stored in `.env` (never committed)
- All task endpoints require authentication
- Users can only access their own tasks
- Custom exceptions prevent information leakage
- Comprehensive logging for security monitoring

## What's Next

**Week 9-10: Advanced Features**
- File uploads and storage
- Background tasks for async operations
- Caching for performance improvements
- Rate limiting

**Later: Deployment**
- Dockerize the application
- Set up CI/CD pipeline
- Deploy to production environment
- Configure production database

## Key Learnings

**Testing:**
- Test database isolation is crucial (separate DB, cleanup fixtures)
- Factory functions for creating test users/tokens reduce duplication
- Testing authorization requires multiple users and checking access
- Found and fixed bugs during testing (completed field behavior, status codes)

**Error Handling:**
- Custom exceptions are cleaner than HTTPException everywhere
- Balance between custom exceptions (business logic) vs HTTPException (simple validation)
- Exception handlers centralize error response formatting
- Don't expose internal details (user_ids, etc.) in error messages

**Logging:**
- Log at strategic points: operation start, warnings/errors, success
- Include context (user_id, task_id) for audit trail
- Use appropriate log levels (INFO for normal, WARNING for suspicious, ERROR for failures)
- Logging helped debug issues during testing

**General:**
- Multi-user isolation is harder than it looks (have to check ownership everywhere)
- JWT tokens are stateless (server doesn't track sessions)
- Pydantic validation catches most bad input before it reaches endpoints
- FastAPI dependency injection is powerful for reusable logic

## Resources

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Pytest Documentation](https://docs.pytest.org/)
- [Real Python](https://realpython.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

## Learning Context

This is my first major Python web application. I'm learning backend development skills to add onto my Linux, AWS, and Terraform knowledge.