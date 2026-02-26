# FAROS Task Manager

Task management app built to learn backend development with FastAPI, PostgreSQL, Redis, and AWS.

**Live Demo:** https://faros.odysian.dev

<details>
  <summary><strong>Watch the Mobile Demo</strong> (Click to Expand)</summary>

  <br>

  https://github.com/user-attachments/assets/5ed8dd35-2fa7-44b5-a72b-0d8d50913cad

  <br>
</details>

## What It Does

- Create and manage tasks with tags, priorities, and due dates
- Share tasks with other users (Owner/Edit/View permissions)
- Upload files to tasks (stored in S3)
- Add comments to tasks
- Activity logging for all actions
- Email notifications via Resend / AWS SES
- Task statistics with Redis caching
- Filtering, search, and bulk updates

## Tech Stack

**Backend:**
- FastAPI (Python 3.12+)
- PostgreSQL with SQLAlchemy (schema-isolated under `faros`)
- Redis for caching task statistics
- JWT authentication with bcrypt
- AWS S3 for file storage
- Resend / AWS SES for emails
- 71 pytest tests (real DB with transaction rollback)

**Frontend:**
- React 19 with Vite 7
- Tailwind CSS v4
- Axios with token interceptor
- State-based routing (no React Router)

**Infrastructure:**
- Terraform for AWS resources (EC2, RDS, ElastiCache, S3, CloudFront)
- Docker for local development services
- GitHub Actions for CI/CD
- Alternative free-tier deployment on Render

## What I Learned

### Backend Development
- Building REST APIs with FastAPI and dependency injection
- Database design and SQLAlchemy ORM (schema isolation for shared databases)
- JWT authentication and bcrypt password hashing
- Multi-user permissions and data isolation (owner/edit/view hierarchy)
- Background tasks for non-blocking email notifications
- Service layer architecture with activity logging

### Cloud & Infrastructure
- Deploying to AWS (EC2, RDS, ElastiCache, S3, SNS)
- Infrastructure as Code with Terraform
- SSL certificates (Let's Encrypt and ACM)
- Docker containerization and blue-green deployments
- CI/CD pipelines with GitHub Actions

### Testing & Performance
- Test-driven development with pytest
- Mocking external services (S3, email)
- Redis caching patterns (5x speedup on stats endpoint)
- Preventing N+1 queries with proper query design
- Database indexing for filtered/sorted queries

### Key Insights
- **Activity logging:** Flush (don't commit) per log entry so it batches atomically with the parent transaction
- **Permissions:** Centralizing permission checks in one dependency prevents authorization bugs
- **Caching:** Simple Redis caching with cache invalidation on mutations made a big difference
- **Background tasks:** FastAPI's BackgroundTasks keeps email notifications from blocking responses
- **Schema isolation:** Multiple portfolio projects sharing one free-tier database via PostgreSQL schemas

## Running Locally

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 16
- Redis 7

### Using Docker (database services only)

```bash
docker compose up -d postgres redis
```

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit with your database credentials
alembic upgrade head
uvicorn main:app --reload
```

API runs at http://localhost:8000 with docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

App runs at http://localhost:5173

## Testing

```bash
cd backend
pytest -v
```

## Project Structure

### Backend
```
backend/
├── main.py              # FastAPI app setup
├── db_models.py         # SQLAlchemy models
├── db_config.py         # Database engine and session
├── dependencies.py      # Auth and permission dependencies
├── routers/             # API endpoints (auth, tasks, sharing, comments, files, activity, notifications)
├── services/            # Business logic (activity logging, background tasks, notifications)
├── schemas/             # Pydantic request/response models
├── core/                # Security, caching, storage, email
├── tests/               # 71 pytest tests
├── alembic/             # Database migrations
└── terraform/           # AWS infrastructure as code
```

### Frontend
```
frontend/
├── src/
│   ├── App.jsx          # View router and auth state
│   ├── api.js           # Axios client with token interceptor
│   ├── components/      # Auth, Tasks, Sharing, Comments, Files, Activity, Settings
│   ├── services/        # API call abstractions
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Theme tokens
```

## API Endpoints

Full interactive documentation at https://api.faros.odysian.dev/docs

- `/auth/*` — Registration, login, password reset, email verification
- `/tasks/*` — Task CRUD, filtering, search, stats, bulk updates
- `/tasks/{id}/share` — Sharing with permission levels
- `/tasks/{id}/comments` — Comments on tasks
- `/tasks/{id}/files` — File uploads and downloads
- `/activity/*` — Activity logs and stats
- `/notifications/*` — Email notification preferences

## Deployment

**Primary (AWS):**
- EC2 for API with NGINX reverse proxy
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage and frontend hosting
- CloudFront CDN for frontend
- Managed via Terraform

**Alternative (Free Tier):**
- Backend on Render with shared PostgreSQL (`faros` schema isolation)
- Frontend on Vercel or CloudFront + S3

## Contact

**Chris**
- GitHub: [@odysian](https://github.com/odysian)
- Website: https://odysian.dev
- Email: c.colosimo@odysian.dev

## License

MIT License - feel free to use this as a learning reference.
