# Task Manager API - Learning Project

A learning project building a REST API with FastAPI and PostgreSQL. This tracks my progression from in-memory storage through database integration to a secure multi-user system.

## What I've Learned

**Phase 1: FastAPI Fundamentals**
- Building APIs with FastAPI
- Data validation with Pydantic
- REST principles (CRUD operations, proper HTTP methods/status codes)
- Query parameters for filtering, search, sorting, and pagination
- Working with dates and timestamps in Python
- Code organization (separating models, routes, database logic)

**Phase 2: Database & Persistence**
- PostgreSQL installation and configuration
- SQL fundamentals (DDL and DML)
- SQLAlchemy ORM (models, sessions, queries)
- Database connection management and dependency injection
- Alembic migrations for schema versioning
- Migrating from in-memory to persistent storage

**Phase 3: Authentication & Authorization**
- User registration and login systems
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes using FastAPI dependencies
- Multi-user data isolation
- Environment variable management for secrets
- OAuth2 Bearer token flow

## Current Features

- **Task Management:** Full CRUD operations with advanced filtering, search, sorting, and pagination
- **Tag System:** Add/remove tags, filter by tags
- **Due Dates:** Track due dates with overdue detection
- **Bulk Operations:** Update multiple tasks simultaneously
- **Statistics:** Analytics on task completion, priorities, and tags
- **User Authentication:** Secure registration and login with JWT tokens
- **Multi-User Support:** Users can only access their own tasks
- **Password Security:** Bcrypt hashing with salting
- **Database:** PostgreSQL with SQLAlchemy ORM and Alembic migrations

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL

### Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic sqlalchemy psycopg2-binary alembic \
  "passlib[bcrypt]" "python-jose[cryptography]" python-dotenv

# Set up PostgreSQL database
sudo -i -u postgres
psql
CREATE DATABASE task_manager;
CREATE USER task_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE task_manager TO task_user;
\q
exit

# Create .env file for secrets
cat > .env << EOF
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOF

# Run migrations
alembic upgrade head

# Run the API
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` to see the interactive API documentation.

## Project Structure
```
task-manager-api/
├── main.py              # App setup and entry point
├── models.py            # Pydantic models (API validation)
├── db_models.py         # SQLAlchemy models (database tables)
├── db_config.py         # Database connection and session management
├── auth.py              # Password hashing and JWT utilities
├── dependencies.py      # FastAPI dependencies (authentication)
├── .env                 # Environment variables (not in Git)
├── alembic/             # Database migrations
│   └── versions/        # Migration files
├── alembic.ini          # Alembic configuration
├── routers/
│   ├── tasks.py         # Task endpoints
│   └── auth.py          # Authentication endpoints
└── notes/
    ├── 01-fastapi.md    # FastAPI cheatsheet
    ├── 02-databases.md  # Database cheatsheet
    └── 03-auth.md       # Authentication cheatsheet
```

## Example Usage

### Authentication
```bash
# Register a new user
POST /auth/register
{
  "username": "chris",
  "email": "chris@example.com",
  "password": "securepass123"
}

# Login to get access token
POST /auth/login
{
  "username": "chris",
  "password": "securepass123"
}
# Returns: {"access_token": "eyJhbGc...", "token_type": "bearer"}

# Use token in subsequent requests
GET /tasks
Headers: Authorization: Bearer eyJhbGc...
```

### Task Management
```bash
# Get all tasks (filtered by authenticated user)
GET /tasks?priority=high&completed=false&sort_by=due_date

# Search for tasks
GET /tasks?search=fastapi

# Get overdue tasks
GET /tasks?overdue=true

# Create a task (automatically assigned to authenticated user)
POST /tasks
{
  "title": "Learn SQLAlchemy",
  "description": "Master ORM concepts",
  "priority": "high",
  "due_date": "2025-12-01",
  "tags": ["learning", "backend"]
}

# Add tags to existing task
POST /tasks/1/tags
["urgent", "review"]

# Bulk update multiple tasks
PATCH /tasks/bulk
{
  "task_ids": [1, 2, 3],
  "updates": {"completed": true}
}

# Get task statistics
GET /tasks/stats
```

## Database Migrations
```bash
# Generate migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

## Security Notes

- Passwords are hashed with bcrypt before storage
- JWT tokens expire after 60 minutes (configurable)
- SECRET_KEY is stored in `.env` file (not committed to Git)
- All task endpoints require authentication
- Users can only access their own tasks

## What I'm Working On Next

**Testing & Error Handling**
- Unit tests with pytest
- Integration tests for endpoints
- Proper error handling and logging
- Input validation edge cases

## Learning Notes

- Multi-user system with proper data isolation
- JWT-based stateless authentication
- Following security best practices (password hashing, environment variables)
- Understanding the difference between authentication and authorization
- Using FastAPI dependency injection for reusable authentication logic
- Following a structured 16-week backend development roadmap

## Resources I'm Using

- [FastAPI Official Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/en/20/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [JWT.io](https://jwt.io/)
- [Real Python](https://realpython.com/)