# Task Manager API

A REST API built with FastAPI, PostgreSQL, and Redis. This is my first major Python web application, built over the course of an accelerated 16-week learning roadmap. I'm learning backend development skills to add onto my Linux, AWS, and Terraform knowledge.

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
- Automated CI/CD pipeline with zero-downtime deployments

---

## Tech Stack

- **Backend:** FastAPI, Python 3.12
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Caching:** Redis
- **Auth:** JWT tokens, bcrypt password hashing
- **Testing:** pytest with test database isolation
- **Deployment:** Docker, GitHub Actions, GitHub Container Registry
- **Infrastructure:** AWS (EC2, RDS, ElastiCache, S3), Terraform
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

**CI/CD:**
- Automated testing on pull requests
- Zero-downtime deployments with blue-green strategy
- Docker image caching (20 second builds)
- Automatic rollback on deployment failure

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
- SQLAlchemy ORM (models, sessions, queries)
- Database migrations with Alembic

**Authentication**
- JWT token generation and validation
- Password hashing
- Protected routes with dependencies
- Multi-user data isolation

**Testing & Error Handling**
- pytest with test database isolation
- Writing tests for CRUD, auth, authorization
- Custom exception classes
- Centralized error handling
- Production logging (helped to fix several bugs)

**Advanced Features**
- Background tasks (async operations that don't block responses)
- File uploads with validation and storage
- Redis caching (noticeable performance improvement)
- Rate limiting (prevent brute force and spam)
- SQLAlchemy relationships in action

**CI/CD & Deployment**
- GitHub Actions for automated testing and deployment
- Docker layer caching (3min → 20sec builds)
- Blue-green deployment for zero downtime
- Secrets management with GitHub Secrets
- Container registries for image versioning

**Infrastructure as Code**
- Reinforced Terraform concepts from previous AWS project
- More practice with user_data scripts

---

## Key Learnings

**Testing revealed bugs:**
- `completed` field wasn't respecting input
- Wrong status codes (401 vs 403)
- Registration returning incorrect status

**Multi-user isolation:**
- Every query needs to filter by user_id
- Every single-resource endpoint needs ownership check

**Relationships make database queries much easier:**
- `task.files` gives you all files automatically
- `file.task.user_id` lets you traverse relationships
- Was a bit confusing at first

**Caching is simple but effective:**
- Cache MISS: 1.7ms | Cache HIT: 0.35ms
- Invalidate cache when data changes
- Noticeable impact on read-heavy endpoints

**Background tasks:**
- Don't make users wait for slow operations
- Great for notifications, cleanup, analytics
- Just add `BackgroundTasks` dependency

**Blue-green deployment:**
- Old version keeps serving while new version starts
- Health checks verify new version works before switching
- Automatic rollback if new version fails
- Zero downtime for users

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
# Use .env.example as template

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
│   ├── health.py             # Basic health check
│   └── files.py              # File upload/download
├── tests/                    # 38 pytest tests
├── uploads/                  # Uploaded files (not in Git)
├── logs/                     # Application logs (not in Git)
├── terraform/                # Infrastructure as Code
└── alembic/                  # Database migrations
```

---

## Current Status

**Completed:** CI/CD Pipeline (Phase 4)

**What's Working:**
- Automated testing on every pull request
- Zero-downtime deployments on merge to main
- Docker builds with layer caching (20 sec)
- Blue-green deployment with automatic rollback
- Production API live on AWS

**Next Up:** 
- Monitoring and alerting (CloudWatch)
- Multi-environment setup (staging + production)
- Database backups and disaster recovery

---

## Deployment

### Architecture
```
                             / RDS PostgreSQL
Internet -> EC2 (Docker) -> │  ElastiCache Redis  
                             \ S3 (file storage)
                             
GitHub -> Actions -> GHCR -> EC2 (pull & deploy)
```

### CI/CD Pipeline

**On Pull Request:**
- GitHub Actions spins up PostgreSQL and Redis
- Runs 38 pytest tests
- Reports pass/fail status on PR

**On Merge to Main:**
1. Build job: Creates Docker image with layer caching, pushes to GitHub Container Registry
2. Deploy job: SSHs to EC2, pulls image, runs migrations, blue-green deployment
3. Total time: ~30-60 seconds, downtime: ~2 seconds

**Blue-Green Process:**
- New container starts on port 8001
- Health checks verify it's working (30 attempts)
- If healthy: switches to port 8000
- If unhealthy: automatic rollback

**Production URL:** http://35.173.172.18:8000/docs

### Local Development with Docker
```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up

# Run in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

Access API at: http://localhost:8000/docs

### Infrastructure as Code (Terraform)

**13 AWS resources** deployed with one command:
- EC2 with IAM role for S3 access (no hardcoded credentials)
- RDS PostgreSQL + ElastiCache Redis
- 3 Security Groups with proper isolation
- Elastic IP for static addressing
- Automated bootstrap via user data script

```bash
cd terraform
terraform init
terraform plan
terraform apply  # ~10-15 minutes
```

**What the bootstrap script does:**
- Installs Docker
- Clones repo from GitHub
- Waits for RDS to be ready
- Creates database (idempotent)
- Runs migrations
- Starts application container


---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Redis Documentation](https://redis.io/docs/)
- [Real Python](https://realpython.com/)