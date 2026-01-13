# FAROS Task Manager

Task management app I built to learn backend development with FastAPI, PostgreSQL, Redis, and AWS.

**Live Demo:** https://faros.odysian.dev  
**Frontend Repo:** https://github.com/odysian/task-manager-frontend

## What It Does

- Create and manage tasks with tags, priorities, and descriptions
- Share tasks with other users (Owner/Edit/View permissions)
- Upload files to tasks (stored in S3)
- Add comments to tasks
- Activity logging for all actions
- Email notifications via AWS SNS

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL with SQLAlchemy
- Redis for caching
- JWT authentication
- AWS S3 for file storage
- AWS SNS for emails

**Frontend:**
- React with Vite
- Tailwind CSS
- Deployed on CloudFront + S3

**Infrastructure:**
- Terraform for AWS resources
- Docker for containerization
- GitHub Actions for CI/CD
- Deployed on AWS (EC2, RDS, ElastiCache)

## Features

**Task Management:**
- CRUD operations with filtering and search
- Bulk updates
- Tag system
- Task statistics

**Collaboration:**
- Share tasks with permission levels
- Comments on shared tasks
- User search

**Other:**
- File uploads/downloads
- Activity timeline
- Email notifications
- Redis caching on stats endpoint

## What I Learned

### Backend Development
- Building REST APIs with FastAPI
- Database design and SQLAlchemy ORM
- JWT authentication and bcrypt password hashing
- Multi-user permissions and data isolation
- Background tasks for async operations
- Service layer architecture

### Cloud & Infrastructure
- Deploying to AWS (EC2, RDS, ElastiCache, S3, SNS)
- Infrastructure as Code with Terraform
- SSL certificates (Let's Encrypt and ACM)
- NGINX as a reverse proxy
- Docker containerization
- Setting up CI/CD pipelines

### Testing & Quality
- Writing tests with pytest (71 tests)
- Test database isolation
- Mocking external services
- GitHub Actions for automated testing

### Performance
- Redis caching patterns (5x speedup on stats)
- Preventing N+1 queries
- Database indexing

### Key Insights
- **Activity logging:** Had to learn about transaction safety - log before committing
- **Permissions:** Centralizing permission checks prevents bugs
- **Testing:** Found several bugs I would have missed (registration validation, status codes)
- **Caching:** Simple Redis caching made a big difference on frequently accessed endpoints
- **Background tasks:** Don't make users wait for slow operations like sending emails
- **Deployment:** Blue-green deployments are more complex but worth it for zero downtime

## Running Locally

### Prerequisites
- Python 3.12+
- PostgreSQL
- Redis

### Setup

```bash
# Clone repository
git clone https://github.com/odysian/task-manager-api
cd task-manager-api

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up database
createdb task_manager

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload
```

API documentation available at http://localhost:8000/docs

### Using Docker Compose

```bash
# Start all services (PostgreSQL, Redis, API)
docker-compose up

# Run in background
docker-compose up -d
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov
```

## Project Structure

```
task-manager-api/
├── main.py              # FastAPI app setup
├── routers/             # API endpoints
├── services/            # Business logic
├── core/                # Security, caching, logging
├── schemas/             # Pydantic models
├── db_models.py         # SQLAlchemy models
├── tests/               # 71 pytest tests
├── terraform/           # Infrastructure as Code
├── alembic/             # Database migrations
└── .github/workflows/   # CI/CD pipelines
```

## API Endpoints

Full interactive API documentation at https://api.faros.odysian.dev/docs

**Main endpoints:**
- `/auth/*` - Registration, login, password reset
- `/tasks/*` - Task CRUD, filtering, search, sharing
- `/comments/*` - Add and manage comments
- `/files/*` - Upload and download files
- `/activity/*` - Activity logs and timeline

## Deployment

Deployed on AWS using Terraform:
- EC2 for the API with NGINX
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage
- CloudFront + S3 for frontend
- GitHub Actions handles deployments

## Contact

**Chris**
- GitHub: [@odysian](https://github.com/odysian)
- Website: https://odysian.dev
- Email: c.colosimo@odysian.dev

## License

MIT License - feel free to use this as a learning reference.