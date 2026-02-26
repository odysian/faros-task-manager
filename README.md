# FAROS Task Manager

A task management application with multi-user collaboration, file attachments, comments, activity logging, and email notifications.

## Structure

```
faros-task-manager/
├── backend/    FastAPI REST API (Python 3.12+)
└── frontend/   React SPA (Vite 7, JavaScript)
```

- **Backend**: [backend/README.md](backend/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)

## Quick Start

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
cp .env.example .env  # then fill in values
alembic upgrade head
uvicorn main:app --reload
```

API available at http://localhost:8000 with docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:8000
npm run dev
```

App available at http://localhost:5173

## Deployment

- **Backend**: AWS EC2 (primary) / Render (free tier)
- **Frontend**: AWS CloudFront + S3 (primary) / Vercel (alternative)
- **Infrastructure**: Terraform configs in `backend/terraform/`
