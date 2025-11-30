# Task Manager API

A REST API built with FastAPI and PostgreSQL as I learn backend development. This is my first major Python web application, built over the course of a 16-week learning roadmap.

---

## What I Built

A full-featured task management API with:
- Complete CRUD operations with advanced filtering and search
- User authentication with JWT tokens
- Multi-user support (users only see their own tasks)
- File attachments (upload images/documents to tasks)
- Background tasks (async notifications and cleanup)
- Redis caching 
- Rate limiting 
- 38 passing tests with pytest
- Production-quality logging

---

## Tech Stack

- **Backend:** FastAPI, Python 3.12
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Caching:** Redis
- **Auth:** JWT tokens, bcrypt password hashing
- **Testing:** pytest with test database isolation
- **Environment:** Xubuntu VM

---

## Features

**Tasks:**
- Create, read, update, delete tasks
- Filter by completion, priority, tags, overdue status
- Search across title and description
- Sort by any field, paginate results
- Bulk update multiple tasks at once
- Task statistics (completion rate, priority breakdown, tag counts)

**Tags:**
- Add/remove tags from tasks
- Filter tasks by tag

**Files:**
- Upload files to tasks (images, PDFs, documents)
- Download files
- Delete files
- Automatic cleanup when task is deleted

**Authentication:**
- Register new accounts
- Login with JWT tokens
- All endpoints protected (except registration/login)
- Users can only access their own data

**Performance:**
- Redis caching on stats endpoint (5x faster)
- Background tasks for slow operations
- Rate limiting to prevent abuse

---

## API Endpoints

### Authentication
```
POST /auth/register  - Create account
POST /auth/login     - Get JWT token
```

### Tasks
```
GET    /tasks                 - List all tasks (with filters/search/pagination)
POST   /tasks                 - Create task
GET    /tasks/stats           - Get statistics (cached in Redis)
PATCH  /tasks/bulk            - Update multiple tasks
GET    /tasks/{id}            - Get single task
PATCH  /tasks/{id}            - Update task
DELETE /tasks/{id}            - Delete task
POST   /tasks/{id}/tags       - Add tags
DELETE /tasks/{id}/tags/{tag} - Remove tag
```

### Files
```
POST   /tasks/{id}/files   - Upload file
GET    /tasks/{id}/files   - List files
GET    /files/{id}         - Download file
DELETE /files/{id}         - Delete file
```

---

## What I Learned

**FastAPI Basics**
- REST API design and HTTP methods
- Request/response validation with Pydantic
- Query parameters and path parameters
- Status codes and error responses

**Database Integration**
- PostgreSQL setup and SQL basics
- SQLAlchemy ORM (models, sessions, queries)
- Database migrations with Alembic
- Foreign keys and relationships

**Authentication**
- JWT token generation and validation
- Password hashing (never store plain passwords!)
- Protected routes with dependencies
- Multi-user data isolation

**Testing & Error Handling**
- pytest with test database isolation
- Writing tests for CRUD, auth, authorization
- Custom exception classes
- Centralized error handling
- Production logging (found and fixed bugs!)

**Advanced Features**
- Background tasks (async operations that don't block responses)
- File uploads with validation and storage
- Redis caching (massive performance improvement)
- Rate limiting (prevent brute force and spam)
- SQLAlchemy relationships in action

---

## Key Learnings

**Testing revealed bugs:**
- `completed` field wasn't respecting input
- Wrong status codes (401 vs 403)
- Registration returning incorrect status

**Multi-user isolation:**
- Every query needs to filter by user_id
- Every single-resource endpoint needs ownership check
- Easy to miss and create security holes

**Relationships make database queries much easier:**
- `task.files` gives you all files automatically
- `file.task.user_id` lets you traverse relationships
- Confusing at first, powerful once you get it

**Caching is simple but effective:**
- Cache MISS: 1.7ms | Cache HIT: 0.35ms
- Invalidate cache when data changes
- Noticeable impact on read-heavy endpoints

**Background tasks:**
- Don't make users wait for slow operations
- Great for notifications, cleanup, analytics
- Just add `BackgroundTasks` dependency

---

## Development Setup

```bash
# Clone repo
git clone https://github.com/odysian/task-manager-api
cd task-manager-api

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up databases (PostgreSQL)
createdb task_manager
createdb task_manager_test

# Set up Redis
sudo apt install redis-server
sudo systemctl start redis-server

# Create .env file with secrets
echo "SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" > .env
echo "ALGORITHM=HS256" >> .env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=60" >> .env

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

Visit http://localhost:8000/docs for interactive API documentation.

---

## Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py
```

**Test coverage:** 38 tests covering auth, CRUD operations, validation, query parameters, stats, bulk operations, and tags.

---

## Project Structure

```
task-manager-api/
├── main.py                    # App setup, exception handlers
├── models.py                  # Pydantic models (request/response)
├── db_models.py               # SQLAlchemy models (database tables)
├── db_config.py               # Database connection
├── redis_config.py            # Redis caching
├── rate_limit_config.py       # Rate limiting
├── auth.py                    # Password hashing, JWT
├── dependencies.py            # Authentication dependency
├── exceptions.py              # Custom exceptions
├── logging_config.py          # Logging setup
├── background_tasks.py        # Background task functions
├── routers/
│   ├── auth.py               # Registration, login
│   ├── tasks.py              # Task endpoints
│   └── files.py              # File upload/download
├── tests/                    # 38 pytest tests
├── uploads/                  # Uploaded files (not in Git)
├── logs/                     # Application logs (not in Git)
└── alembic/                  # Database migrations
```

---

## Current Status

**Completed:**  Advanced Features

**Next Up:** Deployment
- Docker containerization
- CI/CD pipeline
- Production deployment

---

## Learning Context

This is my first major Python web application. I'm learning backend development skills to add onto my Linux, AWS, and Terraform knowledge.

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Redis Documentation](https://redis.io/docs/)
- [Real Python](https://realpython.com/)
